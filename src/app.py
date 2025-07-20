from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO
import io

app = Flask(__name__)
CORS(app)

# Carga del modelo YOLOv8 entrenado para Braille
model = YOLO(r"C:\Users\al222\Desktop\EasyBraille.v2-master\EasyBraille.v2-3-dev\EasyBraille.v2-3-dev\braille_train\v1\weights\best.pt")

@app.route("/api/braille-image", methods=["POST"])
def translate_braille():
    try:
        print("Petición recibida en /api/braille-image")
        
        file = request.files.get("image")
        if not file:
            return jsonify({"error": "No se envió ninguna imagen"}), 400

        print(f"Archivo recibido: {file.filename}")
        
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        results = model(image)

        print(f"Número de resultados: {len(results)}")
        print(f"Boxes detectadas: {results[0].boxes}")
        
        detections = []
        if results[0].boxes is not None:
            print(f"Número de boxes: {len(results[0].boxes)}")
            for i, box in enumerate(results[0].boxes):
                x = box.xywh[0][0].item()
                cls_id = int(box.cls[0])
                letra = results[0].names[cls_id]
                confidence = box.conf[0].item()
                print(f"Detección {i}: x={x}, cls_id={cls_id}, letra='{letra}', confianza={confidence}")
                detections.append((x, letra))
        else:
            print("No se detectaron boxes")

        detections.sort(key=lambda tup: tup[0])
        texto = "".join([letra for x, letra in detections])
        
        print(f"Texto final detectado: '{texto}'")
        
        return jsonify({"text": texto})
    
    except Exception as e:
        print(f"Error procesando imagen: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error al procesar la imagen: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)