#!/usr/bin/env python3
# start_server.py - Script de inicio para EasyBraille Backend

import os
import sys
import subprocess

def check_python_version():
    """Verifica la versión de Python"""
    if sys.version_info < (3, 7):
        print("❌ Se requiere Python 3.7 o superior")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def check_model_file():
    """Verifica que el archivo del modelo exista"""
    model_path = os.path.join("runs", "detect", "train", "weights", "best.pt")
    
    if not os.path.exists(model_path):
        print(f"❌ No se encontró el modelo en: {model_path}")
        print("\n🔍 Verificaciones necesarias:")
        print("1. ¿Existe el archivo best.pt?")
        print("2. ¿Está en la ruta correcta?")
        print("3. ¿Se completó el entrenamiento exitosamente?")
        return False
    
    print(f"✅ Modelo encontrado: {model_path}")
    return True

def install_requirements():
    """Instala las dependencias necesarias"""
    if os.path.exists("requirements.txt"):
        print("📦 Instalando dependencias...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencias instaladas")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando dependencias: {e}")
            return False
    else:
        print("⚠️  No se encontró requirements.txt")
        return True

def main():
    """Función principal"""
    print("🔍 EasyBraille Backend - Verificaciones de inicio")
    print("=" * 50)
    
    # Verificar Python
    if not check_python_version():
        sys.exit(1)
    
    # Verificar modelo
    if not check_model_file():
        sys.exit(1)
    
    # Instalar dependencias
    if not install_requirements():
        print("⚠️  Continuando sin instalar dependencias...")
    
    print("\n🚀 Iniciando servidor...")
    print("=" * 50)
    
    # Configurar variables de entorno
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = 'True'
    
    try:
        # Importar y ejecutar la aplicación
        from main import main as run_main
        run_main()
        
    except ImportError as e:
        print(f"❌ Error importando módulos: {e}")
        print("\n🔧 Posibles soluciones:")
        print("1. Verificar que main.py existe")
        print("2. Instalar dependencias: pip install -r requirements.txt")
        print("3. Verificar estructura del proyecto")
        sys.exit(1)
        
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido por el usuario")
        
    except Exception as e:
        print(f"💥 Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()