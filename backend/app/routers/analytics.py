import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import get_db
from app.models import Order, OrderItem, MenuItem, Category, CafeTable, User
from app.routers.auth import require_staff_or_owner

router = APIRouter(prefix="", tags=["Sales & Analytics"])


@router.get("/summary")
def get_analytics_summary(
    outlet_id: Optional[int] = Query(None, description="Filter by outlet ID"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Overall cafe KPI summary: total orders, total revenue, average order value, active orders."""
    from app.routers.outlets import get_effective_outlet_id
    if current_user.role == "owner" and outlet_id is not None:
        target_outlet_id = get_effective_outlet_id(outlet_id, db)
    else:
        target_outlet_id = get_effective_outlet_id(current_user.outlet_id, db)

    # Base query for orders of this outlet
    base_orders = db.query(Order).filter(Order.outlet_id == target_outlet_id)

    if start_date:
        try:
            s_date = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            base_orders = base_orders.filter(Order.created_at >= s_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format. Use YYYY-MM-DD",
            )
    if end_date:
        try:
            e_date = datetime.datetime.strptime(end_date, "%Y-%m-%d") + datetime.timedelta(days=1)
            base_orders = base_orders.filter(Order.created_at < e_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format. Use YYYY-MM-DD",
            )

    # Aggregations on orders
    summary_stats = base_orders.filter(Order.status != "cancelled").with_entities(
        func.count(Order.id).label("total_orders"),
        func.coalesce(func.sum(Order.total_paise), 0).label("total_revenue"),
        func.coalesce(func.avg(Order.total_paise), 0).label("avg_order_value"),
    ).first()

    total_orders = int(summary_stats.total_orders or 0) if summary_stats else 0
    total_revenue_paise = int(summary_stats.total_revenue or 0) if summary_stats else 0
    avg_order_value_paise = int(summary_stats.avg_order_value or 0) if summary_stats else 0

    # Active orders count
    active_orders_count = base_orders.filter(
        Order.status.in_(["placed", "accepted", "preparing", "ready"])
    ).count()

    # Total items sold
    items_sold_query = (
        db.query(func.coalesce(func.sum(OrderItem.qty), 0))
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            Order.outlet_id == current_user.outlet_id,
            Order.status != "cancelled",
        )
    )
    if start_date:
        items_sold_query = items_sold_query.filter(Order.created_at >= s_date)
    if end_date:
        items_sold_query = items_sold_query.filter(Order.created_at < e_date)

    total_items_sold = int(items_sold_query.scalar() or 0)

    return {
        "total_orders": total_orders,
        "total_revenue_paise": total_revenue_paise,
        "total_revenue_rupees": round(total_revenue_paise / 100.0, 2),
        "avg_order_value_paise": avg_order_value_paise,
        "avg_order_value_rupees": round(avg_order_value_paise / 100.0, 2),
        "active_orders_count": active_orders_count,
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
    today = datetime.datetime.utcnow().date()
    end_date = today + datetime.timedelta(days=1)
    start_date = today - datetime.timedelta(days=days - 1)

    # Initialize daily map
    grouped: Dict[str, Dict[str, Any]] = {}
    current = start_date
    while current <= today:
        d_str = current.strftime("%Y-%m-%d")
        grouped[d_str] = {
            "date": d_str,
            "display_date": current.strftime("%b %d"),
            "order_count": 0,
            "revenue_paise": 0,
            "revenue_rupees": 0.0,
        }
        current += datetime.timedelta(days=1)

    # Query only relevant date range
    orders = (
        db.query(Order)
        .filter(
            Order.outlet_id == current_user.outlet_id,
            Order.status != "cancelled",
            Order.created_at >= start_date,
            Order.created_at < end_date,
        )
        .all()
    )

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
        .filter(Order.outlet_id == current_user.outlet_id, Order.status != "cancelled")
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
        .filter(Order.outlet_id == current_user.outlet_id, Order.status != "cancelled")
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
    """Sales and revenue breakdown by category via a single aggregated query."""
    results = (
        db.query(
            Category.id.label("category_id"),
            Category.name.label("category_name"),
            Category.name_te.label("category_name_te"),
            func.coalesce(func.sum(OrderItem.qty), 0).label("qty_sold"),
            func.coalesce(func.sum(OrderItem.total_price_paise), 0).label("revenue_paise"),
        )
        .join(MenuItem, MenuItem.category_id == Category.id, isouter=True)
        .join(
            OrderItem,
            (OrderItem.item_id == MenuItem.id),
            isouter=True
        )
        .join(
            Order,
            (Order.id == OrderItem.order_id) & (Order.status != "cancelled") & (Order.outlet_id == current_user.outlet_id),
            isouter=True
        )
        .filter(Category.outlet_id == current_user.outlet_id)
        .group_by(Category.id, Category.name, Category.name_te)
        .all()
    )

    total_revenue_overall = sum(int(r.revenue_paise or 0) for r in results)

    cat_sales = []
    for r in results:
        rev = int(r.revenue_paise or 0)
        pct = round((rev / total_revenue_overall * 100), 1) if total_revenue_overall > 0 else 0.0
        cat_sales.append({
            "category_id": r.category_id,
            "category_name": r.category_name,
            "category_name_te": r.category_name_te,
            "qty_sold": int(r.qty_sold or 0),
            "revenue_paise": rev,
            "revenue_rupees": round(rev / 100.0, 2),
            "percentage": pct,
        })

    return cat_sales


@router.get("/table-turnover")
def get_table_turnover(
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Table turnover frequency and revenue generated per table via single aggregated query."""
    results = (
        db.query(
            CafeTable.id.label("table_id"),
            CafeTable.label.label("table_label"),
            CafeTable.status.label("status"),
            func.count(Order.id).label("order_count"),
            func.coalesce(func.sum(Order.total_paise), 0).label("revenue_paise"),
        )
        .outerjoin(
            Order,
            (Order.table_id == CafeTable.id) & (Order.status != "cancelled") & (Order.outlet_id == current_user.outlet_id)
        )
        .filter(CafeTable.outlet_id == current_user.outlet_id)
        .group_by(CafeTable.id, CafeTable.label, CafeTable.status)
        .order_by(CafeTable.id.asc())
        .all()
    )

    turnover = []
    for r in results:
        rev = int(r.revenue_paise or 0)
        turnover.append({
            "table_id": r.table_id,
            "table_label": r.table_label,
            "status": r.status,
            "order_count": int(r.order_count or 0),
            "revenue_paise": rev,
            "revenue_rupees": round(rev / 100.0, 2),
        })

    return turnover
