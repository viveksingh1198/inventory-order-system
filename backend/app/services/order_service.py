from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.exceptions import AppError
from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderItemResponse, OrderListResponse, OrderResponse


def _build_order_response(order: Order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else None,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
    )


def create_order(db: Session, payload: OrderCreate) -> OrderResponse:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise AppError("Customer not found", status_code=404)

    product_ids = [item.product_id for item in payload.items]
    if len(product_ids) != len(set(product_ids)):
        raise AppError("Duplicate products in order are not allowed", status_code=400)

    products: dict[int, Product] = {}
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise AppError(f"Product {item.product_id} not found", status_code=404)
        if product.quantity_in_stock < item.quantity:
            raise AppError(
                f"Insufficient stock for product '{product.name}'. "
                f"Available: {product.quantity_in_stock}, requested: {item.quantity}",
                status_code=400,
            )
        products[item.product_id] = product

    order_id: int
    try:
        order = Order(customer_id=payload.customer_id, total_amount=Decimal("0.00"), status="completed")
        db.add(order)
        db.flush()
        order_id = order.id

        total_amount = Decimal("0.00")
        for item in payload.items:
            product = products[item.product_id]
            unit_price = Decimal(str(product.price))
            line_total = unit_price * item.quantity
            total_amount += line_total

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
            db.add(order_item)
            product.quantity_in_stock -= item.quantity

        order.total_amount = total_amount
        db.commit()
    except AppError:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise AppError("Failed to create order", status_code=500) from exc

    order = db.scalar(
        select(Order)
        .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    )
    return _build_order_response(order)


def list_orders(db: Session) -> list[OrderListResponse]:
    orders = db.scalars(
        select(Order).options(selectinload(Order.customer), selectinload(Order.items)).order_by(Order.id.desc())
    ).all()

    return [
        OrderListResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.full_name if order.customer else None,
            total_amount=order.total_amount,
            status=order.status,
            created_at=order.created_at,
            item_count=len(order.items),
        )
        for order in orders
    ]


def get_order(db: Session, order_id: int) -> OrderResponse:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.customer), selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order_id)
    )
    if not order:
        raise AppError("Order not found", status_code=404)
    return _build_order_response(order)


def delete_order(db: Session, order_id: int) -> None:
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    if not order:
        raise AppError("Order not found", status_code=404)

    try:
        for item in order.items:
            product = db.get(Product, item.product_id)
            if product:
                product.quantity_in_stock += item.quantity
        db.delete(order)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise AppError("Failed to delete order", status_code=500) from exc
