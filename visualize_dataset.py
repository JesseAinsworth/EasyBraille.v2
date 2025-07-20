import cv2
import os
import glob

# CONFIGURA AQUÍ TU RUTA
DATASET_DIR = "dataset-braille"
IMAGES_DIR = os.path.join(DATASET_DIR, "images/train")
LABELS_DIR = os.path.join(DATASET_DIR, "labels/train")
CLASS_NAMES = [
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
    "u", "v", "w", "x", "y", "z"
]

def draw_annotations(image_path, label_path):
    image = cv2.imread(image_path)
    height, width = image.shape[:2]

    with open(label_path, "r") as f:
        for line in f.readlines():
            parts = line.strip().split()
            if len(parts) != 5:
                continue
            class_id, x_center, y_center, w, h = map(float, parts)
            class_id = int(class_id)

            # Desnormalizar
            x1 = int((x_center - w / 2) * width)
            y1 = int((y_center - h / 2) * height)
            x2 = int((x_center + w / 2) * width)
            y2 = int((y_center + h / 2) * height)

            # Dibujar la caja
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label = CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else str(class_id)
            cv2.putText(image, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    return image

# Recorrer todas las imágenes y mostrar anotaciones
image_paths = glob.glob(os.path.join(IMAGES_DIR, "*.jpg"))

for image_path in image_paths:
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    label_path = os.path.join(LABELS_DIR, base_name + ".txt")

    if not os.path.exists(label_path):
        print(f"❌ Falta etiqueta para {base_name}")
        continue

    annotated_image = draw_annotations(image_path, label_path)
    cv2.imshow("Etiqueta YOLO", annotated_image)

    # Esperar tecla (ESC para salir)
    key = cv2.waitKey(0)
    if key == 27:  # ESC
        break

cv2.destroyAllWindows()
