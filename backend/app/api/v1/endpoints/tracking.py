from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import asyncio
from datetime import datetime, timezone

router = APIRouter(prefix="/tracking", tags=["tracking"])

# Fast cache for low-latency REST responses; Supabase is the durable source
active_tracking_data = {}
arrival_notifications_sent = set()
def persist_tracking_location(order_id: str, location: dict) -> bool:
    """Persist the latest location while retaining REST's fast in-memory cache."""
    try:
        from app.db.supabase_client import get_supabase_client
        payload = {
            "order_id": order_id,
            "lat": float(location["lat"]),
            "lng": float(location["lng"]),
            "heading": float(location.get("heading") or 0),
            "status": location.get("status", "driving"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        get_supabase_client().table("live_tracking_locations").upsert(payload, on_conflict="order_id").execute()
        location["updated_at"] = payload["updated_at"]
        return True
    except Exception as error:
        print(f"Failed to persist tracking location for {order_id}: {error}")
        return False

class LocationUpdate(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    heading: Optional[float] = 0
    speed: Optional[float] = 0
    accuracy: Optional[float] = 0
    status: str = "driving"

    def normalized(self) -> dict:
        """Return a tracking dict using canonical lat/lng keys."""
        lat = self.lat if self.lat is not None else self.latitude
        lng = self.lng if self.lng is not None else self.longitude
        if lat is None or lng is None:
            raise ValueError("Either lat/lng or latitude/longitude must be provided.")
        return {
            "lat": float(lat),
            "lng": float(lng),
            "heading": float(self.heading or 0),
            "speed": float(self.speed or 0),
            "accuracy": float(self.accuracy or 0),
            "status": self.status,
        }

@router.get("/{order_id}/location")
async def get_rider_location(order_id: str):
    """
    REST Endpoint: Customer app calls this every 3 seconds to get the rider's current GPS.
    """
    if order_id in active_tracking_data:
        return {"status": "success", "data": active_tracking_data[order_id]}
    try:
        from app.db.supabase_client import get_supabase_client
        result = get_supabase_client().table("live_tracking_locations").select("*").eq("order_id", order_id).limit(1).execute()
        if result.data:
            active_tracking_data[order_id] = result.data[0]
            return {"status": "success", "data": result.data[0]}
    except Exception as error:
        print(f"Failed to read tracking location for {order_id}: {error}")
    return {"status": "pending", "message": "No live data available yet."}

@router.put("/{order_id}/location")
async def update_rider_location(order_id: str, location: LocationUpdate):
    """
    REST Endpoint: Rider app calls this every 3 seconds to push their phone's GPS.
    """
    try:
        tracking_data = location.normalized()
    except ValueError as error:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(error))
    active_tracking_data[order_id] = tracking_data
    persist_tracking_location(order_id, tracking_data)

    # Notify the customer once when the rider reports arrival at the destination.
    if location.status == "arrived" and order_id not in arrival_notifications_sent:
        try:
            from app.db.database import fetch_order_by_id
            order = fetch_order_by_id(order_id)
            customer_id = order.get("customer_id") if order else None
            if customer_id:
                from app.api.v1.endpoints.orders import create_notification
                create_notification(
                    user_id=customer_id,
                    user_type="customer",
                    title="Your rider is here",
                    message="Your rider has arrived at your delivery location.",
                    notification_type="delivery",
                    order_id=order_id,
                )
                arrival_notifications_sent.add(order_id)
        except Exception as error:
            print(f"Failed to create rider arrival notification: {error}")

    return {"status": "success"}

async def simulate_rider_movement(order_id: str, start_lat: float, start_lng: float, dest_lat: float, dest_lng: float):
    """
    Simulation Engine: Mathematically pushes updates to our REST store so the frontend has something to fetch!
    """
    steps = 40
    sleep_time = 2.0  # seconds between simulated REST updates
    
    current_lat = start_lat
    current_lng = start_lng
    lat_step = (dest_lat - start_lat) / steps
    lng_step = (dest_lng - start_lng) / steps

    active_tracking_data[order_id] = {"lat": current_lat, "lng": current_lng, "status": "driving", "heading": 90}
    persist_tracking_location(order_id, active_tracking_data[order_id])
    
    for _ in range(steps):
        await asyncio.sleep(sleep_time)
        current_lat += lat_step
        current_lng += lng_step
        
        active_tracking_data[order_id] = {
            "lat": current_lat,
            "lng": current_lng,
            "heading": 45,  # arbitrary direction
            "status": "driving"
        }
        persist_tracking_location(order_id, active_tracking_data[order_id])

    await asyncio.sleep(sleep_time)
    active_tracking_data[order_id] = {"lat": dest_lat, "lng": dest_lng, "status": "arrived", "heading": 0}
    persist_tracking_location(order_id, active_tracking_data[order_id])


@router.post("/simulate/{order_id}")
async def start_simulation(order_id: str, background_tasks: BackgroundTasks):
    store_lat = 27.7074359
    store_lng = 85.2853747
    dest_lat = 27.7122
    dest_lng = 85.3240
    
    background_tasks.add_task(simulate_rider_movement, order_id, store_lat, store_lng, dest_lat, dest_lng)
    return {"message": f"REST API Simulation started for order {order_id}"}
