from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..delivery_geo import STORE_LOCATION, geo_for_area
from ..models import DeliveryArea, DeliveryZone
from ..schemas import DeliveryAreaOut, DeliveryZoneOut


router = APIRouter(prefix='/delivery', tags=['Delivery'])


@router.get('/areas', response_model=list[DeliveryAreaOut])
def list_delivery_areas(db: Session = Depends(get_db)):
    areas = (
        db.query(DeliveryArea)
        .options(joinedload(DeliveryArea.zone))
        .filter(DeliveryArea.is_active.is_(True))
        .join(DeliveryZone)
        .order_by(DeliveryZone.sort_order, DeliveryArea.name)
        .all()
    )
    result = []
    for a in areas:
        geo = geo_for_area(a.name) or {}
        result.append(
            DeliveryAreaOut(
                id=a.id,
                name=a.name,
                zone_code=a.zone.code,
                zone_name=a.zone.name,
                delivery_fee=a.delivery_fee,
                eta_minutes=a.eta_minutes,
                city=geo.get('city'),
                lat=geo.get('lat'),
                lng=geo.get('lng'),
            )
        )
    return result


@router.get('/zones', response_model=list[DeliveryZoneOut])
def list_delivery_zones(db: Session = Depends(get_db)):
    zones = (
        db.query(DeliveryZone)
        .options(joinedload(DeliveryZone.areas))
        .filter(DeliveryZone.is_active.is_(True))
        .order_by(DeliveryZone.sort_order)
        .all()
    )
    return [
        DeliveryZoneOut(
            id=z.id,
            code=z.code,
            name=z.name,
            delivery_fee=z.delivery_fee,
            eta_minutes_min=z.eta_minutes_min,
            eta_minutes_max=z.eta_minutes_max,
            areas=[a.name for a in z.areas if a.is_active],
        )
        for z in zones
    ]


@router.get('/store-location')
def store_location():
    """Jhyaap Station coordinates for live map."""
    return STORE_LOCATION
