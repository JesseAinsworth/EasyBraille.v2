@echo off
REM Script para ejecutar el backend en Windows

REM Activar entorno virtual si existe
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Ejecutar la aplicación
python app.py

pause

