# -*- coding: utf-8 -*-
"""
Generator for French, Italian, and Portuguese complete reading libraries.
Each language gets 25 passages (5 per level: A1, A2, B1, B2, C1).
Word count targets:
- A1: 150-220 words
- A2: 200-260 words
- B1: 250-320 words
- B2: 280-360 words
- C1: 320-400 words
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))
from reading_builder_helper import save_typescript_file

print("Starting generation of French, Italian, and Portuguese libraries...")
