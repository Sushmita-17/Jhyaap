# -*- coding: utf-8 -*-
"""Fix the RiderMap.jsx control buttons:
  - play/pause button: ensure it shows '▶' and '⏸'
  - speed down: '−' (minus)
  - speed up: '+'
  - restart: '↺'
"""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(BASE, 'rider-panel', 'src', 'components', 'RiderMap.jsx')

with open(path, 'rb') as f:
    raw = f.read()

# 1) Play/pause: replace whatever is between the quotes with correct unicode.
#    Current-ish corrupted: '{isPaused ? '<bad>' : '⏸'}'. We'll locate the whole
#    span line and rewrite it cleanly.
marker = b'<span>{isPaused ? '
idx = raw.find(marker)
if idx == -1:
    print('play/pause marker not found')
else:
    end = raw.find(b'</span>', idx)
    if end == -1:
        print('span end not found')
    else:
        new_line = ('<span>{isPaused ? \'▶\' : \'⏸\'}</span>').encode('utf-8')
        raw = raw[:idx] + new_line + raw[end:]

# 2) Speed down button: replace first empty <span></span> after setSpeed(...-0.5)
#    We'll do targeted replacements of the three empty spans in the controls block.
#    Find the controls div and fill empties in order: minus, plus, restart.
def replace_span(raw, search_marker, new_char):
    idx = raw.find(search_marker)
    if idx == -1:
        return raw, False
    # find the <span></span> that follows within this button
    span_start = raw.find(b'<span></span>', idx)
    if span_start == -1:
        return raw, False
    span_end = span_start + len(b'<span></span>')
    new_span = ('<span>' + new_char + '</span>').encode('utf-8')
    raw = raw[:span_start] + new_span + raw[span_end:]
    return raw, True

# Speed down
raw, ok1 = replace_span(raw, b'setSpeed(Math.max(0.5, speed - 0.5))', '\u2212')  # minus sign −
# Speed up
raw, ok2 = replace_span(raw, b'setSpeed(Math.min(3, speed + 0.5))', '+')
# Restart
raw, ok3 = replace_span(raw, b'setCurrentRouteIndex(0)', '\u21BA')  # ↺

with open(path, 'wb') as f:
    f.write(raw)

print('play/pause:', raw.find(b'<span>{isPaused') != -1)
print('speed down (-):', ok1)
print('speed up (+):', ok2)
print('restart (↺):', ok3)
