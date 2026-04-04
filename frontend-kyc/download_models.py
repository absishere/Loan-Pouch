import os
import urllib.request

MODELS_DIR = "frontend/public/models"

# URLs for the models
BASE_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"

FILES = [
    # SSD Mobilenet v1 (Face Detection)
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    
    # Face Landmark 68 (Facial Features)
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    
    # Face Recognition (Face Comparison)
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
]

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    for file_name in FILES:
        url = BASE_URL + file_name
        dest_path = os.path.join(MODELS_DIR, file_name)
        
        if not os.path.exists(dest_path):
            print(f"Downloading {file_name}...")
            try:
                urllib.request.urlretrieve(url, dest_path)
                print(f"Successfully downloaded {file_name}")
            except Exception as e:
                print(f"Failed to download {file_name}: {e}")
        else:
            print(f"{file_name} already exists. Skipping.")
            
    print("All models processed.")

if __name__ == "__main__":
    main()
