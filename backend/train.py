from ultralytics import YOLO

model = YOLO("yolov8n.pt")  

model.train(
     data="braille_dataset/data.yaml",
    epochs=50,
    imgsz=640,
    batch=4,
    name="braille_model5"
)
