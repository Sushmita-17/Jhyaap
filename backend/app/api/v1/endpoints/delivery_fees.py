from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.db.supabase_database import get_supabase_db

router = APIRouter()

class DeliveryFee(BaseModel):
    id: Optional[str] = None
    area_name: str
    city: str
    zone: str
    delivery_fee: float
    eta_minutes: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    is_active: bool = True

class DeliveryFeeUpdate(BaseModel):
    delivery_fee: float
    eta_minutes: Optional[int] = None
    is_active: Optional[bool] = None

@router.get("/delivery-fees")
async def get_delivery_fees():
    """Get all delivery fees"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        result = db.table('delivery_fees').select('*').eq('is_active', True).order('city', 'zone', 'area_name').execute()
        
        fees = []
        for row in result.data if result.data else []:
            fees.append({
                "id": row.get('id'),
                "area_name": row.get('area_name'),
                "city": row.get('city'),
                "zone": row.get('zone'),
                "delivery_fee": float(row.get('delivery_fee', 0)),
                "eta_minutes": row.get('eta_minutes', 30),
                "lat": float(row.get('lat')) if row.get('lat') else None,
                "lng": float(row.get('lng')) if row.get('lng') else None,
                "is_active": row.get('is_active', True),
                "created_at": row.get('created_at'),
                "updated_at": row.get('updated_at')
            })
        return {"fees": fees}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delivery-fees/{area_name}")
async def get_delivery_fee(area_name: str):
    """Get delivery fee for a specific area"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        result = db.table('delivery_fees').select('*').eq('area_name', area_name).eq('is_active', True).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Delivery fee not found")
        
        row = result.data[0]
        return {
            "id": row.get('id'),
            "area_name": row.get('area_name'),
            "city": row.get('city'),
            "zone": row.get('zone'),
            "delivery_fee": float(row.get('delivery_fee', 0)),
            "eta_minutes": row.get('eta_minutes', 30),
            "lat": float(row.get('lat')) if row.get('lat') else None,
            "lng": float(row.get('lng')) if row.get('lng') else None,
            "is_active": row.get('is_active', True),
            "created_at": row.get('created_at'),
            "updated_at": row.get('updated_at')
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/delivery-fees/city/{city}")
async def get_delivery_fees_by_city(city: str):
    """Get delivery fees for a specific city"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        result = db.table('delivery_fees').select('*').eq('city', city).eq('is_active', True).order('zone', 'area_name').execute()
        
        fees = []
        for row in result.data if result.data else []:
            fees.append({
                "id": row.get('id'),
                "area_name": row.get('area_name'),
                "city": row.get('city'),
                "zone": row.get('zone'),
                "delivery_fee": float(row.get('delivery_fee', 0)),
                "eta_minutes": row.get('eta_minutes', 30),
                "lat": float(row.get('lat')) if row.get('lat') else None,
                "lng": float(row.get('lng')) if row.get('lng') else None,
                "is_active": row.get('is_active', True),
                "created_at": row.get('created_at'),
                "updated_at": row.get('updated_at')
            })
        return {"fees": fees, "city": city}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/delivery-fees/{area_name}")
async def update_delivery_fee(area_name: str, fee_update: DeliveryFeeUpdate):
    """Update delivery fee for a specific area"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        # Check if area exists
        check_result = db.table('delivery_fees').select('id').eq('area_name', area_name).execute()
        if not check_result.data or len(check_result.data) == 0:
            raise HTTPException(status_code=404, detail="Delivery fee not found")
        
        # Build update data
        update_data = {}
        if fee_update.delivery_fee is not None:
            update_data['delivery_fee'] = fee_update.delivery_fee
        if fee_update.eta_minutes is not None:
            update_data['eta_minutes'] = fee_update.eta_minutes
        if fee_update.is_active is not None:
            update_data['is_active'] = fee_update.is_active
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = db.table('delivery_fees').update(update_data).eq('area_name', area_name).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Delivery fee not found")
        
        row = result.data[0]
        return {
            "id": row.get('id'),
            "area_name": row.get('area_name'),
            "city": row.get('city'),
            "zone": row.get('zone'),
            "delivery_fee": float(row.get('delivery_fee', 0)),
            "eta_minutes": row.get('eta_minutes', 30),
            "is_active": row.get('is_active', True),
            "updated_at": row.get('updated_at')
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/delivery-fees")
async def create_delivery_fee(fee: DeliveryFee):
    """Create a new delivery fee entry"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        fee_data = {
            "area_name": fee.area_name,
            "city": fee.city,
            "zone": fee.zone,
            "delivery_fee": fee.delivery_fee,
            "eta_minutes": fee.eta_minutes,
            "lat": fee.lat,
            "lng": fee.lng,
            "is_active": fee.is_active
        }
        
        result = db.table('delivery_fees').insert(fee_data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=500, detail="Failed to create delivery fee")
        
        row = result.data[0]
        return {
            "id": row.get('id'),
            "area_name": row.get('area_name'),
            "city": row.get('city'),
            "zone": row.get('zone'),
            "delivery_fee": float(row.get('delivery_fee', 0)),
            "eta_minutes": row.get('eta_minutes', 30),
            "lat": float(row.get('lat')) if row.get('lat') else None,
            "lng": float(row.get('lng')) if row.get('lng') else None,
            "is_active": row.get('is_active', True),
            "created_at": row.get('created_at'),
            "updated_at": row.get('updated_at')
        }
    except HTTPException:
        raise
    except Exception as e:
        if "duplicate key" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=400, detail="Area name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delivery-fees/{area_name}")
async def delete_delivery_fee(area_name: str):
    """Delete (deactivate) a delivery fee entry"""
    try:
        db = get_supabase_db()
        if not db:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        result = db.table('delivery_fees').update({'is_active': False}).eq('area_name', area_name).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Delivery fee not found")
        
        row = result.data[0]
        return {"message": "Delivery fee deactivated successfully", "id": row.get('id'), "area_name": row.get('area_name')}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
