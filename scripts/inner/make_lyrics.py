import whisper
import demucs.separate
import whisper.tokenizer

# iterate over tracks folder, copy each audio.mp3 into a new folder and name them {id}.mp3 instead
import os

import shutil

skip_lyrics = []

import json

with open("../skip_lyrics.json", "r") as f:
    skip_lyrics = json.load(f)

def copy_and_rename_audio_files(parent_folder, new_folder):
    #  delete the new folder if it exists
    if os.path.exists(new_folder):
        shutil.rmtree(new_folder)

    os.makedirs(new_folder, exist_ok=True)

    ids = []

    for subfolder in os.listdir(parent_folder):
        folder_path = os.path.join(parent_folder, subfolder)
        audio_file = os.path.join(folder_path, "audio.mp3")

        # if "lyrics.json" exists, skip this folder
        if os.path.isfile(os.path.join(folder_path, "lyrics.json")):
            continue

        # if the folder is in the skip_lyrics list, skip it
        if subfolder in skip_lyrics:
            print(f"Skipping {subfolder}")
            continue

        ids.append(subfolder)

        if os.path.isdir(folder_path) and os.path.isfile(audio_file):
            new_audio_file = os.path.join(new_folder, f"{subfolder}.mp3")
            shutil.copy(audio_file, new_audio_file)
            print(f"Copied {audio_file} to {new_audio_file}")
    return ids

ids = copy_and_rename_audio_files("../../src/lib/content/tracks", "../tracks")

print(ids)

demucs.separate.main([
    "--mp3", "--two-stems", "vocals", "--out", "../separated",
    *map(lambda id: f"../tracks/{id}.mp3", ids)
])

model = whisper.load_model("medium.en", device="cuda")

PROMPT = """\
Write karaoke lyrics for a song about LeBron James.
Aliases: Bronny, LeBronny
"""

def transcribe_audio(file_path):
    print(f"Transcribing {file_path}")
    result = model.transcribe(
        file_path,
        word_timestamps=True,
        initial_prompt=PROMPT,
        verbose=True,
        prepend_punctuations="\"'“¿([{-",
        append_punctuations="\"'.。,，!！?？:：”)]}、",
        language="en",
        task="transcribe",
        # do not suppress tokens
        suppress_tokens=list(whisper.tokenizer.get_tokenizer(
            multilingual=False,
            num_languages=1,
        ).non_speech_tokens)
    )
    print(f"Transcribed {file_path}")
    out = []
    index = 0

    start = 0
    end = 0

    # convert the results into a list of list of dicts with the structure:
    # text: "text", start: start, end: end
    for segment in result["segments"]:
        words = []
        for word in segment["words"]:
            # if the word starts with a space, remove it and add it to the previous word if it exists
            if word["word"].lstrip() != word["word"]:
                if words:
                    words[-1]["text"] += " "
                word["word"] = word["word"].lstrip()

            stripped = word["word"].strip()
            # if word starts with a capital letter, (after trimming), trim it and make a new line
            if len(stripped) > 1 and stripped[0].isupper():
                if words:
                    out.append({
                        "start": start,
                        "end": end,
                        "words": words
                    })
                    words = []
                    start = word["start"]
                    end = word["end"]
                start = word["start"]
                end = word["end"]
                # strip whitespace only from the front
                word["word"] = word["word"].lstrip()

            end = max(end, word["end"])
            start = min(start, word["start"])

            word["start"] = word["start"] - start
            word["end"] = word["end"] - start

            # if the word has the same start time as the previous token, merge it
            if words and (word["end"] == words[-1]["end"] or word["start"] == words[-1]["start"]):
                words[-1]["text"] += word["word"]
                words[-1]["end"] = word["end"]
                continue

            words.append({
                "text": word["word"],
                "start": word["start"],
                "end": word["end"],
                "index": index
            })
            index += 1
        if words:
            out.append({
                "start": start,
                "end": end,
                "words": words
            })
    return out

# iterate over ids
for id in ids:
    file_path = f"../separated/htdemucs/{id}/vocals.mp3"
    result = transcribe_audio(file_path)
    # save the result to a json file
    with open(f"../../src/lib/content/tracks/{id}/lyrics.json", "w") as f:
        f.write(json.dumps(result, indent=4))
