import math
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import product_to_schema
from ..models import Brand, Category, Product
from ..schemas import PaginatedResponse, ProductOut


router = APIRouter(prefix='/products', tags=['Products'])

SORT_MAP = {
    'featured': desc(Product.popularity),
    'price-low': asc(Product.price),
    'price-high': desc(Product.price),
    'rating': desc(Product.rating),
    'reviews': desc(Product.review_count),
    'newest': desc(Product.created_at),
}


@router.get('', response_model=PaginatedResponse[ProductOut])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    volume_ml: Optional[int] = None,
    abv_min: Optional[Decimal] = None,
    abv_max: Optional[Decimal] = None,
    in_stock: Optional[bool] = None,
    deals_only: bool = False,
    sort: str = Query('featured', pattern='^(featured|price-low|price-high|rating|reviews|newest)$'),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Product)
        .options(joinedload(Product.brand), joinedload(Product.category))
        .filter(Product.status.in_(['active', 'out_of_stock']))
    )

    if search:
        term = f'%{search.lower()}%'
        query = query.join(Brand).join(Category).filter(
            or_(
                func.lower(Product.name).like(term),
                func.lower(Brand.name).like(term),
                func.lower(Category.name).like(term),
                func.lower(Product.subcategory).like(term),
                func.lower(Product.description).like(term),
            )
        )

    if category:
        query = query.join(Category, Product.category_id == Category.id).filter(Category.slug == category)

    if brand:
        query = query.join(Brand, Product.brand_id == Brand.id).filter(Brand.slug == brand)

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if volume_ml is not None:
        query = query.filter(Product.volume_ml == volume_ml)
    if abv_min is not None:
        query = query.filter(Product.abv_percent >= abv_min)
    if abv_max is not None:
        query = query.filter(Product.abv_percent <= abv_max)
    if in_stock is True:
        query = query.filter(Product.stock > 0, Product.status == 'active')
    if deals_only:
        query = query.filter(Product.discount_price.isnot(None))

    total = query.count()
    order = SORT_MAP.get(sort, desc(Product.popularity))
    products = query.order_by(order).offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        items=[product_to_schema(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )


@router.get('/trending', response_model=list[ProductOut])
def trending_products(limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    products = (
        db.query(Product)
        .options(joinedload(Product.brand), joinedload(Product.category))
        .filter(Product.status == 'active', Product.stock > 0)
        .order_by(desc(Product.popularity))
        .limit(limit)
        .all()
    )
    return [product_to_schema(p) for p in products]


@router.get('/search', response_model=list[ProductOut])
def search_products(q: str = Query(..., min_length=1), limit: int = 20, db: Session = Depends(get_db)):
    term = f'%{q.lower()}%'
    products = (
        db.query(Product)
        .options(joinedload(Product.brand), joinedload(Product.category))
        .join(Brand)
        .filter(
            Product.status == 'active',
            or_(
                func.lower(Product.name).like(term),
                func.lower(Brand.name).like(term),
            ),
        )
        .limit(limit)
        .all()
    )
    return [product_to_schema(p) for p in products]


@router.get('/{slug_or_id}', response_model=ProductOut)
def get_product(slug_or_id: str, db: Session = Depends(get_db)):
    query = db.query(Product).options(joinedload(Product.brand), joinedload(Product.category))
    product = query.filter(Product.slug == slug_or_id).first()
    if not product:
        try:
            pid = UUID(slug_or_id)
            product = query.filter(Product.id == pid).first()
        except ValueError:
            pass
    if not product:
        product = query.filter(Product.legacy_id == slug_or_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return product_to_schema(product)
