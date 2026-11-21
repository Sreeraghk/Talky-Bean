# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from reading_builder_helper import TARGET_RANGES, get_metric

# Read complete_korean.py and see passage lengths
import importlib.util
spec = importlib.util.spec_from_file_location("complete_korean", "scripts/complete_korean.py")
# temporarily monkeypatch save_typescript_file
import reading_builder_helper
old_save = reading_builder_helper.save_typescript_file
reading_builder_helper.save_typescript_file = lambda *args: None

mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

for i, p in enumerate(mod.passages):
    cnt, unit = get_metric(p['language'], p['text'])
    lvl = p['level']
    min_v, max_v = TARGET_RANGES[unit][lvl]
    diff = ""
    if cnt < min_v:
        diff = f"TOO SHORT (needs +{min_v - cnt})"
    elif cnt > max_v:
        diff = f"TOO LONG (needs -{cnt - max_v})"
    else:
        diff = "OK"
    print(f"#{i+1:02d} {lvl}: {cnt} words (target {min_v}-{max_v}) -> {diff} | {p['title']}")
