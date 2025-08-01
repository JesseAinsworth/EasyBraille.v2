from flask import Blueprint, request, jsonify
from ultralytics import YOLO
from PIL import Image
import os
import uuid
from .translate_utils import translate_detection_to_text

braille_image_bp = Blueprint("braille_image", __name__)
model = YOLO("model/best.pt")

@braille_image_bp.route("/api/braille-image", methods=["POST"])
def braille_image():
    if "image" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    image_file = request.files["image"]
    filename = f"temp_{uuid.uuid4().hex}.jpg"
    image_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)
    image_file.save(image_path)

    # Ejecutar detección
    try:
        results = model(image_path)
        class_ids = results[0].boxes.cls.cpu().numpy().astype(int)
        class_names = [results[0].names[i] for i in class_ids]

        translated_text = translate_detection_to_text(class_names)

        os.remove(image_path)
        return jsonify({
            "success": True,
            "text": translated_text,  # el frontend usa .text
            "detections": class_names
        })
    except Exception as e:
        return jsonify({"error": f"Error al procesar la imagen: {str(e)}"}), 500
