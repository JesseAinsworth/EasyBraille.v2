# Backend de IA para EasyBraille

Este es el backend de IA para la aplicación EasyBraille, que proporciona servicios de procesamiento de imágenes y traducción de Braille a español.

## Características

- Procesamiento de imágenes para detectar puntos Braille
- Traducción de texto Braille a español
- Sistema de feedback para mejorar el modelo
- API RESTful para integración con el frontend

## Requisitos

- Python 3.9 o superior
- Flask
- OpenCV
- NumPy
- Pillow

## Instalación

1. Clonar el repositorio
2. Crear un entorno virtual: `python -m venv venv`
3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar dependencias: `pip install -r requirements.txt`

## Configuración

Crear un archivo `.env` con las siguientes variables:

