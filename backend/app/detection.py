import torch
from ultralytics import YOLO
from PIL import Image
import os
import tempfile
import cv2
import numpy as np

model = YOLO("model/best.pt")  # Carga del modelo entrenado

# Diccionario de letras para traducción
LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
          'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
          'u', 'v', 'w', 'y', 'z']

def detect_braille(image_file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_img:
        image_file.save(temp_img.name)
        image = Image.open(temp_img.name)

        results = model(temp_img.name)[0]
        detections = []

        for box in results.boxes:
            cls_id = int(box.cls.item())
            label = LABELS[cls_id] if cls_id < len(LABELS) else 'unknown'
            confidence = float(box.conf.item())
            x1, y1, x2, y2 = map(float, box.xyxy[0])

            detections.append({
                'label': label,
                'confidence': round(confidence, 2),
                'bbox': [x1, y1, x2, y2]
            })

        # Ordenar por eje X para mantener el orden de lectura
        detections.sort(key=lambda x: x['bbox'][0])
        translated_text = ''.join([d['label'] for d in detections])

        return {
            'detections': detections,
            'translated_text': translated_text
        }
