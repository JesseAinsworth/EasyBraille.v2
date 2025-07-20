from ultralytics import YOLO

model = YOLO("yolov8n.pt")  # o yolov8s.pt para mejor precisión

model.train(
    data='C:\Users\al222\Desktop\EasyBraille.v2-master\EasyBraille.v2-3-dev\EasyBraille.v2-3-dev\braille_train\v1\weights\best.pt',
    epochs=100,
    imgsz=640,
    batch=4,
    project='braille_train',
    name='v1',
    cache=True
)
