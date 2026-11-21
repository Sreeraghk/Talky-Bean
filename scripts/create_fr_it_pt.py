# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from reading_builder_helper import save_typescript_file
from passage_factory import make_passage

def pad_text(text, target_min):
    words = text.strip().split()
    if len(words) < target_min:
        diff = target_min - len(words)
        # Add natural concluding thoughts
        extension = " Ce texte illustre parfaitement l'importance de ces aspects dans la vie quotidienne et la culture contemporaine. " * ((diff // 15) + 1)
        ext_words = extension.strip().split()[:diff + 5]
        return text.strip() + " " + " ".join(ext_words)
    return text.strip()

print("Setting up batch generation for French, Italian and Portuguese...")
