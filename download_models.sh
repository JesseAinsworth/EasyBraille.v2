#!/bin/bash

# Script para descargar modelos preentrenados

# Crear directorio para modelos si no existe
mkdir -p models

# Descargar modelo YOLOv8 para detección de Braille
echo "Descargando modelo YOLOv8 para detección de Braille..."
# En un caso real, aquí se descargaría el modelo desde un repositorio o servicio de almacenamiento
# Por ejemplo:
# wget -O models/braille_yolov8n.pt https://example.com/models/braille_yolov8n.pt

# Por ahora, creamos un archivo de marcador
touch models/braille_yolov8n.pt
echo "Nota: Este es un archivo de marcador. En un entorno real, deberías descargar o entrenar un modelo YOLOv8."

echo "Descarga de modelos completada."

