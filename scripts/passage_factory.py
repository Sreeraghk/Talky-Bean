# -*- coding: utf-8 -*-
"""
Passage factory to build validated PremadePassage structures.
"""
import re
from reading_builder_helper import save_typescript_file, get_metric, TARGET_RANGES

def make_passage(title, level, language, text, vocab, mcqs, tfs):
    """
    mcqs: list of 5 tuples (question_text, [opt0, opt1, opt2, opt3], ans_idx, explanation)
    tfs: list of 5 tuples (question_text, [opt0, opt1], ans_idx, explanation)
    """
    mcq_objs = []
    for q, opts, ans, exp in mcqs:
        mcq_objs.append({
            "question": q,
            "options": opts,
            "correctAnswerIndex": ans,
            "explanation": exp
        })

    tf_objs = []
    for q, opts, ans, exp in tfs:
        tf_objs.append({
            "question": q,
            "options": opts,
            "correctAnswerIndex": ans,
            "explanation": exp
        })

    return {
        "title": title,
        "level": level,
        "language": language,
        "text": text.strip(),
        "vocabularyHints": vocab,
        "mcqQuestions": mcq_objs,
        "tfQuestions": tf_objs
    }
