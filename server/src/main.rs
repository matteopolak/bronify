use std::{
	net::SocketAddr,
	ops::ControlFlow,
	path::{Path, PathBuf},
	sync::{Arc, mpsc},
};

// allows to extract the IP of connecting user
use axum::extract::{State, connect_info::ConnectInfo};
use axum::{
	Router,
	body::Bytes,
	extract::ws::{CloseFrame, Message, Utf8Bytes, WebSocket, WebSocketUpgrade},
	response::IntoResponse,
	routing::any,
};
// allows to split the websocket stream into separate TX and RX branches
use futures::{sink::SinkExt, stream::StreamExt};
use notify::Watcher;
use serde::{Deserialize, Serialize};
use tokio::sync::{RwLock, broadcast};

#[derive(Clone)]
struct AppState {
	content: Arc<RwLock<Bytes>>,
	rx: Arc<broadcast::Receiver<Bytes>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct Data {
	tracks: Vec<String>,
	active: usize,
}

#[derive(Debug)]
enum Error {
	Io(std::io::Error),
	Serde(serde_json::Error),
	Custom(&'static str),
}

fn read_file(path: &Path) -> Result<Bytes, Error> {
	let file = std::fs::File::open(path).map_err(Error::Io)?;
	let reader = std::io::BufReader::new(file);
	let data: Data = serde_json::from_reader(reader).map_err(Error::Serde)?;

	if data.active >= data.tracks.len() {
		return Err(Error::Custom("active index out of bounds"));
	}

	println!("{data:#?}");

	let string = serde_json::to_string(&data).map_err(Error::Serde)?;

	Ok(Bytes::from(string))
}

#[tokio::main]
async fn main() {
	let (tx, rx) = broadcast::channel(100_000);
	let path = PathBuf::from_iter(["content", "live.json"]);
	let bytes = read_file(&path).unwrap();

	let content = Arc::new(RwLock::new(bytes));

	let state = AppState {
		content: Arc::clone(&content),
		rx: Arc::new(rx),
	};

	let app = Router::new()
		.route("/ws", any(ws_handler))
		.with_state(state);

	tokio::task::spawn(async move {
		let (ntx, nrx) = mpsc::channel();
		let mut watcher = notify::recommended_watcher(ntx).unwrap();

		println!("Watching for changes in {path:?}...");

		watcher
			.watch(Path::new("content"), notify::RecursiveMode::NonRecursive)
			.unwrap();

		let mut last_update = std::time::Instant::now() - std::time::Duration::from_secs(1);

		loop {
			let Ok(res) = nrx.try_recv() else {
				// tell tokio to wait a bit
				tokio::time::sleep(std::time::Duration::from_millis(100)).await;
				continue;
			};

			match res {
				Ok(event) => {
					if !event.paths.iter().any(|p| p.ends_with("live.json")) {
						continue;
					}

					if last_update.elapsed() < std::time::Duration::from_secs(1) {
						continue;
					}

					last_update = std::time::Instant::now();

					// wait for the file to come back
					tokio::time::sleep(std::time::Duration::from_millis(100)).await;

					println!("file changed");

					let bytes = match read_file(&path) {
						Ok(bytes) => bytes,
						Err(e) => {
							eprintln!("Error reading file: {e:?}");
							continue;
						}
					};

					let _ = tx.send(bytes.clone());
					{
						let mut content = content.write().await;
						*content = bytes;
					}
				}
				Err(e) => {
					eprintln!("watch error: {e:?}");
					break;
				}
			}
		}
	});

	let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
		.await
		.unwrap();

	axum::serve(
		listener,
		app.into_make_service_with_connect_info::<SocketAddr>(),
	)
	.await
	.unwrap();
}

async fn ws_handler(
	State(state): State<AppState>,
	ws: WebSocketUpgrade,
	ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> impl IntoResponse {
	ws.on_upgrade(move |socket| handle_socket(state, socket, addr))
}

async fn handle_socket(state: AppState, mut socket: WebSocket, who: SocketAddr) {
	println!("New connection from {who}...");
	let data = state.content.read().await.clone();
	println!("Sending data to {who}...");

	if socket.send(Message::Binary(data)).await.is_ok() {
		println!("Sent data to {who}...");
	} else {
		println!("Could not send data to {who}!");
		return;
	}

	let mut rx = state.rx.resubscribe();

	loop {
		// while the socket is open, wait for incoming messages from rx and forward them
		tokio::select! {
			// receive a message from the socket
			Some(res) = socket.recv() => {
				let msg = match res {
					Ok(msg) => msg,
					Err(e) => {
						println!("Error receiving message from {who}: {e:?}");
						break;
					}
				};

				match msg {
					Message::Close(Some(CloseFrame { code, reason })) => {
						println!("Received close frame: {code:?} {reason:?}");
						break;
					}
					Message::Text(_) | Message::Binary(_) => {
						println!("Received message from {who}: {msg:?}");
					}
					_ => {}
				}
			}
			// receive a message from the rx channel
			Ok(data) = rx.recv() => {
				if socket.send(Message::Binary(data)).await.is_ok() {
					println!("Sent data to {who}...");
				} else {
					println!("Could not send data to {who}!");
					break;
				}
			}
			else => break,
		}
	}

	println!("Socket closed for {who}.");
}
