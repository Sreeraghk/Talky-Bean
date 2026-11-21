def check(text, min_w, max_w):
    words = len(text.strip().split())
    print(f"Words: {words} (min: {min_w}, max: {max_w}) - {'OK' if min_w <= words <= max_w else 'FAIL'}")
    return words
