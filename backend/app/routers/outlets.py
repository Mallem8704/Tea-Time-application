from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models import Outlet, AuditLog, User
from app.schemas import OutletOut, OutletUpdate
from app.routers.auth import get_current_user, require_owner

router = APIRouter()

@router.get("/", response_model=OutletOut)
def get_outlet(outlet_id: int = 1, db: Session = Depends(get_db)):
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    if not outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    return outlet

@router.put("/", response_model=OutletOut)
def update_outlet_settings(
    update_data: OutletUpdate,
    outlet_id: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_owner)
):
    outlet = db.query(Outlet).filter(Outlet.id == outlet_id).first()
    if not outlet:
        raise HTTPException(status_code=404, detail="Outlet not found")
    
    # Check that owner is updating their own outlet
    if current_user.outlet_id != outlet_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this outlet")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(outlet, key, value)
    
    # Create audit log
    audit_log = AuditLog(
        outlet_id=outlet.id,
        user_id=current_user.id,
        action="update_settings",
        entity_type="outlet",
        entity_id=outlet.id,
        details_json=json.dumps(update_dict)
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(outlet)
    return outlet
