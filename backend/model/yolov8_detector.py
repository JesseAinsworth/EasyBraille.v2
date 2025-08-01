from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io

# Nombres de clases en orden
CLASS_NAMES = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'y', 'z'
]

def load_model(model_path):
    return YOLO(model_path)

def detect_braille(model, image_file):
    # Leer imagen desde el archivo
    image_bytes = image_file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    # Realizar detección
    results = model(image_np)[0]

    detections = []
    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        label = CLASS_NAMES[cls_id]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        detections.append({
            "label": label,
            "confidence": conf,
            "box": [x1, y1, x2, y2]
        })

    # Ordenar detecciones por coordenadas (de izquierda a derecha, arriba a abajo)
    detections.sort(key=lambda d: (d["box"][1] // 20, d["box"][0]))

    texto_traducido = ''.join([d["label"] for d in detections])
    return {
        "text": texto_traducido,
        "detections": detections
    }
