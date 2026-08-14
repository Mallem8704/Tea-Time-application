"""Seed script for Tea Time Cafe SaaS.
Populates outlet, admin/staff users, tables, categories, menu items with English & Telugu names, and starting stock.
"""

import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from app.database import Base, engine, SessionLocal
from app.models import Outlet, User, CafeTable, Category, MenuItem, StockLog
from app.auth_utils import get_password_hash


def seed_database():
    print("=" * 65)
    print("☕ SEEDING TEA TIME CAFE DATABASE")
    print("=" * 65)

    # Recreate tables cleanly
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_outlet = db.query(Outlet).first()
        if existing_outlet:
            print("[INFO] Database already contains data. Clearing and re-seeding...")
            db.query(StockLog).delete()
            db.query(MenuItem).delete()
            db.query(Category).delete()
            db.query(CafeTable).delete()
            db.query(User).delete()
            db.query(Outlet).delete()
            db.commit()

        # 1. Seed Outlet
        outlet = Outlet(
            name="Tea Time Cafe",
            address="Main Bazaar Road, Kadiri, Andhra Pradesh - 515591",
            phone="+91 98765 43210",
            currency="INR",
            tax_rate_percent=5,  # 5% GST
        )
        db.add(outlet)
        db.flush()
        print(f"✓ Created Outlet: {outlet.name} (ID: {outlet.id}, Location: Kadiri)")

        # 2. Seed Users (Owner & Staff)
        owner_password = "admin123"
        staff_password = "staff123"

        owner_user = User(
            outlet_id=outlet.id,
            name="Ramesh Reddy (Owner)",
            email="owner@teatime.com",
            password_hash=get_password_hash(owner_password),
            role="owner",
        )
        staff_user = User(
            outlet_id=outlet.id,
            name="Suresh Kumar (Counter Staff)",
            email="staff@teatime.com",
            password_hash=get_password_hash(staff_password),
            role="staff",
        )
        db.add_all([owner_user, staff_user])
        db.flush()

        print("\n" + "-" * 50)
        print("🔑 DEMO LOGIN CREDENTIALS:")
        print(f"  • OWNER:  Email: owner@teatime.com | Password: {owner_password}")
        print(f"  • STAFF:  Email: staff@teatime.com | Password: {staff_password}")
        print("-" * 50 + "\n")

        # 3. Seed Tables (T1 to T8)
        tables = []
        for i in range(1, 9):
            table_label = f"T{i}"
            qr_url = f"http://localhost:3000/order?table={table_label}"
            table = CafeTable(
                outlet_id=outlet.id,
                label=table_label,
                qr_code_url=qr_url,
                status="free",
            )
            tables.append(table)
        db.add_all(tables)
        db.flush()
        print(f"✓ Created {len(tables)} Cafe Tables (T1 through T8) with QR URLs")

        # 4. Seed Categories
        categories_data = [
            {
                "name": "Chai & Hot Beverages",
                "name_te": "చాయ్ & వేడి పానీయాలు",
                "sort_order": 1,
            },
            {
                "name": "Bakery & Biscuits",
                "name_te": "స్నాక్స్ & బేకరీ",
                "sort_order": 2,
            },
            {
                "name": "Savory Snacks",
                "name_te": "హాట్ స్నాక్స్",
                "sort_order": 3,
            },
            {
                "name": "Coolers & Refreshers",
                "name_te": "కూలర్స్ & పానీయాలు",
                "sort_order": 4,
            },
        ]

        cat_map = {}
        for c_data in categories_data:
            cat = Category(
                outlet_id=outlet.id,
                name=c_data["name"],
                name_te=c_data["name_te"],
                sort_order=c_data["sort_order"],
                is_active=True,
            )
            db.add(cat)
            db.flush()
            cat_map[c_data["name"]] = cat.id
        print(f"✓ Created {len(categories_data)} Menu Categories with Telugu translations")

        # 5. Seed Menu Items (with authentic Irani Chai Cafe items)
        menu_items_data = [
            # Chai & Hot Beverages
            {
                "category": "Chai & Hot Beverages",
                "name": "Irani Chai",
                "name_te": "ఇరానీ చాయ్",
                "description": "Rich, creamy, slow-brewed classic Hyderabadi Irani dum tea with condensed milk.",
                "description_te": "మందపాటి పాలు మరియు దమ్ డికాక్షన్‌తో తయారు చేసిన రుచికరమైన ఇరానీ చాయ్.",
                "price_paise": 2000,  # ₹20
                "is_veg": True,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 200,
                "low_stock_threshold": 20,
            },
            {
                "category": "Chai & Hot Beverages",
                "name": "Ginger Tea (Allam Chai)",
                "name_te": "అల్లం టీ",
                "description": "Fresh crushed ginger infused strong milk tea with aromatic cardamom.",
                "description_te": "తాజా అల్లం రసం మరియు యాలకుల సువాసనతో కూడిన ఘాటైన టీ.",
                "price_paise": 2500,  # ₹25
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 150,
                "low_stock_threshold": 15,
            },
            {
                "category": "Chai & Hot Beverages",
                "name": "Special Dum Chai",
                "name_te": "స్పెషల్ దమ్ చాయ్",
                "description": "Authentic slow-simmered dum tea brewed in a sealed copper samovar.",
                "description_te": "సమోవార్‌లో నెమ్మదిగా ఉడికించిన అసలైన దమ్ టీ.",
                "price_paise": 2500,  # ₹25
                "is_veg": True,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 150,
                "low_stock_threshold": 15,
            },
            {
                "category": "Chai & Hot Beverages",
                "name": "South Indian Filter Coffee",
                "name_te": "ఫిల్టర్ కాఫీ",
                "description": "Freshly brewed chicory-blend decoction frothed with boiling hot milk.",
                "description_te": "తాజా డికాక్షన్ మరియు వేడి పాలతో చేసిన సాంప్రదాయ ఫిల్టర్ కాఫీ.",
                "price_paise": 3000,  # ₹30
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 120,
                "low_stock_threshold": 15,
            },
            # Bakery & Biscuits
            {
                "category": "Bakery & Biscuits",
                "name": "Osmania Biscuits (4 pcs)",
                "name_te": "ఉస్మానియా బిస్కెట్లు (4 నెం)",
                "description": "Melt-in-mouth sweet and salty royal biscuits, perfect pairing with Irani Chai.",
                "description_te": "ఇరానీ చాయ్‌కి సరిపోయే ప్రసిద్ధ తీపి-ఉప్పు ఉస్మానియా బిస్కెట్లు.",
                "price_paise": 3000,  # ₹30
                "is_veg": True,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 100,
                "low_stock_threshold": 10,
            },
            {
                "category": "Bakery & Biscuits",
                "name": "Bun Maska",
                "name_te": "బన్ మస్కా",
                "description": "Soft toasted sweet bun generously layered with fresh butter and tutti-frutti.",
                "description_te": "తాజా వెన్నతో నింపిన మృదువైన బన్.",
                "price_paise": 4000,  # ₹40
                "is_veg": True,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 60,
                "low_stock_threshold": 8,
            },
            # Savory Snacks
            {
                "category": "Savory Snacks",
                "name": "Hot Crispy Samosa (2 pcs)",
                "name_te": "వేడి సమోసా (2 నెం)",
                "description": "Crispy golden fried pastry stuffed with spiced potato and green peas.",
                "description_te": "మసాలా బంగాళాదుంప మిశ్రమంతో నిండిన కరకరలాడే వేడి సమోసాలు.",
                "price_paise": 3500,  # ₹35
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 80,
                "low_stock_threshold": 10,
            },
            {
                "category": "Savory Snacks",
                "name": "Paneer Tikka Puff",
                "name_te": "పన్నీర్ టిక్కా పఫ్",
                "description": "Flaky buttery puff pastry loaded with tandoori spiced cottage cheese.",
                "description_te": "రుచికరమైన తందూరి పన్నీర్ మసాలాతో నింపిన క్రంచీ పఫ్.",
                "price_paise": 4000,  # ₹40
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 50,
                "low_stock_threshold": 5,
            },
            {
                "category": "Savory Snacks",
                "name": "Chicken Tikka Puff",
                "name_te": "చికెన్ టిక్కా పఫ్",
                "description": "Golden baked puff pastry packed with juicy spicy shredded chicken tikka.",
                "description_te": "స్పైసీ చికెన్ టిక్కాతో నిండిన రుచికరమైన నాన్-వెజ్ పఫ్.",
                "price_paise": 5000,  # ₹50
                "is_veg": False,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 40,
                "low_stock_threshold": 5,
            },
            # Coolers & Refreshers
            {
                "category": "Coolers & Refreshers",
                "name": "Lemon Mint Cooler",
                "name_te": "లెమన్ మింట్ కూలర్",
                "description": "Refreshing crushed mint leaves, fresh lime juice, soda, and black salt.",
                "description_te": "పుదీనా, నిమ్మరసం మరియు సోడాతో చేసిన చల్లని రిఫ్రెషింగ్ పానీయం.",
                "price_paise": 4500,  # ₹45
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 70,
                "low_stock_threshold": 10,
            },
            {
                "category": "Coolers & Refreshers",
                "name": "Chilled Badam Milk",
                "name_te": "చల్లని బాదాం పాలు",
                "description": "Rich cold milk infused with almond paste, saffron strands, and cardamom.",
                "description_te": "బాదాం పప్పులు మరియు కుంకుమపువ్వుతో చేసిన తియ్యని చల్లని పాలు.",
                "price_paise": 5000,  # ₹50
                "is_veg": True,
                "is_special": True,
                "track_stock": True,
                "stock_qty": 50,
                "low_stock_threshold": 8,
            },
            {
                "category": "Coolers & Refreshers",
                "name": "Royal Rose Milk",
                "name_te": "రాయల్ రోజ్ మిల్క్",
                "description": "Classic fragrant rose syrup blended with creamy chilled milk and sabja seeds.",
                "description_te": "సబ్జా గింజలు మరియు రోజ్ సిరప్‌తో చేసిన రుచికరమైన రోజ్ మిల్క్.",
                "price_paise": 4500,  # ₹45
                "is_veg": True,
                "is_special": False,
                "track_stock": True,
                "stock_qty": 50,
                "low_stock_threshold": 8,
            },
        ]

        for item_data in menu_items_data:
            cat_id = cat_map[item_data["category"]]
            menu_item = MenuItem(
                outlet_id=outlet.id,
                category_id=cat_id,
                name=item_data["name"],
                name_te=item_data["name_te"],
                description=item_data["description"],
                description_te=item_data["description_te"],
                price_paise=item_data["price_paise"],
                is_veg=item_data["is_veg"],
                is_special=item_data["is_special"],
                track_stock=item_data["track_stock"],
                stock_qty=item_data["stock_qty"],
                low_stock_threshold=item_data["low_stock_threshold"],
                is_available=True,
            )
            db.add(menu_item)
            db.flush()

            # Record initial stock log
            stock_log = StockLog(
                outlet_id=outlet.id,
                item_id=menu_item.id,
                change_qty=menu_item.stock_qty,
                reason="restock",
                staff_id=owner_user.id,
                notes="Initial store opening inventory setup",
            )
            db.add(stock_log)

        db.commit()
        print(f"✓ Successfully seeded {len(menu_items_data)} Menu Items with stock & logs!")
        print("=" * 65)

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
