import os
import numpy as np
import librosa
import tensorflow_hub as hub
import tensorflow as tf
import pandas as pd

# Load YAMNet model and labels
model = hub.load('https://tfhub.dev/google/yamnet/1')
class_map_path = tf.keras.utils.get_file(
    'yamnet_class_map.csv',
    'https://raw.githubusercontent.com/tensorflow/models/refs/heads/master/research/audioset/yamnet/yamnet_class_map.csv'
)
class_names = pd.read_csv(class_map_path)['display_name'].tolist()

# Function to classify a single file
def classify_audio(file_path, top_n=10):
    try:
        audio, sr = librosa.load(file_path, sr=16000, mono=True)
        scores, _, _ = model(audio)
        mean_scores = tf.reduce_mean(scores, axis=0).numpy()
        top_indices = mean_scores.argsort()[-top_n:][::-1]  # Top N indices sorted descending
        top_tags = [(class_names[i], mean_scores[i]) for i in top_indices]
        return top_tags
    except Exception as e:
        return [(f"Error: {e}", None)]


import json

all_tags = set()
allowed_tags = set()

# read allowed_tags from `filter_tags.json`
with open('scripts/filter_tags.json', 'r') as f:
    allowed_tags = set(json.load(f))

tag_map = {}

# read tag_map from `tag_map.json`

with open('scripts/tag_map.json', 'r') as f:
    tag_map = json.load(f)

# Iterate over subfolders
def classify_all_tracks_in_folder(parent_folder):
    results = []
    for subfolder in os.listdir(parent_folder):
        folder_path = os.path.join(parent_folder, subfolder)
        audio_file = os.path.join(folder_path, "audio.mp3")

        done_tags = []

        if os.path.isdir(folder_path) and os.path.isfile(audio_file):
            tags = classify_audio(audio_file, top_n=10)
            for tag, score in tags:
                all_tags.add(tag)
                if tag not in allowed_tags:
                    continue
                if tag not in tag_map:
                    print(f"Tag {tag} not in tag_map")
                    continue
                tag = tag_map[tag]

                if tag not in done_tags:
                    done_tags.append(tag)
        results.append({
            "id": subfolder,
            "tags": done_tags
        })
    return results

# Example usage
parent_folder = "/path/to/your/folders"
results = classify_all_tracks_in_folder("src/lib/content/tracks")


# Save results to a json file
with open('results.json', 'w') as f:
    json.dump(results, f)

# write all tags to json
with open('scripts/all_tags.json', 'w') as f:
    json.dump(list(all_tags), f)

