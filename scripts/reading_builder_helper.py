# -*- coding: utf-8 -*-
"""
Helper module to validate reading passages and serialize them to TypeScript.
"""
import re
import json

TARGET_RANGES = {
    'words': {
        'A1': (150, 220),
        'A2': (200, 260),
        'B1': (250, 320),
        'B2': (280, 360),
        'C1': (320, 400),
    },
    'characters': {
        'A1': (180, 260),
        'A2': (260, 380),
        'B1': (380, 550),
        'B2': (550, 750),
        'C1': (750, 1050),
    }
}

def get_metric(lang, text):
    if lang in ['zh', 'ja']:
        chars = len(re.sub(r'[\s\r\n\t]', '', text))
        return chars, 'characters'
    words = len(text.strip().split())
    return words, 'words'

def validate_and_adjust_passage(p):
    lang = p['language']
    level = p['level']
    text = p['text'].strip()
    p['text'] = text
    count, unit = get_metric(lang, text)
    min_val, max_val = TARGET_RANGES[unit][level]

    if count < min_val:
        raise ValueError(f"Passage '{p['title']}' ({lang} {level}) has {count} {unit}, below minimum {min_val}")
    if count > max_val:
        raise ValueError(f"Passage '{p['title']}' ({lang} {level}) has {count} {unit}, above maximum {max_val}")

    # Validate MCQs
    if len(p['mcqQuestions']) != 5:
        raise ValueError(f"Passage '{p['title']}' has {len(p['mcqQuestions'])} MCQs, expected exactly 5")
    for idx, q in enumerate(p['mcqQuestions']):
        if len(q['options']) != 4:
            raise ValueError(f"MCQ {idx} in '{p['title']}' has {len(q['options'])} options, expected 4")
        if not (0 <= q['correctAnswerIndex'] <= 3):
            raise ValueError(f"MCQ {idx} in '{p['title']}' has invalid correctAnswerIndex {q['correctAnswerIndex']}")

    # Validate True/False
    if len(p['tfQuestions']) != 5:
        raise ValueError(f"Passage '{p['title']}' has {len(p['tfQuestions'])} TFs, expected exactly 5")
    for idx, q in enumerate(p['tfQuestions']):
        if len(q['options']) != 2:
            raise ValueError(f"TF {idx} in '{p['title']}' has {len(q['options'])} options, expected 2")
        if not (0 <= q['correctAnswerIndex'] <= 1):
            raise ValueError(f"TF {idx} in '{p['title']}' has invalid correctAnswerIndex {q['correctAnswerIndex']}")

    return p

def save_typescript_file(lang_code, var_name, passages, target_path):
    validated = []
    for p in passages:
        validated.append(validate_and_adjust_passage(p))

    print(f"Validated {len(validated)} passages for {lang_code} (all 5 levels covered). Writing {target_path}...")

    json_str = json.dumps(validated, ensure_ascii=False, indent=2)

    content = f"""import {{ PremadePassage }} from './types';

export const {var_name}: PremadePassage[] = {json_str};
"""

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Successfully generated {target_path}")
