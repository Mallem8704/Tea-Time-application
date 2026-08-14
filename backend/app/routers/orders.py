import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Order, OrderItem, MenuItem, CafeTable, Outlet, StockLog, User
from app.schemas import OrderCreate, OrderStatusUpdate, OrderOut, OrderItemOut
from app.routers.auth import require_staff_or_owner
from app.routers.ws import manager
from app.audit_utils import log_audit

router = APIRouter(prefix="", tags=["Orders"])

VALID_STATUSES = ["placed", "accepted", "preparing", "ready", "served", "cancelled"]


def generate_order_number():
    """Generate a unique order number with retry on collision."""
    import uuid
    date_part = datetime.date.today().strftime("%y%m%d")
    unique_part = uuid.uuid4().hex[:6].upper()
    return f"TT-{date_part}-{unique_part}"


def format_order_response(order: Order) -> OrderOut:
    """Helper to format Order model to OrderOut schema with table_label."""
    table_label = order.table.label if order.table else f"T{order.table_id}"
    return OrderOut(
        id=order.id,
        outlet_id=order.outlet_id,
        table_id=order.table_id,
        table_label=table_label,
        order_number=order.order_number,
        status=order.status,
        subtotal_paise=order.subtotal_paise,
        tax_paise=order.tax_paise,
        total_paise=order.total_paise,
        payment_status=order.payment_status,
        payment_method=order.payment_method,
        customer_notes=order.customer_notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            OrderItemOut(
                id=item.id,
                order_id=item.order_id,
                item_id=item.item_id,
                item_name=item.item_name,
                qty=item.qty,
                unit_price_paise=item.unit_price_paise,
                total_price_paise=item.total_price_paise,
                notes=item.notes,
            )
            for item in order.items
        ],
    )


# ==========================================
# CUSTOMER / CASHIER ORDER PLACEMENT
# ==========================================

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
):
    """Place a new customer order.

    Calculates subtotal, tax in paise, auto-deducts inventory for tracked items,
    updates table occupancy, and broadcasts 'new_order' event to connected admin dashboards.
    """
    if not data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    # 1. Verify Table exists
    table = db.query(CafeTable).filter(CafeTable.id == data.table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {data.table_id} does not exist",
        )

    # 2. Fetch Outlet for tax calculation
    outlet = db.query(Outlet).filter(Outlet.id == table.outlet_id).first()
    tax_rate = outlet.tax_rate_percent if outlet else 5

    order_number = generate_order_number()
    subtotal_paise = 0
    order_items_to_create = []
    stock_logs_to_create = []

    # 3. Validate each item and calculate totals
    for item_req in data.items:
        if item_req.qty <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Item quantity must be greater than 0",
            )

        menu_item = (
            db.query(MenuItem)
            .filter(MenuItem.id == item_req.item_id, MenuItem.outlet_id == table.outlet_id)
            .with_for_update()
            .first()
        )
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_req.item_id} not found in this outlet",
            )

        if not menu_item.is_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{menu_item.name}' is currently unavailable/out of stock",
            )

        # Inventory check & deduction
        if menu_item.track_stock:
            if menu_item.stock_qty < item_req.qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{menu_item.name}'. Available: {menu_item.stock_qty}, Requested: {item_req.qty}",
                )

            # Auto-deduct stock
            menu_item.stock_qty -= item_req.qty

            # Prepare stock deduction log
            stock_log = StockLog(
                outlet_id=table.outlet_id,
                item_id=menu_item.id,
                change_qty=-item_req.qty,
                reason="sale",
                notes=f"Order {order_number} ({table.label})",
            )
            stock_logs_to_create.append(stock_log)

        unit_price = menu_item.price_paise
        item_total = unit_price * item_req.qty
        subtotal_paise += item_total

        order_items_to_create.append({
            "item_id": menu_item.id,
            "item_name": menu_item.name,
            "qty": item_req.qty,
            "unit_price_paise": unit_price,
            "total_price_paise": item_total,
            "notes": item_req.notes.strip() if item_req.notes else None,
        })

    # 4. Financial Calculations in Paise
    tax_paise = int(round(subtotal_paise * (tax_rate / 100.0)))
    total_paise = subtotal_paise + tax_paise

    # 5. Create Order record
    new_order = Order(
        outlet_id=table.outlet_id,
        table_id=table.id,
        order_number=order_number,
        status="placed",
        subtotal_paise=subtotal_paise,
        tax_paise=tax_paise,
        total_paise=total_paise,
        payment_status="pending",
        payment_method=data.payment_method or "counter",
        customer_notes=data.customer_notes.strip() if data.customer_notes else None,
    )
    db.add(new_order)
    db.flush()

    # 6. Create Order Items
    for oi_data in order_items_to_create:
        order_item = OrderItem(
            order_id=new_order.id,
            item_id=oi_data["item_id"],
            item_name=oi_data["item_name"],
            qty=oi_data["qty"],
            unit_price_paise=oi_data["unit_price_paise"],
            total_price_paise=oi_data["total_price_paise"],
            notes=oi_data["notes"],
        )
        db.add(order_item)

    # 7. Add stock logs
    for s_log in stock_logs_to_create:
        db.add(s_log)

    # 8. Update table status
    table.status = "occupied"
    table.active_order_id = new_order.id

    log_audit(
        db=db,
        outlet_id=table.outlet_id,
        user_id=None,  # Customer initiated
        action="place_order",
        entity_type="order",
        entity_id=new_order.id,
        details={
            "order_number": new_order.order_number,
            "table": table.label,
            "items_count": len(order_items_to_create),
            "total_formatted": f"₹{total_paise / 100:.2f}",
        },
    )

    db.commit()
    db.refresh(new_order)

    formatted_response = format_order_response(new_order)

    # Broadcast real-time event to Admin Dashboards
    await manager.broadcast_to_admin(
        outlet_id=table.outlet_id,
        event_type="new_order",
        data=formatted_response.model_dump(mode="json"),
    )

    return formatted_response


