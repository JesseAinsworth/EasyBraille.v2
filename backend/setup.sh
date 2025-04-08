#!/bin/bash

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env de ejemplo
if [ ! -f ".env" ]; then
    echo "FLASK_ENV=development" > .env
    echo "PORT=5000" >> .env
    echo "Archivo .env creado con valores predeterminados"
fi

echo "Configuración completada. Ejecuta 'bash run.sh' para iniciar el servidor."

