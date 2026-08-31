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


@router.get("/eod-report")
def get_daily_eod_z_report(
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format (defaults to today)"),
    outlet_id: Optional[int] = Query(None, description="Filter by outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Daily End-of-Day (EOD) Z-Report & Cash Drawer Reconciliation."""
    from app.routers.outlets import get_effective_outlet_id
    from app.models import Outlet

    if current_user.role == "owner" and outlet_id is not None:
        target_outlet_id = get_effective_outlet_id(outlet_id, db)
    else:
        target_outlet_id = get_effective_outlet_id(current_user.outlet_id, db)

    outlet = db.query(Outlet).filter(Outlet.id == target_outlet_id).first()

    # Determine date range
    if date:
        try:
            report_date_start = datetime.datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format. Use YYYY-MM-DD")
    else:
        now = datetime.datetime.utcnow()
        report_date_start = datetime.datetime(now.year, now.month, now.day)

    report_date_end = report_date_start + datetime.timedelta(days=1)
    report_date_str = report_date_start.strftime("%Y-%m-%d")

    # Fetch orders for this date and outlet
    orders = (
        db.query(Order)
        .filter(
            Order.outlet_id == target_outlet_id,
            Order.created_at >= report_date_start,
            Order.created_at < report_date_end,
        )
        .all()
    )

    valid_orders = [o for o in orders if o.status != "cancelled"]
    cancelled_orders = [o for o in orders if o.status == "cancelled"]

    # Totals
    total_orders = len(valid_orders)
    gross_sales_paise = sum(o.subtotal_paise for o in valid_orders)
    total_discount_paise = sum((o.discount_paise or 0) for o in valid_orders)
    net_sales_paise = max(0, gross_sales_paise - total_discount_paise)
    total_tax_paise = sum(o.tax_paise for o in valid_orders)
    total_revenue_paise = sum(o.total_paise for o in valid_orders)
    avg_order_value_paise = int(total_revenue_paise / total_orders) if total_orders > 0 else 0

    # Payment Methods
    pm_breakdown = {
        "cash": {"count": 0, "total_paise": 0, "total_rupees": 0.0},
        "upi": {"count": 0, "total_paise": 0, "total_rupees": 0.0},
        "card": {"count": 0, "total_paise": 0, "total_rupees": 0.0},
        "cod": {"count": 0, "total_paise": 0, "total_rupees": 0.0},
        "counter": {"count": 0, "total_paise": 0, "total_rupees": 0.0},
    }

    for o in valid_orders:
        method = (o.payment_method or "counter").lower()
        if method not in pm_breakdown:
            pm_breakdown[method] = {"count": 0, "total_paise": 0, "total_rupees": 0.0}
        pm_breakdown[method]["count"] += 1
        pm_breakdown[method]["total_paise"] += o.total_paise
        pm_breakdown[method]["total_rupees"] = round(pm_breakdown[method]["total_paise"] / 100.0, 2)

    # Order Type (Dine-in vs Delivery)
    dine_in_orders = [o for o in valid_orders if (o.order_type or "dine_in") != "delivery"]
    delivery_orders = [o for o in valid_orders if (o.order_type or "").lower() == "delivery"]

    order_type_breakdown = {
        "dine_in": {
            "count": len(dine_in_orders),
            "total_paise": sum(o.total_paise for o in dine_in_orders),
            "total_rupees": round(sum(o.total_paise for o in dine_in_orders) / 100.0, 2),
        },
        "delivery": {
            "count": len(delivery_orders),
            "total_paise": sum(o.total_paise for o in delivery_orders),
            "total_rupees": round(sum(o.total_paise for o in delivery_orders) / 100.0, 2),
        }
    }

    # Promo Codes Used
    coupons_map = {}
    for o in valid_orders:
        if o.coupon_code:
            code = o.coupon_code.upper()
            if code not in coupons_map:
                coupons_map[code] = {"code": code, "times_used": 0, "discount_paise": 0}
            coupons_map[code]["times_used"] += 1
            coupons_map[code]["discount_paise"] += (o.discount_paise or 0)

    # Top 5 Best-Selling Dishes of the Day
    top_items_query = (
        db.query(
            OrderItem.item_name,
            func.sum(OrderItem.qty).label("qty_sold"),
            func.sum(OrderItem.total_price_paise).label("revenue_paise"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            Order.outlet_id == target_outlet_id,
            Order.status != "cancelled",
            Order.created_at >= report_date_start,
            Order.created_at < report_date_end,
        )
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.qty).desc())
        .limit(5)
        .all()
    )

    top_items = [
        {
            "item_name": r.item_name,
            "qty_sold": int(r.qty_sold or 0),
            "revenue_paise": int(r.revenue_paise or 0),
            "revenue_rupees": round(int(r.revenue_paise or 0) / 100.0, 2),
        }
        for r in top_items_query
    ]

    return {
        "report_date": report_date_str,
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "outlet": {
            "id": outlet.id if outlet else target_outlet_id,
            "name": outlet.name if outlet else "Arabieq Restaurant",
            "address": outlet.address if outlet else "",
            "phone": outlet.phone if outlet else "",
        },
        "sales_summary": {
            "total_orders": total_orders,
            "gross_sales_paise": gross_sales_paise,
            "gross_sales_rupees": round(gross_sales_paise / 100.0, 2),
            "total_discount_paise": total_discount_paise,
            "total_discount_rupees": round(total_discount_paise / 100.0, 2),
            "net_sales_paise": net_sales_paise,
            "net_sales_rupees": round(net_sales_paise / 100.0, 2),
            "total_tax_paise": total_tax_paise,
            "total_tax_rupees": round(total_tax_paise / 100.0, 2),
            "total_revenue_paise": total_revenue_paise,
            "total_revenue_rupees": round(total_revenue_paise / 100.0, 2),
            "avg_order_value_paise": avg_order_value_paise,
            "avg_order_value_rupees": round(avg_order_value_paise / 100.0, 2),
        },
        "payment_methods": pm_breakdown,
        "order_channels": order_type_breakdown,
        "coupons_used": list(coupons_map.values()),
        "top_selling_items": top_items,
        "cancelled_orders": {
            "count": len(cancelled_orders),
            "lost_revenue_paise": sum(o.total_paise for o in cancelled_orders),
            "lost_revenue_rupees": round(sum(o.total_paise for o in cancelled_orders) / 100.0, 2),
        }
    }
