from PIL import Image
import os

os.chdir(os.path.join(os.path.dirname(__file__), '..', 'public'))

f = 'rider-map-transparent.png'
im = Image.open(f).convert('RGBA')
print('file', f)
print('size', im.size, 'mode', im.mode)
im.thumbnail((60, 60))
print('corner NW', im.getpixel((2, 2)))
print('corner NE', im.getpixel((im.width - 3, 2)))
print('corner SW', im.getpixel((2, im.height - 3)))
print('corner SE', im.getpixel((im.width - 3, im.height - 3)))
print('center', im.getpixel((im.width // 2, im.height // 2)))
