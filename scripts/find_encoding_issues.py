# -*- coding: utf-8 -*-
"""Find real mojibake / encoding-corruption artifacts (multi-char) across source files."""
import os

ROOTS = ['admin/src', 'rider-panel/src', 'API/src']
# Multi-character mojibake sequences (UTF-8 bytes misread as Latin-1/cp1252).
BAD = [
    'Ã©', 'Ã¨', 'Ã', 'â€“', 'â€”', 'â€™', 'â€œ', 'â€', 'â†', 'â‡',
    'â–', 'â—', 'Â', 'ï»¿', 'âœ', 'â˜', 'â‰', 'âˆ', 'â\x80',
    'â\x9e', 'â\x9f', 'â\x86', 'â\x87', 'â\x96', 'â\x97',
]

def main():
    found = False
    for root in ROOTS:
        for dirpath, _, files in os.walk(root):
            for f in files:
                if not f.endswith(('.js', '.jsx', '.css', '.html', '.json')):
                    continue
                path = os.path.join(dirpath, f)
                try:
                    with open(path, encoding='utf-8', errors='ignore') as fh:
                        content = fh.read()
                except Exception:
                    continue
                for pat in BAD:
                    if pat and pat in content:
                        lines = content.splitlines()
                        for i, line in enumerate(lines, 1):
                            if pat in line:
                                print(f'{path}:{i}: {line.strip()[:140]}')
                                found = True
    if not found:
        print('No encoding artifacts found.')

if __name__ == '__main__':
    main()
