# -*- coding: utf-8 -*-
"""Byte-level fix of mojibake in JSX files.

The files were triple-encoded: original unicode char -> utf-8 -> misread as
latin-1 -> written -> misread again. We replace the exact corrupted byte
sequences with their intended plain characters.

Each replacement is done on the raw bytes so exact mojibake matches cleanly.
"""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# rel_path -> list of (corrupted_hex, replacement_chars_utf8)
FIXES = {
    'rider-panel/src/components/RiderMap.jsx': [
        # play button '▶'  (note the trailing context: '{isPaused ? ' ... ' : ')
        ('c3a2e28093c2b6', 'c296b6'),   # -> '▶' (U+25B6)
        # pause button '⏸' -> U+23F8
        ('c3a2c28fc2b8', 'e28fb8'),     # -> '⏸'
    ],
    'rider-panel/src/pages/Dashboard.jsx': [
        ('c3a2e280a0c290', 'e28690'),   # -> '←'
        ('c3a2e280a0e28099', 'e28692'), # -> '→'
    ],
    'rider-panel/src/pages/OrderDetail.jsx': [
        ('c3a2e280a0c290', 'e28690'),   # -> '←' (Back button)
        ('c397', 'c397'),               # keep '×' valid utf-8 (already fine)
    ],
}

def main():
    for rel, mapping in FIXES.items():
        path = os.path.join(BASE, rel)
        if not os.path.exists(path):
            print('SKIP (missing): ' + rel)
            continue
        with open(path, 'rb') as f:
            raw = f.read()
        original = raw
        for bad_hex, good_hex in mapping:
            bad = bytes.fromhex(bad_hex)
            good = bytes.fromhex(good_hex)
            raw = raw.replace(bad, good)
        if raw != original:
            with open(path, 'wb') as f:
                f.write(raw)
            print('FIXED: ' + rel)
        else:
            print('ok   : ' + rel)

if __name__ == '__main__':
    main()
