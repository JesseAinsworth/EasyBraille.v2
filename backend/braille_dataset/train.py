from ultralytics import YOLO

def train_yolo():
    model = YOLO("yolov8n.yaml")  # Puedes usar yolov8n.yaml o el que estés usando
    model.train(data="braille_dataset/data.yaml", epochs=50, imgsz=640)

if __name__ == "__main__":
    train_yolo()
