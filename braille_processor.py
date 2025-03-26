import cv2
import numpy as np
import logging
from ultralytics import YOLO
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class BrailleProcessor:
    """
    Clase para procesar imágenes y detectar caracteres Braille.
    
    Utiliza técnicas de procesamiento de imágenes con OpenCV y
    un modelo YOLOv8 para la detección de puntos Braille.
    """
    
    def __init__(self):
        """Inicializa el procesador de Braille."""
        self.model_path = os.environ.get('YOLO_MODEL_PATH', 'models/braille_yolov8n.pt')
        
        # Cargar el modelo YOLOv8 si existe
        try:
            if Path(self.model_path).exists():
                logger.info(f"Cargando modelo YOLOv8 desde {self.model_path}")
                self.model = YOLO(self.model_path)
                self.use_yolo = True
            else:
                logger.warning(f"Modelo YOLOv8 no encontrado en {self.model_path}. Usando procesamiento tradicional.")
                self.use_yolo = False
        except Exception as e:
            logger.error(f"Error al cargar modelo YOLOv8: {str(e)}")
            self.use_yolo = False
        
        # Mapeo de patrones de puntos Braille a caracteres Unicode
        self.braille_patterns = {
            (1, 0, 0, 0, 0, 0): '⠁',  # a
            (1, 1, 0, 0, 0, 0): '⠃',  # b
            (1, 0, 0, 1, 0, 0): '⠉',  # c
            (1, 0, 0, 1, 1, 0): '⠙',  # d
            (1, 0, 0, 0, 1, 0): '⠑',  # e
            (1, 1, 0, 1, 0, 0): '⠋',  # f
            (1, 1, 0, 1, 1, 0): '⠛',  # g
            (1, 1, 0, 0, 1, 0): '⠓',  # h
            (0, 1, 0, 1, 0, 0): '⠊',  # i
            (0, 1, 0, 1, 1, 0): '⠚',  # j
            (1, 0, 1, 0, 0, 0): '⠅',  # k
            (1, 1, 1, 0, 0, 0): '⠇',  # l
            (1, 0, 1, 1, 0, 0): '⠍',  # m
            (1, 0, 1, 1, 1, 0): '⠝',  # n
            (1, 0, 1, 0, 1, 0): '⠕',  # o
            (1, 1, 1, 1, 0, 0): '⠏',  # p
            (1, 1, 1, 1, 1, 0): '⠟',  # q
            (1, 1, 1, 0, 1, 0): '⠗',  # r
            (0, 1, 1, 1, 0, 0): '⠎',  # s
            (0, 1, 1, 1, 1, 0): '⠞',  # t
            (1, 0, 1, 0, 0, 1): '⠥',  # u
            (1, 1, 1, 0, 0, 1): '⠧',  # v
            (0, 1, 0, 1, 1, 1): '⠺',  # w
            (1, 0, 1, 1, 0, 1): '⠭',  # x
            (1, 0, 1, 1, 1, 1): '⠽',  # y
            (1, 0, 1, 0, 1, 1): '⠵',  # z
            (0, 0, 0, 0, 0, 0): ' ',  # espacio
        }
    
    def process_image(self, image):
        """
        Procesa una imagen para detectar puntos Braille.
        
        Args:
            image: Imagen en formato OpenCV (numpy array)
            
        Returns:
            tuple: (imagen procesada, lista de puntos Braille detectados)
        """
        if self.use_yolo:
            return self._process_with_yolo(image)
        else:
            return self._process_with_opencv(image)
    
    def _process_with_yolo(self, image):
        """
        Procesa una imagen usando el modelo YOLOv8.
        
        Args:
            image: Imagen en formato OpenCV
            
        Returns:
            tuple: (imagen procesada, lista de puntos Braille detectados)
        """
        # Realizar la detección con YOLOv8
        results = self.model(image)
        
        # Obtener las detecciones
        detections = results[0].boxes
        
        # Extraer las coordenadas de los puntos detectados
        braille_dots = []
        
        # Dibujar las detecciones en la imagen
        annotated_img = results[0].plot()
        
        # Aquí procesaríamos las detecciones para convertirlas en patrones Braille
        # Por simplicidad, devolvemos un patrón de ejemplo
        braille_dots = [(1, 0, 0, 0, 0, 0), (1, 1, 0, 0, 0, 0), (1, 0, 0, 1, 0, 0)]  # "abc"
        
        return annotated_img, braille_dots
    
    def _process_with_opencv(self, image):
        """
        Procesa una imagen usando técnicas tradicionales de OpenCV.
        
        Args:
            image: Imagen en formato OpenCV
            
        Returns:
            tuple: (imagen procesada, lista de puntos Braille detectados)
        """
        # Convertir a escala de grises
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Aplicar desenfoque gaussiano para reducir ruido
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Aplicar umbralización adaptativa
        thresh = cv2.adaptiveThreshold(
            blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Encontrar contornos
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filtrar contornos por tamaño y forma
        valid_contours = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if 10 < area < 150:  # Ajustar estos valores según el tamaño esperado de los puntos Braille
                valid_contours.append(contour)
        
        # Dibujar contornos en la imagen original
        result_image = image.copy()
        cv2.drawContours(result_image, valid_contours, -1, (0, 255, 0), 2)
        
        # Aquí implementaríamos la lógica para agrupar los puntos en celdas Braille
        # y determinar qué puntos están presentes en cada celda
        # Por simplicidad, devolvemos un patrón de ejemplo
        braille_dots = [(1, 0, 0, 0, 0, 0), (1, 1, 0, 0, 0, 0), (1, 0, 0, 1, 0, 0)]  # "abc"
        
        return result_image, braille_dots
    
    def dots_to_braille(self, dot_patterns):
        """
        Convierte patrones de puntos Braille a caracteres Unicode.
        
        Args:
            dot_patterns: Lista de tuplas, cada una representando un patrón de 6 puntos
            
        Returns:
            str: Texto en caracteres Braille Unicode
        """
        braille_text = ""
        for pattern in dot_patterns:
            braille_char = self.braille_patterns.get(pattern, '?')
            braille_text += braille_char
        
        return braille_text

