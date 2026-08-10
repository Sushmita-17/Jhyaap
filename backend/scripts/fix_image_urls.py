import json
from pathlib import Path
import sys

# Add the app directory to the Python path
sys.path.append('.')

from app.db.database import fetch_all_products, save_product

def fix_images():
    base_prefix = "https://cheers.com.np/uploads"
    
    # 1. Update the database natively
    print("Fetching products from the database...")
    products = fetch_all_products()
    updated_count = 0
    for p in products:
        img = p.get("image", "")
        if img and img.startswith("/products/"):
            p["image"] = f"{base_prefix}{img}"
            save_product(p)
            updated_count += 1
            
    print(f"Successfully updated {updated_count} products in the database natively.")
    
    # 2. Update the seed catalog file so anyone cloning gets the correct URLs natively
    seed_file = Path("../nightowl/src/data/cheers-catalog.json").resolve()
    if seed_file.exists():
        print(f"Reading seed catalog from {seed_file}...")
        with open(seed_file, "r", encoding="utf-8") as f:
            catalog = json.load(f)
            
        seed_updated = 0
        for item in catalog:
            img = item.get("image", "")
            if img and img.startswith("/products/"):
                item["image"] = f"{base_prefix}{img}"
                seed_updated += 1
                
        if seed_updated > 0:
            with open(seed_file, "w", encoding="utf-8") as f:
                json.dump(catalog, f, separators=(',', ':'))
            print(f"Successfully updated {seed_updated} items in the seed catalog file.")
        else:
            print("Seed catalog already contains absolute URLs.")
    else:
        print(f"Warning: Seed file not found at {seed_file}")

if __name__ == "__main__":
    fix_images()
