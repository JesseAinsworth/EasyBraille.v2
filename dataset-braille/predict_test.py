from ultralytics import YOLO
import cv2
import os

# Ruta al modelo entrenado
model_path = r"C:\Users\al222\Desktop\EasyBraille.v2-master\EasyBraille.v2-3-dev\EasyBraille.v2-3-dev\braille_train\v1\weights\best.pt"
model = YOLO(model_path)

# Ruta a la imagen de prueba
img_path = r"images/train/braille_saludo.jpeg"  #  tener la extensión correcta

# Verificar que la imagen existe
if not os.path.exists(img_path):
    raise FileNotFoundError(f"No se encontró la imagen: {img_path}")

# Ejecutar predicción
results = model.predict(img_path, conf=0.3, save=True)

# Mostrar la imagen con detecciones
cv2.imshow("Detección Braille", results[0].plot())
cv2.waitKey(0)
cv2.destroyAllWindows()

# Mostrar resultados por consola
for r in results:
    for box in r.boxes:
        class_id = int(box.cls[0])
        conf = float(box.conf[0])
        print(f"Detectado: clase {class_id} con confianza {conf:.2f}")
        
