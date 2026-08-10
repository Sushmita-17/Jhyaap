"""
Supabase database operations using Supabase client instead of direct PostgreSQL.
This avoids PostgreSQL connection timeout issues.
"""
from typing import List, Dict, Any, Optional
from app.db.supabase_client import get_supabase_client
from app.core.config import settings


def get_supabase_db():
    """Use Supabase client for database operations."""
    try:
        return get_supabase_client()
    except Exception as e:
        print(f"Supabase client not available: {e}")
        return None


# Product operations using Supabase
def fetch_all_products_supabase(category: Optional[str] = None, query: Optional[str] = None) -> List[Dict]:
    """Fetch all products from Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        return []
    
    try:
        supabase_query = supabase.table('products').select('*')
        
        if category:
            supabase_query = supabase_query.eq('category', category)
        
        if query:
            supabase_query = supabase_query.ilike('name', f'%{query}%')
        
        result = supabase_query.execute()
        return result.data if result.data else []
    except Exception as e:
        print(f"Error fetching products from Supabase: {e}")
        return []


def fetch_product_by_id_supabase(product_id: str) -> Optional[Dict]:
    """Fetch a single product by ID from Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        return None
    
    try:
        result = supabase.table('products').select('*').eq('id', product_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error fetching product from Supabase: {e}")
        return None


def save_product_supabase(product_data: Dict) -> Dict:
    """Save or update a product in Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        raise Exception("Supabase client not available")
    
    try:
        # Check if product exists
        existing = fetch_product_by_id_supabase(product_data['id'])
        
        if existing:
            # Update
            result = supabase.table('products').update(product_data).eq('id', product_data['id']).execute()
            return result.data[0] if result.data else product_data
        else:
            # Insert
            result = supabase.table('products').insert(product_data).execute()
            return result.data[0] if result.data else product_data
    except Exception as e:
        print(f"Error saving product to Supabase: {e}")
        raise


def remove_product_supabase(product_id: str) -> bool:
    """Delete a product from Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        return False
    
    try:
        result = supabase.table('products').delete().eq('id', product_id).execute()
        return len(result.data) > 0 if result.data else False
    except Exception as e:
        print(f"Error deleting product from Supabase: {e}")
        return False


# Rider operations using Supabase
def fetch_rider_by_phone_supabase(phone_number: str) -> Optional[Dict]:
    """Fetch rider by phone number from Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        return None
    
    try:
        result = supabase.table('rider_credentials').select('*').eq('phone_number', phone_number).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error fetching rider from Supabase: {e}")
        return None


# Customer operations using Supabase
def fetch_customer_by_phone_supabase(phone_number: str) -> Optional[Dict]:
    """Fetch customer by phone number from Supabase."""
    supabase = get_supabase_db()
    if not supabase:
        return None
    
    try:
        result = supabase.table('customers').select('*').eq('phone_number', phone_number).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error fetching customer from Supabase: {e}")
        return None
