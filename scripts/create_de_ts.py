# -*- coding: utf-8 -*-
import json
import re

def wc(text):
    return len(re.findall(r'\S+', text))

# We define high quality German passages for all 5 levels (5 each = 25 total)
# ensuring all word counts strictly hit targets:
# A1: 150-220 words
# A2: 200-260 words
# B1: 250-320 words
# B2: 280-360 words
# C1: 320-400 words

