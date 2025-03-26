import logging
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import os

logger = logging.getLogger(__name__)

class BrailleTranslator:
    """
    Clase para traducir texto Braille a español.
    
    Utiliza un mapeo directo para caracteres simples y
    opcionalmente un modelo de transformers para traducciones más complejas.
    """
    
    def __init__(self):
        """Inicializa el traductor de Braille."""
        # Mapeo básico de caracteres Braille a letras en español
        self.braille_to_spanish = {
            '⠁': 'a', '⠃': 'b', '⠉': 'c', '⠙': 'd', '⠑': 'e',
            '⠋': 'f', '⠛': 'g', '⠓': 'h', '⠊': 'i', '⠚': 'j',
            '⠅': 'k', '⠇': 'l', '⠍': 'm', '⠝': 'n', '⠕': 'o',
            '⠏': 'p', '⠟': 'q', '⠗': 'r', '⠎': 's', '⠞': 't',
            '⠥': 'u', '⠧': 'v', '⠺': 'w', '⠭': 'x', '⠽': 'y',
            '⠵': 'z', '⠀': ' ', ' ': ' '
        }
        
        # Intentar cargar un modelo de transformers si está configurado
        self.use_transformers = os.environ.get('USE_TRANSFORMERS', 'false').lower() == 'true'
        self.model_name = os.environ.get('TRANSLATOR_MODEL', 'Helsinki-NLP/opus-mt-en-es')
        
        if self.use_transformers:
            try:
                logger.info(f"Cargando modelo de traducción {self.model_name}")
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
                self.translator = pipeline("translation", model=self.model, tokenizer=self.tokenizer)
            except Exception as e:
                logger.error(f"Error al cargar modelo de traducción: {str(e)}")
                self.use_transformers = False
    
    def translate_to_spanish(self, braille_text):
        """
        Traduce texto Braille a español.
        
        Args:
            braille_text: Texto en caracteres Braille Unicode
            
        Returns:
            str: Texto traducido al español
        """
        # Traducción básica caracter por caracter
        basic_translation = ''.join([self.braille_to_spanish.get(char, char) for char in braille_text])
        
        # Si está habilitado, usar el modelo de transformers para mejorar la traducción
        if self.use_transformers and len(basic_translation) > 0:
            try:
                # Convertir a minúsculas para mejor rendimiento del modelo
                text_to_translate = basic_translation.lower()
                
                # Realizar la traducción
                translation = self.translator(text_to_translate, max_length=100)
                
                # Extraer el texto traducido
                translated_text = translation[0]['translation_text']
                
                return translated_text
            except Exception as e:
                logger.error(f"Error en la traducción con transformers: {str(e)}")
                return basic_translation
        
        return basic_translation

