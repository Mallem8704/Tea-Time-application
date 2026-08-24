import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import MenuItem, Category, StockLog, OrderItem, User, Outlet
from app.schemas import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemAvailabilityUpdate,
    MenuItemPriceUpdate,
    MenuItemStockUpdate,
    MenuItemOut,
)
from app.routers.auth import get_current_user, require_owner, require_staff_or_owner
from app.audit_utils import log_audit
from app.routers.ws import manager

router = APIRouter(prefix="", tags=["Menu Items"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ==========================================
# PUBLIC / CUSTOMER / STAFF MENU LISTING
# ==========================================

@router.get("", response_model=List[MenuItemOut])
def list_menu_items(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    is_veg: Optional[bool] = Query(None, description="Filter by vegetarian status"),
    search: Optional[str] = Query(None, description="Search by item name or description"),
    outlet_id: Optional[int] = Query(None, description="Outlet ID"),
    db: Session = Depends(get_db),
):
    """Retrieve categorized menu items with stock and availability filters."""
    target_id = outlet_id
    if target_id is None or db.query(MenuItem).filter(MenuItem.outlet_id == target_id).count() == 0:
        first_item = db.query(MenuItem).first()
        if first_item:
            target_id = first_item.outlet_id
        else:
            first_outlet = db.query(Outlet).first()
            target_id = first_outlet.id if first_outlet else 1

    query = db.query(MenuItem).filter(MenuItem.outlet_id == target_id)

    if category_id is not None:
        query = query.filter(MenuItem.category_id == category_id)

    if is_available is not None:
        query = query.filter(MenuItem.is_available == is_available)

    if is_veg is not None:
        query = query.filter(MenuItem.is_veg == is_veg)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (MenuItem.name.ilike(search_pattern))
            | (MenuItem.name_te.ilike(search_pattern))
            | (MenuItem.description.ilike(search_pattern))
        )

    return query.order_by(MenuItem.category_id.asc(), MenuItem.id.asc()).all()


@router.get("/{item_id}", response_model=MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    """Fetch single menu item details by ID."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )
    return item


# ==========================================
# IMAGE UPLOAD
# ==========================================

@router.post("/upload-image")
def upload_menu_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_staff_or_owner),
):
    """Upload photo for menu item and store locally under /uploads."""
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    
    contents = file.file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 5MB limit",
        )
    file.file.seek(0)
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image (JPEG, PNG, WEBP)",
        )

    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image (JPEG, PNG, WEBP)",
        )

    unique_filename = f"menu_{uuid.uuid4().hex[:12]}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    image_url = f"/uploads/{unique_filename}"
    return {
        "url": image_url,
        "filename": unique_filename,
        "content_type": file.content_type,
    }


# ==========================================
# ITEM MUTATIONS & RBAC
# ==========================================

@router.post("", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(
    data: MenuItemCreate,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """Create a new menu item (Owner only)."""
    # Verify category exists
    cat = db.query(Category).filter(Category.id == data.category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with ID {data.category_id} does not exist",
        )

    new_item = MenuItem(
        outlet_id=current_user.outlet_id,
        category_id=data.category_id,
        name=data.name.strip(),
        name_te=data.name_te.strip() if data.name_te else None,
        description=data.description.strip() if data.description else None,
        description_te=data.description_te.strip() if data.description_te else None,
        price_paise=data.price_paise,
        image_url=data.image_url,
        is_veg=data.is_veg,
        is_available=data.is_available,
        track_stock=data.track_stock,
        stock_qty=data.stock_qty,
        low_stock_threshold=data.low_stock_threshold,
        is_special=data.is_special,
    )
    db.add(new_item)
    db.flush()

    # Record initial stock log if tracked
    if new_item.track_stock and new_item.stock_qty > 0:
        stock_log = StockLog(
            outlet_id=current_user.outlet_id,
            item_id=new_item.id,
            change_qty=new_item.stock_qty,
            reason="restock",
            staff_id=current_user.id,
            notes="Initial item creation stock",
        )
        db.add(stock_log)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="create_menu_item",
        entity_type="menu_item",
        entity_id=new_item.id,
        details={
            "name": new_item.name,
            "price_paise": new_item.price_paise,
            "price_formatted": f"₹{new_item.price_paise / 100:.2f}",
            "stock_qty": new_item.stock_qty,
        },
    )
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Update menu item. Price modification is restricted to Owner role."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.outlet_id == current_user.outlet_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    # Check if staff attempts to modify price
    if data.price_paise is not None and data.price_paise != item.price_paise:
        if current_user.role != "owner":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Price changes can only be performed by the Owner role",
            )

    changes = {}
    if data.name is not None:
        item.name = data.name.strip()
    if data.name_te is not None:
        item.name_te = data.name_te.strip() if data.name_te else None
    if data.description is not None:
        item.description = data.description.strip() if data.description else None
    if data.description_te is not None:
        item.description_te = data.description_te.strip() if data.description_te else None
    if data.category_id is not None:
        item.category_id = data.category_id
    if data.image_url is not None:
        item.image_url = data.image_url
    if data.is_veg is not None:
        item.is_veg = data.is_veg
    if data.is_available is not None:
        changes["availability_changed"] = f"{item.is_available} -> {data.is_available}"
        item.is_available = data.is_available
    if data.track_stock is not None:
        item.track_stock = data.track_stock
    if data.low_stock_threshold is not None:
        item.low_stock_threshold = data.low_stock_threshold
    if data.is_special is not None:
        item.is_special = data.is_special

    if data.price_paise is not None and data.price_paise != item.price_paise:
        changes["old_price_paise"] = item.price_paise
        changes["new_price_paise"] = data.price_paise
        changes["old_price_formatted"] = f"₹{item.price_paise / 100:.2f}"
        changes["new_price_formatted"] = f"₹{data.price_paise / 100:.2f}"
        item.price_paise = data.price_paise

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="update_menu_item",
        entity_type="menu_item",
        entity_id=item.id,
        details=changes or {"updated_fields": list(data.model_dump(exclude_unset=True).keys())},
    )
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}/availability", response_model=MenuItemOut)
async def toggle_availability(
    item_id: int,
    data: MenuItemAvailabilityUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Toggle menu item availability on the customer app (Staff or Owner)."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.outlet_id == current_user.outlet_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    old_status = item.is_available
    item.is_available = data.is_available

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="toggle_availability",
        entity_type="menu_item",
        entity_id=item.id,
        details={
            "item_name": item.name,
            "old_available": old_status,
            "new_available": data.is_available,
        },
    )
    db.commit()
    db.refresh(item)

    # Broadcast real-time availability change
    try:
        await manager.broadcast_to_admin(
            outlet_id=current_user.outlet_id,
            event_type="menu:availability_changed",
            data={
                "item_id": item.id,
                "name": item.name,
                "is_available": item.is_available,
            },
        )
    except Exception:
        pass

    return item


@router.patch("/{item_id}/price", response_model=MenuItemOut)
async def update_item_price(
    item_id: int,
    data: MenuItemPriceUpdate,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """Update item price in paise (Owner only). Writes audit log."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.outlet_id == current_user.outlet_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    old_price = item.price_paise
    item.price_paise = data.price_paise

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="price_change",
        entity_type="menu_item",
        entity_id=item.id,
        details={
            "item_name": item.name,
            "old_price_paise": old_price,
            "new_price_paise": data.price_paise,
            "old_price_formatted": f"₹{old_price / 100:.2f}",
            "new_price_formatted": f"₹{data.price_paise / 100:.2f}",
        },
    )
    db.commit()
    db.refresh(item)

    # Broadcast real-time price change
    try:
        await manager.broadcast_to_admin(
            outlet_id=current_user.outlet_id,
            event_type="menu:price_changed",
            data={
                "item_id": item.id,
                "name": item.name,
                "price_paise": item.price_paise,
                "price_formatted": f"₹{item.price_paise / 100:.2f}",
            },
        )
    except Exception:
        pass

    return item


@router.patch("/{item_id}/stock", response_model=MenuItemOut)
def adjust_stock(
    item_id: int,
    data: MenuItemStockUpdate,
    current_user: User = Depends(require_staff_or_owner),
    db: Session = Depends(get_db),
):
    """Adjust item stock with reason (restock, wastage, adjustment) and log transaction."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.outlet_id == current_user.outlet_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    old_stock = item.stock_qty
    new_stock = max(0, old_stock + data.change_qty)
    item.stock_qty = new_stock
    item.track_stock = True

    # Record stock transaction log
    stock_log = StockLog(
        outlet_id=current_user.outlet_id,
        item_id=item.id,
        change_qty=data.change_qty,
        reason=data.reason,
        staff_id=current_user.id,
        notes=data.notes,
    )
    db.add(stock_log)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="stock_adjustment",
        entity_type="menu_item",
        entity_id=item.id,
        details={
            "item_name": item.name,
            "change_qty": data.change_qty,
            "old_stock": old_stock,
            "new_stock": new_stock,
            "reason": data.reason,
            "notes": data.notes,
        },
    )
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
def delete_menu_item(
    item_id: int,
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """Delete a menu item (Owner only)."""
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.outlet_id == current_user.outlet_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {item_id} not found",
        )

    item_name = item.name
    
    # Nullify item reference in historical order items to preserve receipts
    db.query(OrderItem).filter(OrderItem.item_id == item_id).update({"item_id": None})
    
    # Delete associated stock logs
    db.query(StockLog).filter(StockLog.item_id == item_id).delete()
    
    db.delete(item)

    log_audit(
        db=db,
        outlet_id=current_user.outlet_id,
        user_id=current_user.id,
        action="delete_menu_item",
        entity_type="menu_item",
        entity_id=item_id,
        details={"name": item_name},
    )
    db.commit()
    return {"message": f"Menu item '{item_name}' successfully deleted"}