# ==========================================
# ORDER STATUS PROGRESSION (ADMIN/STAFF)
# ==========================================

@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Progress order status: placed -> accepted -> preparing -> ready -> served (or cancelled).

    Broadcasts real-time event to customer tracking page and admin boards.
    """
    new_status = data.status.strip().lower()
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{new_status}'. Allowed statuses: {', '.join(VALID_STATUSES)}",
        )

    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.table))
        .filter(Order.id == order_id, Order.outlet_id == current_user.outlet_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )

    old_status = order.status
    order.status = new_status

    # If cancelling, restore deducted stock
    if new_status == "cancelled" and old_status != "cancelled":
        for oi in order.items:
            if oi.item_id:
                m_item = db.query(MenuItem).filter(MenuItem.id == oi.item_id).first()
                if m_item and m_item.track_stock:
                    m_item.stock_qty += oi.qty
                    restock_log = StockLog(
                        outlet_id=order.outlet_id,
                        item_id=m_item.id,
                        change_qty=oi.qty,
                        reason="adjustment",
                        staff_id=current_user.id,
                        notes=f"Order {order.order_number} cancelled by {current_user.name}",
                    )
                    db.add(restock_log)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="order_status_change",
        entity_type="order",
        entity_id=order.id,
        details={
            "order_number": order.order_number,
            "old_status": old_status,
            "new_status": new_status,
            "updated_by": current_user.name,
        },
    )

    db.commit()
    db.refresh(order)

    formatted_response = format_order_response(order)

    # Broadcast real-time status update to customer tracking socket and admin board
    await manager.broadcast_to_order(
        order_id=order.id,
        event_type="order_status_updated",
        data=formatted_response.model_dump(mode="json"),
        outlet_id=order.outlet_id,
    )

    return formatted_response


# ==========================================
# ORDER QUERY ENDPOINTS
# ==========================================

@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[str] = Query(None, description="Filter by status (e.g. 'placed,preparing')"),
    table_id: Optional[int] = Query(None, description="Filter by table ID"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    date: Optional[str] = Query(None, description="Filter by date YYYY-MM-DD"),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Admin endpoint to list and filter cafe orders."""
    query = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.table))
        .filter(Order.outlet_id == current_user.outlet_id)
    )

    if status:
        status_list = [s.strip().lower() for s in status.split(",") if s.strip()]
        if status_list:
            query = query.filter(Order.status.in_(status_list))

    if table_id is not None:
        query = query.filter(Order.table_id == table_id)

    if payment_status:
        query = query.filter(Order.payment_status == payment_status.strip().lower())

    if date:
        try:
            target_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            next_date = target_date + datetime.timedelta(days=1)
            query = query.filter(
                Order.created_at >= target_date,
                Order.created_at < next_date,
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD",
            )

    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [format_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    """Customer and Admin order detail lookup (no login required for customer tracking)."""
    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.table))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )

    return format_order_response(order)
