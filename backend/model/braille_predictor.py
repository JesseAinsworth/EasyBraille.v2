class BraillePredictor:
    def __init__(self):
        self.mapping = {
            "a": "⠁", "b": "⠃", "c": "⠉", "d": "⠙", "e": "⠑",
            "f": "⠋", "g": "⠛", "h": "⠓", "i": "⠊", "j": "⠚",
            "k": "⠅", "l": "⠇", "m": "⠍", "n": "⠝", "o": "⠕",
            "p": "⠏", "q": "⠟", "r": "⠗", "s": "⠎", "t": "⠞",
            "u": "⠥", "v": "⠧", "w": "⠺", "x": "⠭", "y": "⠽", "z": "⠵"
        }

    def to_braille(self, letter):
        return self.mapping.get(letter.lower(), "?")

    def sequence_to_braille(self, sequence):
        return "".join([self.to_braille(char) for char in sequence])
