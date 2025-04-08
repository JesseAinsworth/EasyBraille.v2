from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import os
import time
import logging
from dotenv import load_dotenv
import json
import threading
import traceback

# carga de variables 
load_dotenv()


logging.basicConfig(
    level=logging.DEBUG, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configurar CORS para permitirlas solicitudes
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuracion límite de tamaño de archivo
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Mapeo básico de caracteres Braille a letras en español
braille_to_spanish = {
    '⠁': 'a', '⠃': 'b', '⠉': 'c', '⠙': 'd', '⠑': 'e',
    '⠋': 'f', '⠛': 'g', '⠓': 'h', '⠊': 'i', '⠚': 'j',
    '⠅': 'k', '⠇': 'l', '⠍': 'm', '⠝': 'n', '⠕': 'o',
    '⠏': 'p', '⠟': 'q', '⠗': 'r', '⠎': 's', '⠞': 't',
    '⠥': 'u', '⠧': 'v', '⠺': 'w', '⠭': 'x', '⠽': 'y',
    '⠵': 'z', '⠀': ' ', ' ': ' '
}

# Almacenamiento en memoria para feedback y entrenamiento
feedback_data = []
training_status = {
    "is_training": False,
    "progress": 0,
    "last_trained": None
}

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint para verificar que el servicio está funcionando."""
    return jsonify({"status": "healthy", "version": "1.0.0"})

@app.route('/process-image', methods=['POST'])
def process_image():
    """
    Procesa una imagen para detectar y traducir texto Braille.
    
    Espera recibir una imagen en formato base64 o como archivo multipart.
    Retorna el texto Braille detectado y su traducción al español.
    """
    try:
        start_time = time.time()
        logger.info("Iniciando procesamiento de imagen")
        
        # Registrar información detallada sobre la solicitud
        logger.debug(f"Headers: {dict(request.headers)}")
        logger.debug(f"Método: {request.method}")
        logger.debug(f"Content-Type: {request.content_type}")
        logger.debug(f"Content-Length: {request.content_length}")
        logger.debug(f"Archivos: {list(request.files.keys()) if request.files else 'Ninguno'}")
        logger.debug(f"Formulario: {list(request.form.keys()) if request.form else 'Ninguno'}")
        logger.debug(f"JSON: {request.is_json}")
        
        # Obtener la imagen del request
        if 'image' in request.files:
            # Si se envía como archivo
            file = request.files['image']
            logger.info(f"Imagen recibida como archivo: {file.filename}, tipo: {file.content_type}")
            img_stream = io.BytesIO(file.read())
            img = Image.open(img_stream)
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        elif request.is_json and 'image' in request.json:
            # Si se envía como base64
            logger.info("Imagen recibida como base64")
            base64_image = request.json['image']
            # Eliminar el prefijo si existe (ej: "data:image/jpeg;base64,")
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            img_bytes = base64.b64decode(base64_image)
            img_stream = io.BytesIO(img_bytes)
            img = Image.open(img_stream)
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        else:
            # Registrar el error con más detalle
            logger.error("No se proporcionó ninguna imagen")
            logger.error(f"Contenido de la solicitud: {request.data[:1000] if request.data else 'Sin datos'}")
            return jsonify({"error": "No se proporcionó ninguna imagen. Asegúrate de enviar un archivo con el nombre 'image' o un JSON con una clave 'image' que contenga una imagen en base64."}), 400
        
        logger.info(f"Imagen cargada correctamente, tamaño: {img_cv.shape}")
        
        # Procesamiento básico de la imagen
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 127, 255, cv2.THRESH_BINARY)
        
        # Detección de contornos para encontrar puntos Braille
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        logger.info(f"Contornos detectados: {len(contours)}")
        
        # Dibujar contornos en la imagen original para visualización
        img_with_contours = img_cv.copy()
        cv2.drawContours(img_with_contours, contours, -1, (0, 255, 0), 2)
        
        # En un sistema real, aquí implementaríamos la detección de puntos Braille
        # Por ahora, simulamos una detección con un texto de ejemplo
        braille_text = "⠁⠃⠉"  # "abc" en Braille
        
        # Traducir el texto Braille a español
        spanish_text = ''.join([braille_to_spanish.get(char, char) for char in braille_text])
        
        # Convertir la imagen procesada a base64 para visualización
        _, buffer = cv2.imencode('.jpg', img_with_contours)
        processed_image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        processing_time = time.time() - start_time
        logger.info(f"Procesamiento completado en {processing_time:.2f} segundos")
        
        # Devolver resultados
        return jsonify({
            "braille": braille_text,
            "spanish": spanish_text,
            "processed_image": processed_image_base64,
            "processing_time": processing_time,
            "success": True
        })
        
    except Exception as e:
        # Registrar el error con más detalle
        logger.error(f"Error al procesar la imagen: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc(),
            "request_info": {
                "method": request.method,
                "content_type": request.content_type,
                "has_files": bool(request.files),
                "has_form": bool(request.form),
                "is_json": request.is_json
            }
        }), 500

@app.route('/translate-braille', methods=['POST'])
def translate_braille():
    """
    Traduce texto Braille a español.
    
    Espera recibir un texto en formato Braille.
    Retorna la traducción al español.
    """
    try:
        data = request.json
        braille_text = data.get('braille', '')
        
        if not braille_text:
            return jsonify({"error": "No se proporcionó texto en Braille"}), 400
        
        # Traducir el texto Braille a español
        spanish_text = ''.join([braille_to_spanish.get(char, char) for char in braille_text])
        
        return jsonify({
            "spanish": spanish_text,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error al traducir texto Braille: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/feedback', methods=['POST'])
def receive_feedback():
    """
    Recibe feedback sobre una traducción para mejorar el modelo.
    
    Espera recibir información sobre la traducción original y la corrección.
    """
    try:
        data = request.json
        required_fields = ['originalText', 'expectedOutput', 'accuracy']
        
        # Verificar que se proporcionaron todos los campos requeridos
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Falta el campo requerido: {field}"}), 400
        
        # Guardar el feedback para entrenamiento futuro
        feedback_entry = {
            "original_text": data['originalText'],
            "expected_output": data['expectedOutput'],
            "manual_correction": data.get('manualCorrection', ''),
            "accuracy": data['accuracy'],
            "timestamp": time.time()
        }
        
        feedback_data.append(feedback_entry)
        
        # Guardar en archivo para persistencia
        try:
            with open('feedback_data.json', 'w') as f:
                json.dump(feedback_data, f)
        except Exception as e:
            logger.warning(f"No se pudo guardar el feedback en archivo: {str(e)}")
        
        return jsonify({
            "message": "Feedback recibido correctamente",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error al recibir feedback: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/train', methods=['POST'])
def train_model():
    """
    Inicia el entrenamiento del modelo con el feedback recibido.
    """
    if training_status["is_training"]:
        return jsonify({
            "message": "Ya hay un entrenamiento en curso",
            "progress": training_status["progress"]
        }), 400
    
    # Iniciar entrenamiento
    threading.Thread(target=_train_model_task).start()
    
    return jsonify({
        "message": "Entrenamiento iniciado correctamente",
        "success": True
    })

@app.route('/training-status', methods=['GET'])
def get_training_status():
    """
    Obtiene el estado actual del entrenamiento.
    """
    return jsonify(training_status)

def _train_model_task():
    """
    Tarea de entrenamiento que se ejecuta en un hilo separado.
    """
    try:
        training_status["is_training"] = True
        training_status["progress"] = 0
        
        # Simular entrenamiento
        total_steps = 10
        for i in range(total_steps):
            #  lógica real de entrenamiento
            time.sleep(1)  
            training_status["progress"] = (i + 1) * 100 // total_steps
        
        training_status["last_trained"] = time.time()
        logger.info("Entrenamiento completado")
    except Exception as e:
        logger.error(f"Error durante el entrenamiento: {str(e)}", exc_info=True)
    finally:
        training_status["is_training"] = False

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    
    # Cargar feedback existente si hay
    try:
        if os.path.exists('feedback_data.json'):
            with open('feedback_data.json', 'r') as f:
                feedback_data = json.load(f)
    except Exception as e:
        logger.warning(f"No se pudo cargar el feedback existente: {str(e)}")
    
    logger.info(f"Iniciando servidor en el puerto {port}, modo debug: {debug}")
    app.run(host='0.0.0.0', port=port, debug=debug)

