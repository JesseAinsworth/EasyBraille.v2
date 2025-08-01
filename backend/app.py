from flask import Flask, request, jsonify
from flask_cors import CORS
from model.yolov8_detector import load_model, detect_braille

app = Flask(__name__)
CORS(app)

# Cargar modelo al iniciar
# app.py
model = load_model("model/best.pt")


@app.route("/")
def index():
    return jsonify({"message": "EasyBraille API funcionando correctamente"})

@app.route("/api/braille-image", methods=["POST"])
def braille_image():
    if "image" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    image = request.files["image"]
    if image.filename == "":
        return jsonify({"error": "Nombre de archivo inválido"}), 400

    try:
        result = detect_braille(model, image)
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error al procesar imagen: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
