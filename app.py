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
from braille_processor import BrailleProcessor
from braille_translator import BrailleTranslator

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Inicializar procesador de Braille
braille_processor = BrailleProcessor()

# Inicializar traductor de Braille
braille_translator = BrailleTranslator()

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
        
        # Obtener la imagen del request
        if 'image' in request.files:
            # Si se envía como archivo
            file = request.files['image']
            img_stream = io.BytesIO(file.read())
            img = Image.open(img_stream)
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        elif 'image' in request.json:
            # Si se envía como base64
            base64_image = request.json['image']
            # Eliminar el prefijo si existe (ej: "data:image/jpeg;base64,")
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            img_bytes = base64.b64decode(base64_image)
            img_stream = io.BytesIO(img_bytes)
            img = Image.open(img_stream)
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        else:
            return jsonify({"error": "No se proporcionó ninguna imagen"}), 400
        
        # Procesar la imagen para detectar Braille
        processed_image, braille_dots = braille_processor.process_image(img_cv)
        
        # Convertir los puntos Braille detectados a caracteres Braille
        braille_text = braille_processor.dots_to_braille(braille_dots)
        
        # Traducir el texto Braille a español
        spanish_text = braille_translator.translate_to_spanish(braille_text)
        
        # Convertir la imagen procesada a base64 para visualización (opcional)
        _, buffer = cv2.imencode('.jpg', processed_image)
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
        logger.error(f"Error al procesar la imagen: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

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
        spanish_text = braille_translator.translate_to_spanish(braille_text)
        
        return jsonify({
            "spanish": spanish_text,
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error al traducir texto Braille: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/train-model', methods=['POST'])
def train_model():
    """
    Inicia el entrenamiento del modelo de detección de Braille.
    
    Este es un proceso asíncrono que puede tomar tiempo.
    Retorna un identificador de trabajo para consultar el estado del entrenamiento.
    """
    try:
        # Aquí se implementaría la lógica para iniciar el entrenamiento
        # Por ahora, simplemente simulamos una respuesta
        job_id = f"train_{int(time.time())}"
        
        return jsonify({
            "job_id": job_id,
            "status": "started",
            "message": "Entrenamiento iniciado correctamente",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Error al iniciar entrenamiento: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

