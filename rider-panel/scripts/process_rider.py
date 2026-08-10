"""
process_rider.py — Remove the white/light rectangle background from rider.png
and produce a transparent, tightly-cropped rider marker image for use on
OpenStreetMap (rider-panel).

The original rider.png (1402x1122) is a photo with a near-white rectangular
background. This script:
  1. Loads rider.png (RGB).
  2. Converts near-white pixels (the rectangle) to fully transparent.
  3. Flood-fills from the edges so interior white areas (e.g. helmet highlights)
     are preserved.
  4. Auto-crops to the opaque bounding box.
  5. Saves as rider-map-transparent-large.png (RGBA).

Keeps the original rider.png untouched.
"""
from PIL import Image
import os

HERE = os.path.dirname(__file__)
PUBLIC = os.path.join(HERE, '..', 'public')

SRC = os.path.join(PUBLIC, 'rider.png')
OUT = os.path.join(PUBLIC, 'rider-map-transparent.png')

# Near-white threshold: pixels with RGB all >= this value are treated as background.
WHITE_THRESHOLD = 230


def remove_background(im, threshold=WHITE_THRESHOLD):
    im = im.convert('RGBA')
    px = im.load()
    w, h = im.size
    # Build a visited mask for flood fill from the borders.
    visited = [[False] * w for _ in range(h)]
    stack = []
    for x in range(w):
        stack.append((x, 0))
        stack.append((x, h - 1))
    for y in range(h):
        stack.append((0, y))
        stack.append((w - 1, y))

    def is_white(x, y):
        r, g, b, a = px[x, y]
        # Treat high-alpha as opaque; check near-white among opaque pixels.
        return a > 40 and r >= threshold and g >= threshold and b >= threshold

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h:
            continue
        if visited[y][x]:
            continue
        if not is_white(x, y):
            continue
        visited[y][x] = True
        stack.append((x + 1, y))
        stack.append((x - 1, y))
        stack.append((x, y + 1))
        stack.append((x, y - 1))

    # Set flood-filled (background) pixels to transparent.
    for y in range(h):
        for x in range(w):
            if visited[y][x]:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)

    return im


def auto_crop(im):
    bbox = im.getbbox()  # (left, upper, right, lower) of non-zero alpha
    if bbox is None:
        return im
    return im.crop(bbox)


def main():
    im = Image.open(SRC)
    im = remove_background(im)
    im = auto_crop(im)
    im.save(OUT, 'PNG')
    print('Saved', os.path.relpath(OUT), im.size, im.mode)


if __name__ == '__main__':
    main()
