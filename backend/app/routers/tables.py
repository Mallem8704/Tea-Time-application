import io
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
import qrcode

from app.database import get_db
from app.models import CafeTable, ServiceCall, User
from app.schemas import (
    TableCreate,
    TableUpdate,
    TableStatusUpdate,
    TableOut,
    ServiceCallCreate,
    ServiceCallOut,
)
from app.routers.auth import get_current_user, require_owner, require_staff_or_owner
from app.audit_utils import log_audit

router = APIRouter(prefix="", tags=["Tables & QR"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ==========================================
# TABLE CRUD
# ==========================================

@router.get("", response_model=List[TableOut])
def list_tables(
    outlet_id: int = Query(1, description="Outlet ID"),
    db: Session = Depends(get_db),
):
    """List all cafe tables with status and QR link."""
    return (
        db.query(CafeTable)
        .filter(CafeTable.outlet_id == outlet_id)
        .order_by(CafeTable.id.asc())
        .all()
    )


@router.get("/{table_id}", response_model=TableOut)
def get_table(table_id: int, db: Session = Depends(get_db)):
    """Fetch single table by ID."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )
    return table


@router.post("", response_model=TableOut, status_code=status.HTTP_201_CREATED)
def create_table(
    data: TableCreate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Create a new cafe table and generate its QR target URL."""
    label_clean = data.label.strip()

    # Check for duplicate label in same outlet
    existing = (
        db.query(CafeTable)
        .filter(CafeTable.outlet_id == current_user.outlet_id, CafeTable.label == label_clean)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table '{label_clean}' already exists in this outlet",
        )

    qr_url = f"{FRONTEND_URL}/order?table={label_clean}"
    new_table = CafeTable(
        outlet_id=current_user.outlet_id,
        label=label_clean,
        qr_code_url=qr_url,
        status="free",
    )
    db.add(new_table)
    db.flush()

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="create_table",
        entity_type="table",
        entity_id=new_table.id,
        details={"label": new_table.label, "qr_url": qr_url},
    )
    db.commit()
    db.refresh(new_table)
    return new_table


@router.put("/{table_id}", response_model=TableOut)
def update_table(
    table_id: int,
    data: TableUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Update table label or QR configuration."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )

    if data.label is not None:
        table.label = data.label.strip()
        table.qr_code_url = f"{FRONTEND_URL}/order?table={table.label}"
    if data.status is not None:
        table.status = data.status
    if data.qr_code_url is not None:
        table.qr_code_url = data.qr_code_url

    db.commit()
    db.refresh(table)
    return table


@router.patch("/{table_id}/status", response_model=TableOut)
def update_table_status(
    table_id: int,
    data: TableStatusUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Toggle table occupancy status (free, occupied, reserved)."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )

    old_status = table.status
    table.status = data.status

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="table_status_change",
        entity_type="table",
        entity_id=table.id,
        details={"label": table.label, "old_status": old_status, "new_status": data.status},
    )
    db.commit()
    db.refresh(table)
    return table


@router.delete("/{table_id}", status_code=status.HTTP_200_OK)
def delete_table(
    table_id: int,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """Delete a table (Owner only)."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )

    label = table.label
    db.delete(table)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="delete_table",
        entity_type="table",
        entity_id=table_id,
        details={"label": label},
    )
    db.commit()
    return {"message": f"Table '{label}' successfully deleted"}


# ==========================================
# QR CODE GENERATION ENDPOINT
# ==========================================

@router.get("/{table_id}/qr")
def generate_table_qr(table_id: int, db: Session = Depends(get_db)):
    """Generate high-resolution PNG QR Code for table encoding /order?table=<label>."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )

    target_url = table.qr_code_url or f"{FRONTEND_URL}/order?table={table.label}"

    # Generate QR Code image with cafe brand colors
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#1a0f0a", back_color="#fdfaf6")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={
            "Content-Disposition": f'inline; filename="qr_table_{table.label}.png"',
            "X-Target-Url": target_url,
        },
    )


from app.routers.ws import manager


# ==========================================
# CUSTOMER SERVICE CALLS (WAITER, WATER, BILL)
# ==========================================

@router.post("/{table_id}/call", response_model=ServiceCallOut, status_code=status.HTTP_201_CREATED)
async def request_table_service(
    table_id: int,
    data: ServiceCallCreate,
    db: Session = Depends(get_db),
):
    """Customer 1-tap call for assistance (water, bill, waiter, clean). Broadcasts to admin."""
    table = db.query(CafeTable).filter(CafeTable.id == table_id).first()
    if not table:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Table with ID {table_id} not found",
        )

    service_call = ServiceCall(
        outlet_id=table.outlet_id,
        table_id=table.id,
        call_type=data.call_type,
        status="pending",
    )
    db.add(service_call)
    db.commit()
    db.refresh(service_call)

    # Broadcast live alert to admin dashboards
    await manager.broadcast_service_call(
        outlet_id=table.outlet_id,
        data={
            "id": service_call.id,
            "table_id": table.id,
            "table_label": table.label,
            "call_type": service_call.call_type,
            "status": service_call.status,
            "created_at": service_call.created_at.isoformat(),
        },
    )

    return service_call


@router.get("/service-calls/active", response_model=List[ServiceCallOut])
def get_active_service_calls(
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Fetch pending service calls for staff notification bar."""
    return (
        db.query(ServiceCall)
        .filter(ServiceCall.outlet_id == outlet_id, ServiceCall.status == "pending")
        .order_by(ServiceCall.created_at.desc())
        .all()
    )


@router.patch("/service-calls/{call_id}/attend", response_model=ServiceCallOut)
def attend_service_call(
    call_id: int,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Mark a service call as attended by staff."""
    call = db.query(ServiceCall).filter(ServiceCall.id == call_id).first()
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service call with ID {call_id} not found",
        )

    call.status = "attended"
    db.commit()
    db.refresh(call)
    return call
