# routes.py - Agregar estas rutas a tu archivo routes.py existente

from flask import request, jsonify
import os
import base64
import io
from PIL import Image
import numpy as np
from app.model.braille_predictor import BraillePredictor

# Instancia global del predictor
braille_predictor = None

def init_braille_predictor():
    """Inicializa el predictor de Braille"""
    global braille_predictor
    try:
        # Ruta al modelo best.pt en tu estructura
        model_path = os.path.join(os.path.dirname(__file__), '..', 'runs', 'detect', 'train', 'weights', 'best.pt')
        model_path = os.path.abspath(model_path)
        
        braille_predictor = BraillePredictor(model_path)
        print(f"✅ Predictor de Braille inicializado con modelo: {model_path}")
        return True
    except Exception as e:
        print(f"❌ Error inicializando predictor: {e}")
        return False

def register_braille_routes(app):
    """Registra las rutas relacionadas con predicción de Braille"""
    
    @app.route('/api/braille-image', methods=['POST'])
    def predict_braille_from_image():
        """Endpoint para predecir texto Braille desde una imagen"""
        try:
            if braille_predictor is None:
                return jsonify({
                    'success': False,
                    'error': 'Predictor de Braille no inicializado'
                }), 500
            
            # Validar request
            if not request.is_json:
                return jsonify({
                    'success': False,
                    'error': 'Content-Type debe ser application/json'
                }), 400
            
            data = request.get_json()
            if 'image' not in data:
                return jsonify({
                    'success': False,
                    'error': 'No se proporcionó imagen en el campo "image"'
                }), 400
            
            print("📷 Procesando nueva imagen para predicción de Braille...")
            
            # Procesar imagen
            image = preprocess_image_data(data['image'])
            if image is None:
                return jsonify({
                    'success': False,
                    'error': 'Error procesando la imagen. Verifica el formato.'
                }), 400
            
            # Realizar predicción
            prediction_result = braille_predictor.predict(image)
            
            print(f"✅ Predicción completada: {prediction_result['total_detections']} caracteres detectados")
            print(f"📝 Texto: '{prediction_result['text']}'")
            
            return jsonify({
                'success': True,
                'text': prediction_result['text'],
                'confidence': prediction_result['confidence'],
                'detections': prediction_result['detections'],
                'total_detections': prediction_result['total_detections'],
                'processing_time': prediction_result.get('processing_time', 0)
            })
            
        except Exception as e:
            print(f"💥 Error en predicción: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                'success': False,
                'error': f'Error interno del servidor: {str(e)}'
            }), 500
    
    @app.route('/api/braille/health', methods=['GET'])
    def braille_health_check():
        """Endpoint para verificar el estado del predictor de Braille"""
        try:
            status = {
                'predictor_loaded': braille_predictor is not None,
                'model_ready': braille_predictor.is_ready() if braille_predictor else False,
                'model_classes': braille_predictor.get_classes() if braille_predictor else [],
                'server_status': 'online'
            }
            
            if braille_predictor:
                status['model_info'] = braille_predictor.get_model_info()
            
            return jsonify(status)
            
        except Exception as e:
            return jsonify({
                'predictor_loaded': False,
                'model_ready': False,
                'server_status': 'error',
                'error': str(e)
            }), 500
    
    @app.route('/api/braille/test', methods=['POST'])
    def test_braille_prediction():
        """Endpoint de prueba con imagen de ejemplo"""
        try:
            if braille_predictor is None:
                return jsonify({'error': 'Predictor no inicializado'}), 500
            
            # Aquí podrías cargar una imagen de prueba desde braille_dataset/test
            test_image_path = os.path.join(os.path.dirname(__file__), '..', 'braille_dataset', 'test')
            
            if os.path.exists(test_image_path):
                # Buscar la primera imagen en el directorio de test
                test_files = [f for f in os.listdir(test_image_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
                if test_files:
                    test_file = os.path.join(test_image_path, test_files[0])
                    image = Image.open(test_file)
                    
                    result = braille_predictor.predict(image)
                    return jsonify({
                        'success': True,
                        'test_image': test_files[0],
                        'result': result
                    })
            
            return jsonify({
                'success': False,
                'error': 'No se encontraron imágenes de prueba'
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

def preprocess_image_data(image_data):
    """Procesa los datos de imagen base64"""
    try:
        # Remover header de data URL si existe
        if isinstance(image_data, str) and image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decodificar base64
        image_bytes = base64.b64decode(image_data)
        
        # Abrir imagen con PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convertir a RGB si es necesario
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
        
    except Exception as e:
        print(f"Error procesando imagen: {e}")
        return None