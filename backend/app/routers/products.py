from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import AppError
from app.models.order import OrderItem
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.scalar(select(Product).where(Product.sku == payload.sku))
    if existing:
        raise AppError("Product SKU already exists", status_code=409)

    product = Product(**payload.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppError("Product SKU already exists", status_code=409)
    db.refresh(product)
    return product


@router.get("", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).order_by(Product.id)).all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise AppError("Product not found", status_code=404)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise AppError("Product not found", status_code=404)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise AppError("No fields to update", status_code=400)

    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.scalar(select(Product).where(Product.sku == update_data["sku"]))
        if existing:
            raise AppError("Product SKU already exists", status_code=409)

    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise AppError("Product SKU already exists", status_code=409)
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise AppError("Product not found", status_code=404)

    referenced = db.scalar(select(OrderItem).where(OrderItem.product_id == product_id))
    if referenced:
        raise AppError("Cannot delete product referenced by existing orders", status_code=409)

    db.delete(product)
    db.commit()
