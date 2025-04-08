"""
Script para probar directamente el endpoint /process-image del servidor Flask
usando la misma imagen que se envió desde Postman.
"""

import requests
import base64
import json
import os
import sys

def test_process_image_endpoint():
    """Prueba el endpoint /process-image con una imagen de prueba."""
    
    # URL del servidor Flask
    base_url = os.environ.get("BACKEND_URL", "http://localhost:5000")
    
    print(f"Probando conexión con el backend en: {base_url}/process-image")
    
    # Cargar la imagen de prueba desde un archivo
    try:
        # Intenta cargar una imagen de prueba si existe
        with open("test_image.jpg", "rb") as f:
            image_data = f.read()
        print("Usando imagen de prueba desde archivo test_image.jpg")
    except FileNotFoundError:
        # Si no hay imagen de prueba, crear una imagen simple
        print("No se encontró imagen de prueba, creando una imagen simple...")
        from PIL import Image, ImageDraw
        import io
        
        # Crear una imagen en blanco
        img = Image.new('RGB', (200, 200), color='white')
        draw = ImageDraw.Draw(img)
        
        # Dibujar algunos círculos negros (simulando puntos Braille)
        draw.ellipse((50, 50, 60, 60), fill='black')
        draw.ellipse((50, 80, 60, 90), fill='black')
        draw.ellipse((80, 50, 90, 60), fill='black')
        
        # Convertir a bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        image_data = img_byte_arr.getvalue()
        
        # Guardar la imagen para futuras pruebas
        with open("test_image.jpg", "wb") as f:
            f.write(image_data)
        print("Imagen de prueba creada y guardada como test_image.jpg")
    
    # Método 1: Enviar como archivo multipart/form-data (como lo haría un formulario HTML)
    try:
        print("\nMétodo 1: Enviando como archivo multipart/form-data...")
        files = {'image': ('test_image.jpg', image_data, 'image/jpeg')}
        response = requests.post(f"{base_url}/process-image", files=files)
        
        print(f"Código de estado: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Respuesta: {json.dumps(data, indent=2)}")
            # Guardar la imagen procesada si está presente
            if 'processed_image' in data:
                processed_image = base64.b64decode(data['processed_image'])
                with open("processed_image.jpg", "wb") as f:
                    f.write(processed_image)
                print("Imagen procesada guardada como processed_image.jpg")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error en Método 1: {e}")
    
    # Método 2: Enviar como JSON con la imagen en base64
    try:
        print("\nMétodo 2: Enviando como JSON con imagen en base64...")
        base64_image = base64.b64encode(image_data).decode('utf-8')
        json_data = {"image": base64_image}
        response = requests.post(
            f"{base_url}/process-image", 
            json=json_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Código de estado: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"Respuesta: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error en Método 2: {e}")

if __name__ == "__main__":
    test_process_image_endpoint()

