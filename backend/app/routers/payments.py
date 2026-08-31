import os
import hmac
import hashlib
import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from dotenv import load_dotenv

from app.database import get_db
from app.models import Order, Payment, User
from app.schemas import (
    RazorpayOrderRequest,
    RazorpayOrderResponse,
    RazorpayVerifyRequest,
    MarkCashPaidRequest,
    PaymentOut,
    OrderOut,
)
from app.routers.auth import require_staff_or_owner
from app.routers.ws import manager
from app.audit_utils import log_audit

load_dotenv()

router = APIRouter(prefix="", tags=["Payments & Cashier"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_sampleKey123")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "sampleSecretKey123")


# ==========================================
# RAZORPAY UPI / ONLINE PAYMENT INTEGRATION
# ==========================================

@router.post("/create-razorpay-order", response_model=RazorpayOrderResponse)
def create_razorpay_order(
    data: RazorpayOrderRequest,
    db: Session = Depends(get_db),
):
    """Generate a Razorpay Order ID for online UPI / Card checkout."""
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {data.order_id} not found",
        )

    if order.payment_status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already paid",
        )

    # In production, call razorpay_client.order.create(...)
    # For zero-config local & sandbox testing, generate compliant Razorpay order ID
    rzp_order_id = f"order_rzp_{uuid.uuid4().hex[:14]}"

    return RazorpayOrderResponse(
        razorpay_order_id=rzp_order_id,
        amount_paise=order.total_paise,
        currency="INR",
        key_id=RAZORPAY_KEY_ID,
        order_number=order.order_number,
    )


@router.post("/verify-razorpay-payment")
async def verify_razorpay_payment(
    data: RazorpayVerifyRequest,
    db: Session = Depends(get_db),
):
    """Verify Razorpay payment signature and mark order as paid."""
    order = db.query(Order).options(joinedload(Order.items), joinedload(Order.table)).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {data.order_id} not found",
        )

    # Validate HMAC signature if non-test secret or verify structure
    expected_msg = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    generated_sig = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        expected_msg.encode(),
        hashlib.sha256,
    ).hexdigest()

    # In test sandbox mode, allow simulated signatures or verified HMAC signatures
    is_production = os.getenv("ENVIRONMENT", "development") == "production"
    if is_production:
        is_valid = hmac.compare_digest(generated_sig, data.razorpay_signature)
    else:
        # In development/sandbox, allow mock signatures for testing
        is_valid = (
            hmac.compare_digest(generated_sig, data.razorpay_signature)
            or data.razorpay_signature.startswith("mock_sig_")
        )

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay payment signature",
        )

    # Update order payment state
    order.payment_status = "paid"
    order.payment_method = "upi"

    payment = Payment(
        order_id=order.id,
        method="upi",
        txn_id=data.razorpay_payment_id,
        amount_paise=order.total_paise,
        status="completed",
        paid_at=datetime.datetime.utcnow(),
        notes=f"Razorpay UPI/Online payment verified (Order: {data.razorpay_order_id})",
    )
    db.add(payment)

    log_audit(
        db=db,
        outlet_id=order.outlet_id,
        user_id=None,
        action="online_payment_completed",
        entity_type="payment",
        entity_id=order.id,
        details={
            "order_number": order.order_number,
            "amount_paise": order.total_paise,
            "amount_formatted": f"₹{order.total_paise / 100:.2f}",
            "txn_id": data.razorpay_payment_id,
            "method": "upi",
        },
    )

    db.commit()
    db.refresh(order)

    # Broadcast live payment update to customer and admin
    from app.routers.orders import format_order_response
    formatted = format_order_response(order)
    await manager.broadcast_to_order(
        order_id=order.id,
        event_type="order_status_updated",
        data=formatted.model_dump(mode="json"),
        outlet_id=order.outlet_id,
    )

    return {
        "success": True,
        "message": "Payment verified successfully",
        "order_number": order.order_number,
        "amount_paise": order.total_paise,
        "amount_formatted": f"₹{order.total_paise / 100:.2f}",
        "payment_status": "paid",
    }


# ==========================================
# COUNTER CASH RECONCILIATION
# ==========================================

@router.post("/{order_id}/mark-cash-paid")
async def mark_cash_payment_paid(
    order_id: int,
    data: Optional[MarkCashPaidRequest] = None,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Mark an order as paid in cash at counter (Cashier reconciliation)."""
    order = db.query(Order).options(joinedload(Order.items), joinedload(Order.table)).filter(Order.id == order_id, Order.outlet_id == current_user.outlet_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found",
        )

    if order.payment_status == "paid":
        return {
            "success": True,
            "message": "Order was already marked as paid",
            "order_number": order.order_number,
            "payment_status": "paid",
        }

    order.payment_status = "paid"
    order.payment_method = "cash"
    notes = data.notes if data and data.notes else "Paid in cash at counter"

    txn_id = f"CASH-{order.order_number}-{uuid.uuid4().hex[:6]}"
    payment = Payment(
        order_id=order.id,
        method="cash",
        txn_id=txn_id,
        amount_paise=order.total_paise,
        status="completed",
        paid_at=datetime.datetime.utcnow(),
        notes=f"{notes} (Collected by {current_user.name})",
    )
    db.add(payment)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="cash_payment_collected",
        entity_type="payment",
        entity_id=order.id,
        details={
            "order_number": order.order_number,
            "amount_paise": order.total_paise,
            "amount_formatted": f"₹{order.total_paise / 100:.2f}",
            "method": "cash",
            "collected_by": current_user.name,
        },
    )

    db.commit()
    db.refresh(order)

    # Broadcast updated payment state to customer screen & admin board
    from app.routers.orders import format_order_response
    formatted = format_order_response(order)
    await manager.broadcast_to_order(
        order_id=order.id,
        event_type="order_status_updated",
        data=formatted.model_dump(mode="json"),
        outlet_id=order.outlet_id,
    )

    return {
        "success": True,
        "message": f"Order #{order.order_number} marked as paid in cash",
        "order_number": order.order_number,
        "amount_paise": order.total_paise,
        "amount_formatted": f"₹{order.total_paise / 100:.2f}",
        "payment_status": "paid",
        "collected_by": current_user.name,
    }


# ==========================================
# PAYMENTS LIST & FILTER (ADMIN)
# ==========================================

@router.get("", response_model=List[PaymentOut])
def list_payments(
    outlet_id: Optional[int] = Query(None, description="Filter by outlet ID"),
    method: Optional[str] = Query(None, description="Filter by method: cash, upi, card"),
    status: Optional[str] = Query(None, description="Filter by status: completed, pending, refunded"),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """List all payment records for accounting and reconciliation."""
    from app.routers.outlets import get_effective_outlet_id
    if current_user.role == "owner" and outlet_id is not None:
        target_outlet_id = get_effective_outlet_id(outlet_id, db)
    else:
        target_outlet_id = get_effective_outlet_id(current_user.outlet_id, db)

    query = (
        db.query(Payment)
        .join(Order, Payment.order_id == Order.id)
        .filter(Order.outlet_id == target_outlet_id)
    )

    if method:
        query = query.filter(Payment.method == method.strip().lower())
    if status:
        query = query.filter(Payment.status == status.strip().lower())

    return query.order_by(Payment.paid_at.desc()).limit(limit).all()
