"""
Setup Supabase Storage bucket for product images.
This script creates the 'products' bucket and sets up the necessary policies.
"""
import os
import sys
from pathlib import Path

# Add the parent directory to the path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings
from app.db.supabase_client import get_supabase_client


def setup_storage_bucket():
    """Create the products storage bucket and set up policies."""
    print("Setting up Supabase Storage bucket for product images...")
    
    try:
        supabase = get_supabase_client()
        
        # Check if bucket already exists
        buckets = supabase.storage.list_buckets()
        bucket_exists = any(bucket['name'] == 'products' for bucket in buckets)
        
        if bucket_exists:
            print("✓ 'products' bucket already exists")
        else:
            # Create the bucket
            print("Creating 'products' bucket...")
            result = supabase.storage.create_bucket(
                id='products',
                name='products',
                public=True,
                file_size_limit=5242880,  # 5MB
                allowed_mime_types=['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            )
            print("✓ 'products' bucket created successfully")
        
        # Note: Row Level Security (RLS) policies need to be set up via SQL
        # The SQL migration file should be applied via Supabase dashboard or CLI
        print("\nNext steps:")
        print("1. Apply the SQL migration from backend/supabase/migrations/20260805_create_storage_bucket.sql")
        print("2. This can be done via Supabase Dashboard → SQL Editor or using supabase CLI")
        print("3. The migration sets up the necessary RLS policies for the bucket")
        
        return True
        
    except Exception as e:
        print(f"✗ Error setting up storage bucket: {e}")
        return False


if __name__ == "__main__":
    success = setup_storage_bucket()
    sys.exit(0 if success else 1)
