import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict


# ==========================================
# AUTH SCHEMAS
# ==========================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str
    email: str
    outlet_id: int
    user: Optional[UserOut] = None


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
    outlet_id: Optional[int] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    name: str
    email: str
    role: str
    created_at: datetime.datetime


# ==========================================
# OUTLET & TABLE SCHEMAS
# ==========================================

class OutletOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    currency: str
    tax_rate_percent: int


class TableBase(BaseModel):
    label: str
    qr_code_url: Optional[str] = None
    status: str = "free"


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    label: Optional[str] = None
    status: Optional[str] = None
    qr_code_url: Optional[str] = None


class TableStatusUpdate(BaseModel):
    status: str  # 'free', 'occupied', 'reserved'


class TableOut(TableBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    active_order_id: Optional[int] = None
    created_at: datetime.datetime


# ==========================================
# CATEGORY SCHEMAS
# ==========================================

class CategoryBase(BaseModel):
    name: str
    name_te: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    name_te: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    created_at: datetime.datetime


# ==========================================
# MENU ITEM SCHEMAS
# ==========================================

class MenuItemBase(BaseModel):
    category_id: int
    name: str
    name_te: Optional[str] = None
    description: Optional[str] = None
    description_te: Optional[str] = None
    price_paise: int
    image_url: Optional[str] = None
    is_veg: bool = True
    is_available: bool = True
    track_stock: bool = False
    stock_qty: int = 100
    low_stock_threshold: int = 10
    is_special: bool = False


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    name_te: Optional[str] = None
    description: Optional[str] = None
    description_te: Optional[str] = None
    price_paise: Optional[int] = None
    image_url: Optional[str] = None
    is_veg: Optional[bool] = None
    is_available: Optional[bool] = None
    track_stock: Optional[bool] = None
    stock_qty: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    is_special: Optional[bool] = None


class MenuItemAvailabilityUpdate(BaseModel):
    is_available: bool


class MenuItemPriceUpdate(BaseModel):
    price_paise: int


class MenuItemStockUpdate(BaseModel):
    change_qty: int
    reason: str = "adjustment"  # 'restock', 'wastage', 'adjustment'
    notes: Optional[str] = None


class MenuItemOut(MenuItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    created_at: datetime.datetime
    category: Optional[CategoryOut] = None


# ==========================================
# ORDER SCHEMAS
# ==========================================

class OrderItemCreate(BaseModel):
    item_id: int
    qty: int = 1
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    item_id: Optional[int] = None
    item_name: str
    qty: int
    unit_price_paise: int
    total_price_paise: int
    notes: Optional[str] = None


class OrderCreate(BaseModel):
    table_id: int
    items: List[OrderItemCreate]
    customer_notes: Optional[str] = None
    payment_method: str = "counter"  # 'upi', 'card', 'cash', 'counter'


class OrderStatusUpdate(BaseModel):
    status: str  # 'placed', 'accepted', 'preparing', 'ready', 'served', 'cancelled'


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    table_id: int
    table_label: Optional[str] = None
    order_number: str
    status: str
    subtotal_paise: int
    tax_paise: int
    total_paise: int
    payment_status: str
    payment_method: str
    customer_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    items: List[OrderItemOut] = []


# ==========================================
# STOCK SCHEMAS
# ==========================================

class StockAdjustmentCreate(BaseModel):
    item_id: int
    change_qty: int  # positive for restock, negative for wastage/deduction
    reason: str = "restock"  # 'restock', 'wastage', 'adjustment'
    notes: Optional[str] = None


class StockLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    item_id: int
    item_name: Optional[str] = None
    change_qty: int
    reason: str
    staff_id: Optional[int] = None
    staff_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime


class StockItemOverview(BaseModel):
    id: int
    name: str
    name_te: Optional[str] = None
    category_name: Optional[str] = None
    price_paise: int
    stock_qty: int
    track_stock: bool
    low_stock_threshold: int
    is_available: bool
    status: str  # 'in_stock', 'low_stock', 'out_of_stock'


# ==========================================
# PAYMENT SCHEMAS
# ==========================================

class RazorpayOrderRequest(BaseModel):
    order_id: int


class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount_paise: int
    currency: str = "INR"
    key_id: str
    order_number: str


class RazorpayVerifyRequest(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class MarkCashPaidRequest(BaseModel):
    notes: Optional[str] = "Paid in cash at counter"


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    method: str
    txn_id: Optional[str] = None
    amount_paise: int
    status: str
    paid_at: datetime.datetime
    notes: Optional[str] = None
    created_at: datetime.datetime


# ==========================================
# SERVICE CALL SCHEMAS
# ==========================================

class ServiceCallCreate(BaseModel):
    table_id: Optional[int] = None
    call_type: str = "waiter"  # 'waiter', 'bill', 'water', 'clean'
    notes: Optional[str] = None


class ServiceCallOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    table_id: int
    table_label: Optional[str] = None
    call_type: str
    status: str
    created_at: datetime.datetime


# ==========================================
# AUDIT LOG SCHEMAS
# ==========================================

class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    outlet_id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details_json: Optional[str] = None
    created_at: datetime.datetime
