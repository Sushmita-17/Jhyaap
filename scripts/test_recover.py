# -*- coding: utf-8 -*-
"""Inspect bytes and test recovery of mojibake, writing to a log file."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(BASE, 'rider-panel', 'src', 'pages', 'Dashboard.jsx')
out = os.path.join(BASE, 'scripts', 'recover_log.txt')

with open(path, 'rb') as f:
    raw = f.read()

lines = []
i = raw.find(b'Prev')
seg = raw[i-40:i+10]
lines.append('latin1 repr: ' + repr(seg.decode('latin-1')))
lines.append('hex: ' + seg.hex())

t = seg.decode('latin-1')
for level in range(1, 5):
    try:
        t = t.encode('latin-1').decode('utf-8')
        lines.append(f'after {level}: ' + repr(t))
    except Exception as e:
        lines.append(f'after {level} FAILED: {e}')
        break

with open(out, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('done')
