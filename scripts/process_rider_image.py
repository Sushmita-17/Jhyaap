#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Process rider image to remove rectangular background and make transparent.
This script takes the uploaded rider image and creates a transparent version.
"""

import os
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ADMIN_PUBLIC = os.path.join(BASE_DIR, 'admin', 'public')

def remove_background(image_path, output_path):
    """
    Remove background from image using color thresholding.
    Assumes the background is a solid color (white/gray rectangle).
    """
    try:
        img = Image.open(image_path).convert('RGBA')
        
        # Convert to numpy array for processing
        img_array = np.array(img)
        
        # Find background color (assume corners are background)
        corners = [
            img_array[0, 0],
            img_array[0, -1],
            img_array[-1, 0],
            img_array[-1, -1]
        ]
        
        # Use the most common corner color as background
        bg_color = np.mean(corners, axis=0).astype(int)
        
        # Create mask for pixels similar to background
        # Allow some tolerance for color variations
        tolerance = 30
        
        r, g, b, a = img_array.T
        mask = (
            (np.abs(r - bg_color[0]) < tolerance) &
            (np.abs(g - bg_color[1]) < tolerance) &
            (np.abs(b - bg_color[2]) < tolerance)
        )
        
        # Set alpha to 0 for background pixels
        img_array[mask.T] = [0, 0, 0, 0]
        
        # Convert back to PIL Image
        result = Image.fromarray(img_array)
        
        # Apply edge smoothing to reduce jagged edges
        result = result.filter(ImageFilter.SMOOTH_MORE)
        
        # Save the result
        result.save(output_path, 'PNG')
        print(f"✓ Created transparent image: {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing image: {e}")
        return False

def create_animated_frames(image_path, output_dir, num_frames=4):
    """
    Create animated frames by slightly transforming the rider image.
    This simulates the riding motion.
    """
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        base_img = Image.open(image_path).convert('RGBA')
        width, height = base_img.size
        
        frames = []
        
        for i in range(num_frames):
            # Create slight variations for animation
            # Small vertical offset to simulate bouncing
            offset = 2 if i % 2 == 0 else -2
            
            # Create new frame
            frame = Image.new('RGBA', (width, height + 10), (0, 0, 0, 0))
            
            # Paste with offset
            paste_y = 5 + offset
            frame.paste(base_img, (0, paste_y), base_img)
            
            frame_path = os.path.join(output_dir, f'rider_frame_{i}.png')
            frame.save(frame_path, 'PNG')
            frames.append(frame_path)
        
        print(f"✓ Created {num_frames} animation frames in: {output_dir}")
        return frames
        
    except Exception as e:
        print(f"✗ Error creating animation frames: {e}")
        return []

def create_css_animation(output_path):
    """
    Create CSS animation for the rider marker.
    """
    css = """
/* Rider marker animation - simulates riding motion */
@keyframes rider-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

@keyframes rider-lean {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
}

.jhyaap-rider-motion.is-driving .jhyaap-leaflet-rider-image {
  animation: rider-bounce 0.3s ease-in-out infinite,
              rider-lean 0.6s ease-in-out infinite;
}

.jhyaap-rider-motion.is-idle .jhyaap-leaflet-rider-image {
  animation: none;
}

/* Pulse effect for live tracking */
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}

.jhyaap-rider-pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0) 70%);
  animation: pulse-ring 2s ease-out infinite;
  pointer-events: none;
}
"""
    
    try:
        with open(output_path, 'w') as f:
            f.write(css)
        print(f"✓ Created CSS animation: {output_path}")
        return True
    except Exception as e:
        print(f"✗ Error creating CSS animation: {e}")
        return False

def main():
    # Process admin, nightowl, rider-panel, and API rider images
    panels = [
        ('admin', os.path.join(BASE_DIR, 'admin', 'public')),
        ('nightowl', os.path.join(BASE_DIR, 'nightowl', 'public')),
        ('rider-panel', os.path.join(BASE_DIR, 'rider-panel', 'public')),
        ('API', os.path.join(BASE_DIR, 'API', 'public'))
    ]
    
    for panel_name, panel_public in panels:
        input_image = os.path.join(panel_public, 'rider2.png')
        
        if not os.path.exists(input_image):
            print(f"✗ Input image not found for {panel_name}: {input_image}")
            continue
        
        print(f"\nProcessing {panel_name} panel...")
        
        # Create transparent version
        transparent_output = os.path.join(panel_public, 'rider-animated-transparent.png')
        remove_background(input_image, transparent_output)
        
        # Create animation frames
        frames_dir = os.path.join(panel_public, 'rider-frames')
        create_animated_frames(transparent_output, frames_dir)
        
        # Create CSS animation
        css_output = os.path.join(panel_public, 'rider-animation.css')
        create_css_animation(css_output)
        
        print(f"✓ {panel_name} rider image processing complete!")
        print(f"  - Transparent image: {transparent_output}")
        print(f"  - Animation frames: {frames_dir}")
        print(f"  - CSS animation: {css_output}")

if __name__ == '__main__':
    main()
