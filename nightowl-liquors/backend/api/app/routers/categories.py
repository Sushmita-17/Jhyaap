from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Category, Product
from ..schemas import CategoryOut, PaginatedResponse, ProductOut
from ..deps import product_to_schema


router = APIRouter(prefix='/categories', tags=['Categories'])


@router.get('', response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .order_by(Category.sort_order, Category.name)
        .all()
    )
    result = []
    for cat in categories:
        count = (
            db.query(func.count(Product.id))
            .filter(Product.category_id == cat.id, Product.status == 'active')
            .scalar()
        )
        result.append(
            CategoryOut(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                icon=cat.icon or '',
                color=cat.color or '',
                image=cat.image or '',
                product_count=count or 0,
            )
        )
    return result


@router.get('/{slug}/products', response_model=PaginatedResponse[ProductOut])
def category_products(slug: str, page: int = 1, page_size: int = 24, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug, Category.is_active.is_(True)).first()
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')

    query = (
        db.query(Product)
        .options(joinedload(Product.brand), joinedload(Product.category))
        .filter(Product.category_id == category.id, Product.status.in_(['active', 'out_of_stock']))
    )
    total = query.count()
    products = query.order_by(Product.popularity.desc()).offset((page - 1) * page_size).limit(page_size).all()
    import math

    return PaginatedResponse(
        items=[product_to_schema(p) for p in products],
        total=total,
        page=page,
        page_size=page_size,
        pages=max(1, math.ceil(total / page_size)),
    )
