from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogOut
from app.routers.auth import require_staff_or_owner

router = APIRouter(prefix="", tags=["Audit Logs"])


@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    outlet_id: int = Query(1, description="Outlet ID"),
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """List audit log ledger entries for staff and owner mutations."""
    query = db.query(AuditLog).filter(AuditLog.outlet_id == outlet_id)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
