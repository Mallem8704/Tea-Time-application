import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database import get_db
from app.models import Order, OrderItem, MenuItem, Category, CafeTable, User
from app.routers.auth import require_staff_or_owner

router = APIRouter(prefix="", tags=["Sales & Analytics"])


@router.get("/summary")
def get_analytics_summary(
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Overall cafe KPI summary: total orders, total revenue, average order value, active orders."""
    query = db.query(Order).filter(Order.outlet_id == outlet_id)

    if start_date:
        s_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
        query = query.filter(Order.created_at >= s_date)
    if end_date:
        e_date = datetime.datetime.strptime(end_date, "%Y-%m-%d") + datetime.timedelta(days=1)
        query = query.filter(Order.created_at < e_date)

    all_orders = query.all()
    valid_orders = [o for o in all_orders if o.status != "cancelled"]
    active_orders = [o for o in all_orders if o.status in ["placed", "accepted", "preparing", "ready"]]

    total_orders = len(valid_orders)
    total_revenue_paise = sum(o.total_paise for o in valid_orders)
    avg_order_value_paise = int(total_revenue_paise / total_orders) if total_orders > 0 else 0

    # Total items sold
    order_ids = [o.id for o in valid_orders]
    total_items_sold = 0
    if order_ids:
        items_sold_res = (
            db.query(func.coalesce(func.sum(OrderItem.qty), 0))
            .filter(OrderItem.order_id.in_(order_ids))
            .scalar()
        )
        total_items_sold = int(items_sold_res or 0)

    return {
        "total_orders": total_orders,
        "total_revenue_paise": total_revenue_paise,
        "total_revenue_rupees": round(total_revenue_paise / 100.0, 2),
        "avg_order_value_paise": avg_order_value_paise,
        "avg_order_value_rupees": round(avg_order_value_paise / 100.0, 2),
        "active_orders_count": len(active_orders),
        "total_items_sold": total_items_sold,
        "currency": "INR",
    }


@router.get("/revenue-over-time")
def get_revenue_over_time(
    days: int = Query(7, ge=1, le=90, description="Number of past days"),
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Daily revenue and order volume trend for charts."""
    end_date = datetime.datetime.utcnow().date() + datetime.timedelta(days=1)
    start_date = datetime.datetime.utcnow().date() - datetime.timedelta(days=days - 1)

    orders = (
        db.query(Order)
        .filter(
            Order.outlet_id == outlet_id,
            Order.status != "cancelled",
            Order.created_at >= start_date,
            Order.created_at < end_date,
        )
        .all()
    )

    # Group by date YYYY-MM-DD
    grouped: Dict[str, Dict[str, Any]] = {}
    current = start_date
    while current <= datetime.datetime.utcnow().date():
        d_str = current.strftime("%Y-%m-%d")
        grouped[d_str] = {
            "date": d_str,
            "display_date": current.strftime("%b %d"),
            "order_count": 0,
            "revenue_paise": 0,
            "revenue_rupees": 0.0,
        }
        current += datetime.timedelta(days=1)

    for o in orders:
        d_str = o.created_at.strftime("%Y-%m-%d")
        if d_str in grouped:
            grouped[d_str]["order_count"] += 1
            grouped[d_str]["revenue_paise"] += o.total_paise
            grouped[d_str]["revenue_rupees"] = round(grouped[d_str]["revenue_paise"] / 100.0, 2)

    return list(grouped.values())


@router.get("/top-items")
def get_top_selling_items(
    limit: int = Query(10, ge=1, le=50),
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Best-selling menu items ranked by quantity and revenue."""
    results = (
        db.query(
            OrderItem.item_id,
            OrderItem.item_name,
            func.sum(OrderItem.qty).label("qty_sold"),
            func.sum(OrderItem.total_price_paise).label("revenue_paise"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.outlet_id == outlet_id, Order.status != "cancelled")
        .group_by(OrderItem.item_id, OrderItem.item_name)
        .order_by(func.sum(OrderItem.qty).desc())
        .limit(limit)
        .all()
    )

    top_items = []
    for r in results:
        rev_paise = int(r.revenue_paise or 0)
        top_items.append({
            "item_id": r.item_id,
            "item_name": r.item_name,
            "qty_sold": int(r.qty_sold or 0),
            "revenue_paise": rev_paise,
            "revenue_rupees": round(rev_paise / 100.0, 2),
        })

    return top_items


@router.get("/hourly-distribution")
def get_hourly_order_distribution(
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Hourly order frequency and peak heat hours distribution."""
    orders = (
        db.query(Order)
        .filter(Order.outlet_id == outlet_id, Order.status != "cancelled")
        .all()
    )

    hourly_map = {
        h: {
            "hour": h,
            "label": datetime.time(h).strftime("%I %p").lstrip("0"),
            "order_count": 0,
            "revenue_paise": 0,
            "revenue_rupees": 0.0,
        }
        for h in range(24)
    }

    for o in orders:
        h = o.created_at.hour
        hourly_map[h]["order_count"] += 1
        hourly_map[h]["revenue_paise"] += o.total_paise
        hourly_map[h]["revenue_rupees"] = round(hourly_map[h]["revenue_paise"] / 100.0, 2)

    return list(hourly_map.values())


@router.get("/category-breakdown")
def get_category_sales_breakdown(
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Sales and revenue breakdown by category."""
    categories = db.query(Category).filter(Category.outlet_id == outlet_id).all()
    cat_sales = []

    total_revenue_overall = 0
    temp_list = []

    for cat in categories:
        item_ids = [it.id for it in cat.items]
        if not item_ids:
            continue

        res = (
            db.query(
                func.coalesce(func.sum(OrderItem.qty), 0).label("qty_sold"),
                func.coalesce(func.sum(OrderItem.total_price_paise), 0).label("revenue_paise"),
            )
            .join(Order, OrderItem.order_id == Order.id)
            .filter(
                Order.outlet_id == outlet_id,
                Order.status != "cancelled",
                OrderItem.item_id.in_(item_ids),
            )
            .first()
        )

        qty = int(res.qty_sold if res else 0)
        rev = int(res.revenue_paise if res else 0)
        total_revenue_overall += rev

        temp_list.append({
            "category_id": cat.id,
            "category_name": cat.name,
            "category_name_te": cat.name_te,
            "qty_sold": qty,
            "revenue_paise": rev,
            "revenue_rupees": round(rev / 100.0, 2),
        })

    for item in temp_list:
        pct = round((item["revenue_paise"] / total_revenue_overall * 100), 1) if total_revenue_overall > 0 else 0.0
        item["percentage"] = pct
        cat_sales.append(item)

    return cat_sales


@router.get("/table-turnover")
def get_table_turnover(
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Table turnover frequency and revenue generated per table."""
    tables = db.query(CafeTable).filter(CafeTable.outlet_id == outlet_id).order_by(CafeTable.id.asc()).all()
    turnover = []

    for t in tables:
        res = (
            db.query(
                func.count(Order.id).label("order_count"),
                func.coalesce(func.sum(Order.total_paise), 0).label("revenue_paise"),
            )
            .filter(
                Order.table_id == t.id,
                Order.status != "cancelled",
            )
            .first()
        )

        cnt = int(res.order_count if res else 0)
        rev = int(res.revenue_paise if res else 0)

        turnover.append({
            "table_id": t.id,
            "table_label": t.label,
            "status": t.status,
            "order_count": cnt,
            "revenue_paise": rev,
            "revenue_rupees": round(rev / 100.0, 2),
        })

    return turnover
