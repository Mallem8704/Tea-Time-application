"""Dual-branch seed script for Arabieq Restaurant.
Creates 2 separate outlets with their own users, tables, categories and menu items.
Branch 1 (Old Arabieq): no Tiffin/Breakfast/Dosa, opens 12PM
Branch 2 (New Arabieq & Cafe): full 11 categories, opens 7AM
"""

import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from app.database import Base, engine, SessionLocal
from app.models import (
    Outlet, User, CafeTable, Category, MenuItem, MenuItemVariant, MenuItemAddon,
    StockLog, AuditLog, Order, OrderItem, Payment, ServiceCall
)
from app.auth_utils import get_password_hash
from app.arabieq_data import CATEGORIES, ITEMS

# Category IDs to EXCLUDE for Branch 1 (no Tiffin & Breakfast, no Dosa Specials)
BRANCH1_EXCLUDE_CATS = {1, 2}


def seed_database(clear_existing: bool = True):
    print("=" * 70)
    print("[SEED] SEEDING ARABIEQ RESTAURANT - DUAL BRANCH")
    print("=" * 70)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if clear_existing:
            print("[INFO] Clearing all existing data...")
            db.query(AuditLog).delete()
            db.query(ServiceCall).delete()
            db.query(Payment).delete()
            db.query(OrderItem).delete()
            db.query(Order).delete()
            db.query(StockLog).delete()
            db.query(MenuItemVariant).delete()
            db.query(MenuItemAddon).delete()
            db.query(MenuItem).delete()
            db.query(Category).delete()
            db.query(CafeTable).delete()
            db.query(User).delete()
            db.query(Outlet).delete()
            db.commit()

        # OUTLET 1: Old Arabieq Restaurant
        outlet1 = Outlet(
            name="Old Arabieq Restaurant",
            address="2nd Floor, Near More Super Market, Rahmath Tower, Madanapalli Road, Kadiri",
            phone="+91 99591 59515",
            currency="INR",
            tax_rate_percent=5,
            opening_hours="12:00 PM - 11:30 PM (Daily)",
            tagline="Authentic Mandi, Biryani and Arabian Grills",
            logo_url="/logo.png",
            gstin="37AAAAA0000A1Z5",
            fssai_license_number="10123999000123",
            upi_vpa="arabicrestaurant@upi",
        )
        db.add(outlet1)
        db.flush()
        print(f"[OK] Outlet 1 created: {outlet1.name} (ID: {outlet1.id})")

        # OUTLET 2: New Arabieq Restaurant and Cafe
        outlet2 = Outlet(
            name="New Arabieq Restaurant and Cafe",
            address="Opposite to Girls High School, Kadiri, Andhra Pradesh",
            phone="+91 95150 51545",
            currency="INR",
            tax_rate_percent=5,
            opening_hours="7:00 AM - 11:30 PM (Daily)",
            tagline="Full Menu, Breakfast, Cafe and Fine Dining",
            logo_url="/logo.png",
            gstin="37BBBBB0000B1Z5",
            fssai_license_number="10123999000124",
            upi_vpa="arabicrestaurant2@upi",
        )
        db.add(outlet2)
        db.flush()
        print(f"[OK] Outlet 2 created: {outlet2.name} (ID: {outlet2.id})")

        # USERS for Branch 1
        db.add_all([
            User(outlet_id=outlet1.id, name="Branch Manager", email="owner@arabieq.com",
                 password_hash=get_password_hash("admin123"), role="owner"),
            User(outlet_id=outlet1.id, name="Floor Staff", email="staff1@arabieq.com",
                 password_hash=get_password_hash("staff123"), role="staff"),
        ])

        # USERS for Branch 2
        db.add_all([
            User(outlet_id=outlet2.id, name="Branch Manager", email="owner2@arabieq.com",
                 password_hash=get_password_hash("admin123"), role="owner"),
            User(outlet_id=outlet2.id, name="Floor Staff", email="staff2@arabieq.com",
                 password_hash=get_password_hash("staff123"), role="staff"),
        ])
        db.flush()

        # TABLES for Branch 1 (T1-T10)
        for i in range(1, 11):
            lbl = f"T{i}"
            db.add(CafeTable(
                outlet_id=outlet1.id, label=lbl,
                qr_code_url=f"https://arabic-restaurant-dineos.vercel.app/order?branch=BRANCH1_ID&table={lbl}",
                status="free",
            ))
        db.flush()
        # Fix QR URLs with actual outlet1 id
        from app.models import CafeTable as CT
        for t in db.query(CT).filter(CT.outlet_id == outlet1.id).all():
            t.qr_code_url = f"https://arabic-restaurant-dineos.vercel.app/order?branch={outlet1.id}&table={t.label}"
        db.flush()
        print(f"[OK] Branch 1 Tables: T1-T10 with QR branch={outlet1.id}")

        # TABLES for Branch 2 (T1-T10)
        for i in range(1, 11):
            lbl = f"T{i}"
            db.add(CafeTable(
                outlet_id=outlet2.id, label=lbl,
                qr_code_url=f"https://arabic-restaurant-dineos.vercel.app/order?branch={outlet2.id}&table={lbl}",
                status="free",
            ))
        db.flush()
        print(f"[OK] Branch 2 Tables: T1-T10 with QR branch={outlet2.id}")

        # CATEGORIES and ITEMS for Branch 1 (no breakfast/tiffin/dosa)
        cat_map1 = {}
        branch1_cats = [c for c in CATEGORIES if c["id"] not in BRANCH1_EXCLUDE_CATS]
        for c in branch1_cats:
            cat = Category(outlet_id=outlet1.id, name=c["name"], name_te=c.get("name_te"),
                           sort_order=c["sort_order"], is_active=c.get("is_active", True))
            db.add(cat)
            db.flush()
            cat_map1[c["id"]] = cat.id
        print(f"[OK] Branch 1 Categories: {len(cat_map1)} (no breakfast/tiffin)")

        b1_items = 0
        for it in ITEMS:
            if it["cat"] not in cat_map1:
                continue
            cat_id = it["cat"]
            base_paise = int(it["price"] * 100)
            has_var = cat_id in (8, 10, 11)  # Biryani, Mandi, Beverages

            m_item = MenuItem(
                outlet_id=outlet1.id, category_id=cat_map1[cat_id],
                name=it["name"], name_te=it.get("name_te"), description=it.get("desc"),
                price_paise=base_paise, image_url=it.get("img"),
                is_available=True, is_veg=it.get("veg", False),
                has_variants=has_var,
                is_special=it.get("price", 0) >= 300 or "Special" in it["name"] or cat_id == 10,
                stock_qty=100, track_stock=False,
            )
            db.add(m_item)
            db.flush()

            # Seed Variants
            if cat_id == 10:  # Mandi
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Single (1 Pax)", name_te="సింగిల్ (1)", price_paise=int(base_paise * 0.65), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Half (1-2 Pax)", name_te="హాఫ్ (1-2)", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Full (3-4 Pax)", name_te="ఫుల్ (3-4)", price_paise=int(base_paise * 1.85), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Jumbo / Family (5-6 Pax)", name_te="జంబో / ఫ్యామిలీ (5-6)", price_paise=int(base_paise * 3.4), is_default=False),
                ])
            elif cat_id == 8:  # Biryani
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Single", name_te="సింగిల్", price_paise=int(base_paise * 0.65), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Full / Regular", name_te="ఫుల్", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Family Pack (3-4 Pax)", name_te="ఫ్యామిలీ ప్యాక్", price_paise=int(base_paise * 2.2), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Jumbo Pack (5-6 Pax)", name_te="జంబో ప్యాక్", price_paise=int(base_paise * 3.4), is_default=False),
                ])
            elif cat_id == 11:  # Beverages & Shakes
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Regular (250ml)", name_te="రెగ్యులర్", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Large (400ml)", name_te="లార్జ్", price_paise=int(base_paise * 1.5), is_default=False),
                ])

            # Seed Add-ons
            if cat_id in (8, 10):  # Biryani & Mandi Addons
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Extra Arabian Mayonnaise (50ml)", name_te="ఎక్స్ట్రా మయోన్నైస్", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Extra Spicy Garlic Raita (100ml)", name_te="ఎక్స్ట్రా రైతా", price_paise=2000),
                    MenuItemAddon(item_id=m_item.id, name="Boiled Egg (1 pc)", name_te="ఉడికించిన గుడ్డు", price_paise=1500),
                    MenuItemAddon(item_id=m_item.id, name="Extra Mandi / Salan Gravy", name_te="ఎక్స్ట్రా గ్రేవీ", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Fried Onions & Cashews", name_te="ఫ్రైడ్ ఆనియన్స్ & జీడిపప్పు", price_paise=3500),
                ])
            elif cat_id in (5, 6):  # Starters
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Extra Rumali Roti (1 Pc)", name_te="రుమాలీ రోటీ (1)", price_paise=2000),
                    MenuItemAddon(item_id=m_item.id, name="Garlic Mayo Dip", name_te="గార్లిక్ మయో డిప్", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Mint Chutney", name_te="పుదీనా చట్నీ", price_paise=1500),
                ])
            elif cat_id == 11:  # Drinks & Shakes
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Vanilla Ice Cream Scoop", name_te="ఐస్ క్రీమ్ స్కూప్", price_paise=3000),
                    MenuItemAddon(item_id=m_item.id, name="Roasted Badam & Cashew Mix", name_te="బాదం & జీడిపప్పు", price_paise=2500),
                ])

            b1_items += 1
        db.flush()
        print(f"[OK] Branch 1 Items: {b1_items} (with portion variants & addons)")

        # CATEGORIES and ITEMS for Branch 2 (all 11 categories)
        cat_map2 = {}
        for c in CATEGORIES:
            cat = Category(outlet_id=outlet2.id, name=c["name"], name_te=c.get("name_te"),
                           sort_order=c["sort_order"], is_active=c.get("is_active", True))
            db.add(cat)
            db.flush()
            cat_map2[c["id"]] = cat.id
        print(f"[OK] Branch 2 Categories: {len(cat_map2)} (full menu)")

        b2_items = 0
        for it in ITEMS:
            cat_id = it["cat"]
            base_paise = int(it["price"] * 100)
            has_var = cat_id in (8, 10, 11)

            m_item = MenuItem(
                outlet_id=outlet2.id, category_id=cat_map2[cat_id],
                name=it["name"], name_te=it.get("name_te"), description=it.get("desc"),
                price_paise=base_paise, image_url=it.get("img"),
                is_available=True, is_veg=it.get("veg", False),
                has_variants=has_var,
                is_special=it.get("price", 0) >= 300 or "Special" in it["name"] or cat_id == 10,
                stock_qty=100, track_stock=False,
            )
            db.add(m_item)
            db.flush()

            # Seed Variants
            if cat_id == 10:  # Mandi
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Single (1 Pax)", name_te="సింగిల్ (1)", price_paise=int(base_paise * 0.65), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Half (1-2 Pax)", name_te="హాఫ్ (1-2)", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Full (3-4 Pax)", name_te="ఫుల్ (3-4)", price_paise=int(base_paise * 1.85), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Jumbo / Family (5-6 Pax)", name_te="జంబో / ఫ్యామిలీ (5-6)", price_paise=int(base_paise * 3.4), is_default=False),
                ])
            elif cat_id == 8:  # Biryani
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Single", name_te="సింగిల్", price_paise=int(base_paise * 0.65), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Full / Regular", name_te="ఫుల్", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Family Pack (3-4 Pax)", name_te="ఫ్యామిలీ ప్యాక్", price_paise=int(base_paise * 2.2), is_default=False),
                    MenuItemVariant(item_id=m_item.id, name="Jumbo Pack (5-6 Pax)", name_te="జంబో ప్యాక్", price_paise=int(base_paise * 3.4), is_default=False),
                ])
            elif cat_id == 11:  # Beverages & Shakes
                db.add_all([
                    MenuItemVariant(item_id=m_item.id, name="Regular (250ml)", name_te="రెగ్యులర్", price_paise=base_paise, is_default=True),
                    MenuItemVariant(item_id=m_item.id, name="Large (400ml)", name_te="లార్జ్", price_paise=int(base_paise * 1.5), is_default=False),
                ])

            # Seed Add-ons
            if cat_id in (8, 10):  # Biryani & Mandi Addons
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Extra Arabian Mayonnaise (50ml)", name_te="ఎక్స్ట్రా మయోన్నైస్", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Extra Spicy Garlic Raita (100ml)", name_te="ఎక్స్ట్రా రైతా", price_paise=2000),
                    MenuItemAddon(item_id=m_item.id, name="Boiled Egg (1 pc)", name_te="ఉడికించిన గుడ్డు", price_paise=1500),
                    MenuItemAddon(item_id=m_item.id, name="Extra Mandi / Salan Gravy", name_te="ఎక్స్ట్రా గ్రేవీ", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Fried Onions & Cashews", name_te="ఫ్రైడ్ ఆనియన్స్ & జీడిపప్పు", price_paise=3500),
                ])
            elif cat_id in (5, 6):  # Starters
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Extra Rumali Roti (1 Pc)", name_te="రుమాలీ రోటీ (1)", price_paise=2000),
                    MenuItemAddon(item_id=m_item.id, name="Garlic Mayo Dip", name_te="గార్లిక్ మయో డిప్", price_paise=2500),
                    MenuItemAddon(item_id=m_item.id, name="Mint Chutney", name_te="పుదీనా చట్నీ", price_paise=1500),
                ])
            elif cat_id == 11:  # Drinks & Shakes
                db.add_all([
                    MenuItemAddon(item_id=m_item.id, name="Vanilla Ice Cream Scoop", name_te="ఐస్ క్రీమ్ స్కూప్", price_paise=3000),
                    MenuItemAddon(item_id=m_item.id, name="Roasted Badam & Cashew Mix", name_te="బాదం & జీడిపప్పు", price_paise=2500),
                ])

            b2_items += 1
        db.flush()
        print(f"[OK] Branch 2 Items: {b2_items} (with portion variants & addons)")

        db.commit()
        print("\n" + "=" * 70)
        print("[SUCCESS] DUAL-BRANCH SEEDING COMPLETE!")
        print(f"  Branch 1 ID: {outlet1.id} | Branch 2 ID: {outlet2.id}")
        print("=" * 70)
        return outlet1.id, outlet2.id

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        import traceback; traceback.print_exc()
        raise e
    finally:
        db.close()


def auto_seed_if_empty():
    db = SessionLocal()
    try:
        outlet_count = db.query(Outlet).count()
        categories_count = db.query(Category).count()
        if outlet_count < 2 or categories_count < 10:
            print("[AUTO-SEED] Setting up dual-branch Arabieq Restaurant...")
            seed_database(clear_existing=True)
        else:
            print(f"[AUTO-SEED] DB active: {outlet_count} outlets, {categories_count} categories.")
    except Exception as e:
        print(f"[AUTO-SEED] Warning: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(clear_existing=True)
