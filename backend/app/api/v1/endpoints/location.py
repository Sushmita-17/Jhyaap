from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi import status as http_status
from app.models.location import RiderLocationCreate, RiderLocationResponse
from app.db.database import save_rider_location, fetch_latest_rider_location, fetch_rider_location_history
from app.middleware.rate_limiter import limiter, get_rate_limit
from app.middleware.auth import get_current_rider

router = APIRouter(prefix="/location", tags=["location"])


@router.post("/rider/{rider_id}")
@limiter.limit(get_rate_limit("general"))
def update_rider_location(request: Request, rider_id: str, location: RiderLocationCreate, current_rider: dict = Depends(get_current_rider)):
    """
    Update rider's GPS location.
    Rider-only endpoint. Rate limited to 120 requests per minute (2 per second).
    """
    # Verify the rider is updating their own location
    if current_rider.get("id") != rider_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You can only update your own location"
        )
    
    location_data = location.dict()
    location_data["rider_id"] = rider_id
    
    try:
        saved_location = save_rider_location(location_data)
        return {"message": "Location updated successfully", "location": saved_location}
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update location: {str(e)}"
        )


@router.get("/rider/{rider_id}/latest")
@limiter.limit(get_rate_limit("general"))
def get_rider_latest_location(request: Request, rider_id: str):
    """
    Get the latest location for a rider.
    Rate limited to 60 requests per minute.
    """
    location = fetch_latest_rider_location(rider_id)
    
    if not location:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="No location data found for this rider"
        )
    
    return location


@router.get("/rider/{rider_id}/history")
@limiter.limit(get_rate_limit("general"))
def get_rider_location_history(request: Request, rider_id: str, limit: int = 100):
    """
    Get location history for a rider.
    Rate limited to 30 requests per minute.
    """
    if limit > 1000:
        limit = 1000  # Cap at 1000 records
    
    history = fetch_rider_location_history(rider_id, limit)
    
    if not history:
        return {"message": "No location history found", "history": []}
    
    return {"history": history, "count": len(history)}
