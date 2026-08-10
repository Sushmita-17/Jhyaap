# -*- coding: utf-8 -*-
"""Scan files for non-ASCII byte runs and report them with hex, so I can map
each corrupted sequence to its intended character."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    'rider-panel/src/components/RiderMap.jsx',
    'rider-panel/src/pages/Dashboard.jsx',
    'rider-panel/src/pages/OrderDetail.jsx',
]

out_lines = []
for rel in TARGETS:
    path = os.path.join(BASE, rel)
    if not os.path.exists(path):
        continue
    raw = open(path, 'rb').read()
    out_lines.append('==== ' + rel + ' ====')
    # Find runs of bytes >= 0x80
    i = 0
    n = len(raw)
    while i < n:
        if raw[i] >= 0x80:
            j = i
            while j < n and raw[j] >= 0x80:
                j += 1
            run = raw[i:j]
            # context: 25 bytes before and after
            ctx_before = raw[max(0, i-25):i].decode('latin-1', errors='replace')
            ctx_after = raw[j:j+25].decode('latin-1', errors='replace')
            out_lines.append('RUN: hex=' + run.hex())
            out_lines.append('  latin1=' + repr(run.decode('latin-1')))
            try:
                out_lines.append('  utf8  =' + repr(run.decode('utf-8')))
            except Exception:
                out_lines.append('  utf8  = <invalid utf-8>')
            out_lines.append('  ctx   = ...' + ctx_before + '[RUN]' + ctx_after + '...')
            i = j
        else:
            i += 1

with open(os.path.join(BASE, 'scripts', 'mojibake_scan.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print('done')
