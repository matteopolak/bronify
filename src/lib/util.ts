export function formatSeconds(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function randomElement<T>(array: T[]): T {
	if (array.length === 0) {
		throw new Error('Array is empty');
	}

	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex];
}

export function debounce<T extends (...args: any[]) => void>(
	callback: T,
	wait: number,
	immediate = false
) {
	let timeout: ReturnType<typeof setTimeout> | null;

	return function <U>(this: U, ...args: Parameters<typeof callback>) {
		const context = this;
		const later = () => {
			timeout = null;

			if (!immediate) {
				callback.apply(context, args);
			}
		};
		const callNow = immediate && !timeout;

		if (typeof timeout === 'number') {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);

		if (callNow) {
			callback.apply(context, args);
		}
	};
}
