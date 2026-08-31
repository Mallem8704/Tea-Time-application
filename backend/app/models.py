import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Outlet(Base):
    __tablename__ = "outlets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    currency = Column(String(10), default="INR")
    tax_rate_percent = Column(Integer, default=5)  # e.g., 5% GST
    opening_hours = Column(String(100), nullable=True)  # e.g., "6:00 AM – 11:00 PM"
    tagline = Column(String(255), nullable=True)  # e.g., "Authentic Irani Chai & Fresh Bakes"
    logo_url = Column(String(500), nullable=True)  # e.g., "/uploads/logo.png"
    gstin = Column(String(30), nullable=True)  # GST Identification Number
    fssai_license_number = Column(String(30), nullable=True)  # FSSAI License Number
    upi_vpa = Column(String(100), nullable=True)  # e.g. "teatime@upi"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="outlet")
    tables = relationship("CafeTable", back_populates="outlet")
    categories = relationship("Category", back_populates="outlet")
    menu_items = relationship("MenuItem", back_populates="outlet")
    orders = relationship("Order", back_populates="outlet")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="staff")  # 'owner' or 'staff'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    outlet = relationship("Outlet", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")


class CafeTable(Base):
    __tablename__ = "tables"
    __table_args__ = (
        UniqueConstraint("outlet_id", "label", name="uq_table_outlet_label"),
    )

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    label = Column(String(50), nullable=False)  # e.g. "T1", "T2"
    qr_code_url = Column(String(255), nullable=True)
    status = Column(String(20), default="free")  # 'free', 'occupied', 'reserved'
    active_order_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    outlet = relationship("Outlet", back_populates="tables")
    orders = relationship("Order", back_populates="table")
    service_calls = relationship("ServiceCall", back_populates="table", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("outlet_id", "name", name="uq_category_outlet_name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_te = Column(String(100), nullable=True)  # Telugu category name
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    outlet = relationship("Outlet", back_populates="categories")
    items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), index=True, nullable=False)
    name = Column(String(120), nullable=False)
    name_te = Column(String(120), nullable=True)  # Telugu name
    description = Column(Text, nullable=True)
    description_te = Column(Text, nullable=True)  # Telugu description
    price_paise = Column(Integer, nullable=False)  # e.g. 2000 for ₹20.00
    image_url = Column(String(255), nullable=True)
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    track_stock = Column(Boolean, default=False)
    stock_qty = Column(Integer, default=100)
    low_stock_threshold = Column(Integer, default=10)
    is_special = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    outlet = relationship("Outlet", back_populates="menu_items")
    category = relationship("Category", back_populates="items")
    stock_logs = relationship("StockLog", back_populates="item", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id", ondelete="SET NULL"), index=True, nullable=True)
    order_type = Column(String(20), default="dine_in", index=True)  # 'dine_in', 'delivery', 'takeaway'
    customer_name = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_status = Column(String(30), default="pending")  # 'pending', 'out_for_delivery', 'delivered'
    delivery_fee_paise = Column(Integer, default=0)  # Free delivery = 0
    order_number = Column(String(30), unique=True, index=True, nullable=False)
    status = Column(String(30), default="placed", index=True)  # 'placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'served', 'cancelled'
    subtotal_paise = Column(Integer, default=0)
    tax_paise = Column(Integer, default=0)
    total_paise = Column(Integer, default=0)
    payment_status = Column(String(20), default="pending")  # 'pending', 'paid', 'failed'
    payment_method = Column(String(20), default="counter")  # 'upi', 'card', 'cash', 'counter', 'cod'
    customer_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    outlet = relationship("Outlet", back_populates="orders")
    table = relationship("CafeTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="SET NULL"), index=True, nullable=True)
    item_name = Column(String(120), nullable=False)
    qty = Column(Integer, default=1)
    unit_price_paise = Column(Integer, nullable=False)
    total_price_paise = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)

    order = relationship("Order", back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True, nullable=False)
    method = Column(String(30), default="counter")  # 'upi', 'card', 'cash'
    txn_id = Column(String(100), nullable=True)
    amount_paise = Column(Integer, nullable=False)
    status = Column(String(20), default="completed")  # 'pending', 'completed', 'failed', 'refunded'
    paid_at = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="payments")


class StockLog(Base):
    __tablename__ = "stock_logs"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), index=True, nullable=False)
    change_qty = Column(Integer, nullable=False)  # positive for restock, negative for sale/waste
    reason = Column(String(50), nullable=False)  # 'sale', 'restock', 'wastage', 'adjustment'
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    item = relationship("MenuItem", back_populates="stock_logs")


class ServiceCall(Base):
    __tablename__ = "service_calls"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), index=True, nullable=False)
    call_type = Column(String(50), default="waiter")  # 'waiter', 'bill', 'water', 'clean'
    status = Column(String(20), default="pending", index=True)  # 'pending', 'attended'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    table = relationship("CafeTable", back_populates="service_calls")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    outlet_id = Column(Integer, ForeignKey("outlets.id"), index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., 'price_change', 'stock_adjustment', 'cancel_order'
    entity_type = Column(String(50), nullable=False)  # e.g., 'menu_item', 'order', 'table'
    entity_id = Column(Integer, nullable=True)
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
