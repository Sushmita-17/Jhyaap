import uuid
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.db.database import get_connection, is_postgres
from app.models.banner import BannerCreate, BannerUpdate, BannerResponse
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_admin

router = APIRouter(prefix="/banners", tags=["banners"])


def fetch_banner_by_id(banner_id: str) -> Optional[dict]:
    """Fetch a banner by ID"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute(
                "SELECT * FROM banners WHERE id = %s",
                (banner_id,)
            )
        else:
            cursor.execute(
                "SELECT * FROM banners WHERE id = ?",
                (banner_id,)
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


def save_banner(banner_data: dict) -> dict:
    """Save a banner to the database"""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("""
                INSERT INTO banners 
                (id, title, subtitle, image_url, cta_text, cta_link, tag, is_active, display_order, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    subtitle = EXCLUDED.subtitle,
                    image_url = EXCLUDED.image_url,
                    cta_text = EXCLUDED.cta_text,
                    cta_link = EXCLUDED.cta_link,
                    tag = EXCLUDED.tag,
                    is_active = EXCLUDED.is_active,
                    display_order = EXCLUDED.display_order,
                    updated_at = EXCLUDED.updated_at
                RETURNING *
            """, (
                banner_data["id"],
                banner_data["title"],
                banner_data.get("subtitle"),
                banner_data["image_url"],
                banner_data.get("cta_text"),
                banner_data.get("cta_link"),
                banner_data.get("tag"),
                banner_data["is_active"],
                banner_data["display_order"],
                banner_data["created_at"],
                banner_data["updated_at"]
            ))
        else:
            cursor.execute("""
                INSERT OR REPLACE INTO banners 
                (id, title, subtitle, image_url, cta_text, cta_link, tag, is_active, display_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                banner_data["id"],
                banner_data["title"],
                banner_data.get("subtitle"),
                banner_data["image_url"],
                banner_data.get("cta_text"),
                banner_data.get("cta_link"),
                banner_data.get("tag"),
                banner_data["is_active"],
                banner_data["display_order"],
                banner_data["created_at"],
                banner_data["updated_at"]
            ))
        
        conn.commit()
        return fetch_banner_by_id(banner_data["id"])
    finally:
        cursor.close()
        conn.close()


@router.get("", response_model=List[BannerResponse])
@limiter.limit(get_rate_limit("general"))
def get_banners(request: Request, is_active: Optional[bool] = None):
    """
    Get all banners, optionally filtered by active status.
    Returns banners ordered by display_order.
    Rate limited to 100 requests per minute.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM banners WHERE is_active = %s ORDER BY display_order ASC, created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM banners ORDER BY display_order ASC, created_at DESC")
        else:
            if is_active is not None:
                cursor.execute(
                    "SELECT * FROM banners WHERE is_active = ? ORDER BY display_order ASC, created_at DESC",
                    (is_active,)
                )
            else:
                cursor.execute("SELECT * FROM banners ORDER BY display_order ASC, created_at DESC")
        
        rows = cursor.fetchall()
        banners = []
        for row in rows:
            if isinstance(row, dict):
                banners.append(dict(row))
            else:
                columns = [col[0] for col in cursor.description]
                banners.append(dict(zip(columns, row)))
        
        return banners
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch banners: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()


@router.get("/{banner_id}", response_model=BannerResponse)
@limiter.limit(get_rate_limit("general"))
def get_banner(request: Request, banner_id: str):
    """Get a specific banner by ID. Rate limited to 100 requests per minute."""
    banner = fetch_banner_by_id(banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner with ID '{banner_id}' not found."
        )
    return banner


@router.post("", response_model=BannerResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def create_banner(request: Request, payload: BannerCreate):
    """
    Create a new banner.
    Admin-only endpoint. Rate limited to 50 requests per minute.
    """
    # Create banner data
    now = datetime.now().isoformat()
    banner_data = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "subtitle": payload.subtitle,
        "image_url": payload.image_url,
        "cta_text": payload.cta_text,
        "cta_link": payload.cta_link,
        "tag": payload.tag,
        "is_active": payload.is_active,
        "display_order": payload.display_order,
        "created_at": now,
        "updated_at": now
    }
    
    try:
        saved_banner = save_banner(banner_data)
        return saved_banner
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create banner: {str(e)}"
        )


@router.put("/{banner_id}", response_model=BannerResponse, dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def update_banner(request: Request, banner_id: str, payload: BannerUpdate):
    """Update an existing banner. Rate limited to 50 requests per minute."""
    banner = fetch_banner_by_id(banner_id)
    if not banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Banner with ID '{banner_id}' not found."
        )
    
    # Prepare update data
    update_data = banner.copy()
    
    if payload.title is not None:
        update_data["title"] = payload.title
    if payload.subtitle is not None:
        update_data["subtitle"] = payload.subtitle
    if payload.image_url is not None:
        update_data["image_url"] = payload.image_url
    if payload.cta_text is not None:
        update_data["cta_text"] = payload.cta_text
    if payload.cta_link is not None:
        update_data["cta_link"] = payload.cta_link
    if payload.tag is not None:
        update_data["tag"] = payload.tag
    if payload.is_active is not None:
        update_data["is_active"] = payload.is_active
    if payload.display_order is not None:
        update_data["display_order"] = payload.display_order
    
    update_data["updated_at"] = datetime.now().isoformat()
    
    try:
        updated_banner = save_banner(update_data)
        return updated_banner
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update banner: {str(e)}"
        )


@router.delete("/{banner_id}", dependencies=[Depends(get_current_admin)])
@limiter.limit(get_rate_limit("admin"))
def delete_banner(request: Request, banner_id: str):
    """Delete a banner by ID. Rate limited to 50 requests per minute."""
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres(conn):
            cursor.execute("DELETE FROM banners WHERE id = %s", (banner_id,))
        else:
            cursor.execute("DELETE FROM banners WHERE id = ?", (banner_id,))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Banner with ID '{banner_id}' not found."
            )
        
        return {"message": f"Banner '{banner_id}' successfully deleted.", "success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete banner: {str(e)}"
        )
    finally:
        cursor.close()
        conn.close()



