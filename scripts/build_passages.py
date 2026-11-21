#!/usr/bin/env python3
"""
Comprehensive Reading Library Generator for Talky Bean.
Generates fully structured, authentic, level-appropriate reading passages
for all 11 supported languages and all 5 proficiency levels (25 passages per language).
"""
import os
import json
import re

TARGET_DIR = "src/data/reading"
os.makedirs(TARGET_DIR, exist_ok=True)

def count_metric(lang, text):
    if lang in ['zh', 'ja']:
        clean = re.sub(r'[\s\r\n\t]', '', text)
        return len(clean), 'chars'
    words = re.findall(r'\S+', text)
    return len(words), 'words'

print("Setting up passage templates and data structures...")
