import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.db.database import get_connection, is_postgres
from app.models.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/categories", tags=["categories"])


def fetch_category_by_id(category_id: str) -> Optional[dict]:
    """Fetch a category by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM categories WHERE id = %s",
                (category_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM categories WHERE id = ?",
                (category_id,)
            )
        
        row = cursor.fetchone()
        if row:
            if isinstance(row, dict):
                return dict(row)
            else:
                columns = [col[0] for col in cursor.description]
                return dict(zip(columns, row))
        return None
    finally:
        cursor.close()
        conn.close()


def save_category(category_data: dict) -> dict:
    """Save a category to the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO categories 
                (id, name, description, image_url, parent_id, is_active, display_order, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    image_url = EXCLUDED.image_url,
                    parent_id = EXCLUDED.parent_id,
                    is_active = EXCLUDED.is_active,
                    display_order = EXCLUDED.display_order,
                    updated_at = EXCLUDED.updated_at
                RETURNING *
            """, (
                category_data["id"],
                category_data["name"],
                category_data.get("description"),
                category_data.get("image_url"),
                category_data.get("parent_id"),
                category_data["is_active"],
                category_data["display_order"],
                category_data["created_at"],
                category_data["updated_at"]
            ))
        else:
            cursor.execute("""
                INSERT OR REPLACE INTO categories 
                (id, name, description, image_url, parent_id, is_active, display_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                category_data["id"],
                category_data["name"],
                category_data.get("description"),
                category_data.get("image_url"),
                category_data.get("parent_id"),
                category_data["is_active"],
                category_data["display_order"],
                category_data["created_at"],
                category_data["updated_at"]
            ))
        
        conn.commit()
        return fetch_category_by_id(category_data["id"])
    finally:
        cursor.close()
        conn.close()


@router.get("", response_model=List[CategoryResponse])
@limiter.limit(get_rate_limit("general"))
def get_categories(request: Request, is_active: Optional[bool] = None):
    """
    Get all categories, optionally filtered by active status.
    Returns categories ordered by display_order.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM categories WHERE is_active = %s ORDER BY display_order ASC, created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM categories ORDER BY display_order ASC, created_at DESC")
        else:
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM categories WHERE is_active = ? ORDER BY display_order ASC, created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM categories ORDER BY display_order ASC, created_at DESC")
        
        rows = cursor.fetchall()
        categories = []
        for row in rows:
            if isinstance(row, dict):
                categories.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                categories.append(dict(zip(columns, row)))
        
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/{category_id}", response_model=CategoryResponse)
@limiter.limit(get_rate_limit("general"))
def get_category(request: Request, category_id: str):
    """Get a specific category by ID. Rate limited to 100 requests per minute."""
    category = fetch_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID '{category_id}' not found."
        )
    return category


@router.post("", response_model=CategoryResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def create_category(request: Request, payload: CategoryCreate):
    """
    Create a new category.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    # Create category data
    now = datetime.now().isoformat()
    category_data = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "description": payload.description,
        "image_url": payload.image_url,
        "parent_id": payload.parent_id,
        "is_active": payload.is_active,
        "display_order": payload.display_order,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        saved_category = save_category(category_data)
        return saved_category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(e)}"
        )


@router.put("/{category_id}", response_model=CategoryResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def update_category(request: Request, category_id: str, payload: CategoryUpdate):
    """Update an existing category. Rate limited to 50 requests per minute."""
    category = fetch_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID '{category_id}' not found."
        )
    
    # Prepare update data
    update_data = category.copy()
    
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.image_url is not None:
        update_data["image_url"] = payload.image_url
    if payload.parent_id is not None:
        update_data["parent_id"] = payload.parent_id
    if payload.is_active is not None:
        update_data["is_active"] = payload.is_active
    if payload.display_order is not None:
        update_data["display_order"] = payload.display_order
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    try:
        updated_category = save_category(update_data)
        return updated_category
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update category: {str(e)}"
        )


@router.delete("/{category_id}", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def delete_category(request: Request, category_id: str):
    """Delete a category by ID. Rate limited to 50 requests per minute."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
        else:
            cursor.execute("DELETE FROM categories WHERE id = ?", (category_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID '{category_id}' not found."
            )
        
        return {"message": f"Category '{category_id}' successfully deleted.", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete category: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()



