import os
from datetime import datetime

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def save_image(image_file):
    filename = datetime.now().strftime("%Y%m%d%H%M%S") + ".png"
    path = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(path)
    return path
