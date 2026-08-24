"""Seed script for Arabic Restaurant (New Arabieq) SaaS.
Populates outlet, admin/staff users, tables, 11 authentic restaurant categories,
and the complete Arabieq Restaurant Menu transcribed from the official menu PDF.
"""

import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from app.database import Base, engine, SessionLocal
from app.models import Outlet, User, CafeTable, Category, MenuItem, StockLog, AuditLog, Order, OrderItem, Payment, ServiceCall
from app.auth_utils import get_password_hash
from app.arabieq_data import CATEGORIES, ITEMS


def seed_database(clear_existing: bool = True):
    print("=" * 70)
    print("[SEED] SEEDING ARABIC RESTAURANT (ARABIEQ) DATABASE")
    print("=" * 70)

    # Recreate tables cleanly
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if clear_existing:
            print("[INFO] Clearing existing data to seed fresh authentic Arabieq menu...")
            db.query(AuditLog).delete()
            db.query(ServiceCall).delete()
            db.query(Payment).delete()
            db.query(OrderItem).delete()
            db.query(Order).delete()
            db.query(StockLog).delete()
            db.query(MenuItem).delete()
            db.query(Category).delete()
            db.query(CafeTable).delete()
            db.query(User).delete()
            db.query(Outlet).delete()
            db.commit()

        # 1. Seed Outlet
        outlet = Outlet(
            name="Arabic Restaurant",
            address="Main Bazaar Road, Kadiri, Andhra Pradesh - 515591",
            phone="+91 98765 43210",
            currency="INR",
            tax_rate_percent=5,
            opening_hours="11:00 AM – 11:30 PM (Daily)",
            tagline="Authentic Arabian Cuisine, Mandi & Grills",
            logo_url="/logo.png",
            gstin="37AAAAA0000A1Z5",
            fssai_license_number="10123999000123",
            upi_vpa="arabicrestaurant@upi",
        )
        db.add(outlet)
        db.flush()
        print(f"[OK] Created Outlet: {outlet.name} (ID: {outlet.id})")

        # 2. Seed Users (Owner & Staff)
        owner_password = "admin123"
        staff_password = "staff123"

        owner_user = User(
            outlet_id=outlet.id,
            name="Sreenivasulu",
            email="owner@teatime.com",
            password_hash=get_password_hash(owner_password),
            role="owner",
        )
        staff_user = User(
            outlet_id=outlet.id,
            name="Suresh Kumar",
            email="staff@teatime.com",
            password_hash=get_password_hash(staff_password),
            role="staff",
        )
        db.add_all([owner_user, staff_user])
        db.flush()

        print("\n" + "-" * 50)
        print("[CREDENTIALS] DEMO LOGIN CREDENTIALS:")
        print(f"  • OWNER:  Email: owner@teatime.com | Password: {owner_password}")
        print(f"  • STAFF:  Email: staff@teatime.com | Password: {staff_password}")
        print("-" * 50 + "\n")

        # 3. Seed Tables (T1 to T10)
        tables = []
        for i in range(1, 11):
            table_label = f"T{i}"
            qr_url = f"https://arabic-restaurant-dineos.vercel.app/order?table={table_label}"
            table = CafeTable(
                outlet_id=outlet.id,
                label=table_label,
                qr_code_url=qr_url,
                status="free",
            )
            tables.append(table)
        db.add_all(tables)
        db.flush()
        print(f"[OK] Created {len(tables)} Dining Tables (T1 to T10)")

        # 4. Seed Categories
        category_map = {}
        for c in CATEGORIES:
            cat = Category(
                outlet_id=outlet.id,
                name=c["name"],
                name_te=c.get("name_te"),
                sort_order=c["sort_order"],
                is_active=c.get("is_active", True),
            )
            db.add(cat)
            db.flush()
            category_map[c["id"]] = cat.id

        print(f"[OK] Seeded {len(category_map)} Categories")

        # 5. Seed Menu Items
        created_items = []
        for it in ITEMS:
            cat_id = category_map[it["cat"]]
            price_paise = int(it["price"] * 100)
            menu_item = MenuItem(
                outlet_id=outlet.id,
                category_id=cat_id,
                name=it["name"],
                name_te=it.get("name_te"),
                description=it.get("desc"),
                price_paise=price_paise,
                image_url=it.get("img"),
                is_available=True,
                is_veg=it.get("veg", False),
                is_special=it.get("price", 0) >= 300 or "Special" in it["name"] or "Mandi" in it["name"],
                stock_qty=100,
                track_stock=False,
            )
            db.add(menu_item)
            created_items.append(menu_item)

        db.flush()

        # Seed initial stock log records
        for item in created_items:
            stock_log = StockLog(
                outlet_id=outlet.id,
                item_id=item.id,
                change_qty=100,
                reason="restock",
                notes="Initial store opening inventory",
            )
            db.add(stock_log)

        print(f"[OK] Seeded {len(created_items)} Menu Items from Arabieq Menu PDF")

        db.commit()
        print("\n" + "=" * 70)
        print("[SUCCESS] ARABIC RESTAURANT DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()


def auto_seed_if_empty():
    """Checks if database has an outlet or needs migration to Arabieq menu."""
    db = SessionLocal()
    try:
        existing_outlet = db.query(Outlet).first()
        categories_count = db.query(Category).count()
        # If empty or old cafe menu with fewer than 8 categories, reseed cleanly
        if existing_outlet is None or categories_count < 8:
            print("[AUTO-SEED] Seeding / Upgrading to full Arabieq Restaurant Menu...")
            seed_database(clear_existing=True)
        else:
            print(f"[AUTO-SEED] Database active with {categories_count} categories.")
            # Ensure outlet name is synchronized to Arabic Restaurant
            if existing_outlet.name != "Arabic Restaurant":
                print(f"[STORE-SYNC] Updating outlet name to 'Arabic Restaurant'")
                existing_outlet.name = "Arabic Restaurant"
                existing_outlet.tagline = "Authentic Arabian Cuisine, Mandi & Grills"
                existing_outlet.opening_hours = "11:00 AM – 11:30 PM (Daily)"
                db.commit()
            # Ensure owner name is synchronized to Sreenivasulu
            owner = db.query(User).filter(User.role == "owner").first()
            if owner and owner.name != "Sreenivasulu":
                print(f"[AUTH-SYNC] Updating owner name to 'Sreenivasulu'")
                owner.name = "Sreenivasulu"
                db.commit()
    except Exception as e:
        print(f"[AUTO-SEED] Warning: Auto-seed encountered: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(clear_existing=True)
