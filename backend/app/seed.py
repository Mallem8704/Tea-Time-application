"""Seed script for Tea Time Cafe SaaS.
Populates outlet, admin/staff users, tables, categories, and all 58 authentic menu items
across Teas, Milk Shakes, Snacks, Coolers, Flavoured Milks, and Premium Shakes with
English and Telugu names and descriptions.
"""

import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from app.database import Base, engine, SessionLocal
from app.models import Outlet, User, CafeTable, Category, MenuItem, StockLog, AuditLog, Order, OrderItem, Payment, ServiceCall
from app.auth_utils import get_password_hash


def seed_database(clear_existing: bool = True):
    print("=" * 70)
    print("[SEED] SEEDING TEA TIME CAFE DATABASE — FULL 58-ITEM BILINGUAL MENU")
    print("=" * 70)

    # Recreate tables cleanly
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if clear_existing:
            # Check if already seeded and clear cleanly
            print("[INFO] Clearing existing data to seed fresh authentic menu...")
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
            name="Tea Time Cafe",
            address="Main Bazaar Road, Kadiri, Andhra Pradesh - 515591",
            phone="+91 98765 43210",
            currency="INR",
            tax_rate_percent=5,
            opening_hours="6:00 AM – 11:00 PM (Daily)",
            tagline="Authentic Irani Chai & Fresh Bakes",
            logo_url="/logo.png",
            gstin="37AAAAA0000A1Z5",
            fssai_license_number="10123999000123",
            upi_vpa="teatimecafe@upi",
        )
        db.add(outlet)
        db.flush()
        print(f"[OK] Created Outlet: {outlet.name} (ID: {outlet.id}, Location: Kadiri)")

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
        print("[CREDENTIALS] DEMO LOGIN CREDENTIALS:")
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
        print(f"[OK] Created {len(tables)} Cafe Tables (T1 through T8) with QR URLs")

        # 4. Seed Categories (6 exact categories from menu prompt)
        categories_data = [
            {"name": "Teas", "name_te": "టీలు & వేడి పానీయాలు", "sort_order": 1},
            {"name": "Milk Shakes", "name_te": "మిల్క్ షేక్స్", "sort_order": 2},
            {"name": "Snacks", "name_te": "స్నాక్స్ & బేకరీ", "sort_order": 3},
            {"name": "Coolers", "name_te": "కూలర్స్ & రిఫ్రెషర్స్", "sort_order": 4},
            {"name": "Flavoured Milks", "name_te": "ఫ్లేవర్డ్ మిల్క్స్", "sort_order": 5},
            {"name": "Premium Shakes", "name_te": "ప్రీమియం షేక్స్", "sort_order": 6},
        ]

        category_map = {}
        for cat in categories_data:
            c = Category(
                outlet_id=outlet.id,
                name=cat["name"],
                name_te=cat["name_te"],
                sort_order=cat["sort_order"],
                is_active=True,
            )
            db.add(c)
            db.flush()
            category_map[cat["name"]] = c.id
        print(f"[OK] Created {len(category_map)} Categories")

        # 5. Full 58 Menu Items from Prompt
        menu_items_raw = [
            # ================= TEAS (20 items) =================
            {
                "cat": "Teas",
                "name": "Dum Tea",
                "name_te": "దమ్ టీ",
                "price": 1200,
                "desc": "Classic slow-brewed rich milk tea",
                "desc_te": "సాంప్రదాయ దమ్ చేసిన పాలు చాయ్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Teas",
                "name": "Ginger Tea",
                "name_te": "అల్లం టీ",
                "price": 1500,
                "desc": "Fresh crushed ginger infused strong tea",
                "desc_te": "తాజా అల్లం రసంతో చేసిన ఘాటైన చాయ్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Teas",
                "name": "Lemon Tea",
                "name_te": "లెమన్ టీ",
                "price": 1500,
                "desc": "Zesty lemon infused black tea",
                "desc_te": "తాజా నిమ్మరసంతో చేసిన బ్లాక్ టీ",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Masala Tea",
                "name_te": "మసాలా టీ",
                "price": 1500,
                "desc": "Aromatic tea brewed with cardamom, clove & cinnamon",
                "desc_te": "యాలకులు, దాల్చినచెక్క సువాసనతో మసాలా చాయ్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Teas",
                "name": "Bellam Tea",
                "name_te": "బెల్లం టీ",
                "price": 2000,
                "desc": "Organic jaggery sweetened healthy traditional tea",
                "desc_te": "స్వచ్ఛమైన బెల్లంతో చేసిన సాంప్రదాయ చాయ్",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Black Tea",
                "name_te": "బ్లాక్ టీ",
                "price": 1500,
                "desc": "Pure steeped Assam black tea leaves",
                "desc_te": "స్వచ్ఛమైన అస్సాం బ్లాక్ టీ",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Elachi Tea",
                "name_te": "యాలకుల టీ",
                "price": 2000,
                "desc": "Fragrant green cardamom infused milk tea",
                "desc_te": "సుగంధ యాలకుల పాలు చాయ్",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Boost / Horlick's",
                "name_te": "బూస్ట్ / హార్లిక్స్",
                "price": 2000,
                "desc": "Hot malty energy drink with full cream milk",
                "desc_te": "వేడి పాలతో రుచికరమైన బూస్ట్ / హార్లిక్స్",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Tea Flask (6 Tea's)",
                "name_te": "టీ ఫ్లాస్క్ (6 కప్పులు)",
                "price": 10000,
                "desc": "Insulated flask serving 6 hot cups of Dum Tea",
                "desc_te": "6 కప్పుల దమ్ టీ ఫ్లాస్క్",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Ginger Tea Flask (6 Nos.)",
                "name_te": "అల్లం టీ ఫ్లాస్క్ (6 కప్పులు)",
                "price": 12000,
                "desc": "Insulated flask serving 6 hot cups of Ginger Tea",
                "desc_te": "6 కప్పుల ఘాటైన అల్లం టీ ఫ్లాస్క్",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Kulad Tea",
                "name_te": "కుల్హాడ్ టీ (మట్టి కప్పు)",
                "price": 2000,
                "desc": "Traditional tea served in an earthen clay pot",
                "desc_te": "మట్టి పాత్రలో అందించే స్వచ్ఛమైన కుల్హాడ్ చాయ్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Teas",
                "name": "Kashmiri Chai",
                "name_te": "కాశ్మీరీ గులాబీ చాయ్",
                "price": 2000,
                "desc": "Authentic pink tea with saffron & crushed nuts",
                "desc_te": "కాశ్మీరీ గులాబీ చాయ్ డ్రైఫ్రూట్స్ తో",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Ginger Lemon Tea",
                "name_te": "అల్లం నిమ్మకాయ టీ",
                "price": 2000,
                "desc": "Immunity boosting fresh ginger & lemon brew",
                "desc_te": "అల్లం మరియు నిమ్మకాయల సహజ పానీయం",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Green Tea",
                "name_te": "గ్రీన్ టీ",
                "price": 2500,
                "desc": "Antioxidant rich whole green tea leaves",
                "desc_te": "ఆరోగ్యకరమైన స్వచ్ఛమైన గ్రీన్ టీ",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Badam (Tea/Milk)",
                "name_te": "బాదం టీ / పాలు",
                "price": 2000,
                "desc": "Rich almond infused milk beverage",
                "desc_te": "పోషకాలతో కూడిన బాదం పాలు",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Pepper Milk",
                "name_te": "మిరియాల పాలు",
                "price": 2000,
                "desc": "Warm spiced black pepper milk for wellness",
                "desc_te": "నల్ల మిరియాల ఘాటైన ఆరోగ్యకరమైన పాలు",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Coffee",
                "name_te": "ఫిల్టర్ కాఫీ",
                "price": 2000,
                "desc": "Freshly brewed South Indian filter coffee",
                "desc_te": "తాజా సౌత్ ఇండియన్ ఫిల్టర్ కాఫీ",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Teas",
                "name": "Black Coffee",
                "name_te": "బ్లాక్ కాఫీ",
                "price": 2000,
                "desc": "Strong dark roasted filter decoction",
                "desc_te": "ఘాటైన బ్లాక్ కాఫీ",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Bellam Coffee",
                "name_te": "బెల్లం కాఫీ",
                "price": 2000,
                "desc": "Filter coffee naturally sweetened with jaggery",
                "desc_te": "స్వచ్ఛమైన బెల్లంతో ఫిల్టర్ కాఫీ",
                "is_veg": True,
            },
            {
                "cat": "Teas",
                "name": "Coffee Flask (6 Nos.)",
                "name_te": "కాఫీ ఫ్లాస్క్ (6 కప్పులు)",
                "price": 15000,
                "desc": "Insulated flask serving 6 piping hot filter coffees",
                "desc_te": "6 కప్పుల వేడి ఫిల్టర్ కాఫీ ఫ్లాస్క్",
                "is_veg": True,
            },

            # ================= MILK SHAKES (7 items) =================
            {
                "cat": "Milk Shakes",
                "name": "Chocolate Shake",
                "name_te": "చాక్లెట్ మిల్క్ షేక్",
                "price": 5900,
                "desc": "Creamy rich chocolate shake topped with cocoa drizzle",
                "desc_te": "చాక్లెట్ సిరప్‌తో క్రీమీ మిల్క్ షేక్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "Strawberry Shake",
                "name_te": "స్ట్రాబెర్రీ షేక్",
                "price": 5900,
                "desc": "Luscious strawberry milk shake",
                "desc_te": "తాజా స్ట్రాబెర్రీ మిల్క్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "Vanilla Shake",
                "name_te": "వెనిల్లా షేక్",
                "price": 5900,
                "desc": "Classic creamy French vanilla shake",
                "desc_te": "క్లాసిక్ వెనిల్లా మిల్క్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "Oreo Milk Shake",
                "name_te": "ఓరియో మిల్క్ షేక్",
                "price": 5900,
                "desc": "Crunchy crushed Oreo cookies blended with creamy milk",
                "desc_te": "ఓరియో బిస్కెట్ క్రంచీ మిల్క్ షేక్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "Mango Milk Shake",
                "name_te": "మామిడి పండ్ల షేక్",
                "price": 5900,
                "desc": "Sweet Alphonso mango pulp shake",
                "desc_te": "తీపి మామిడి పండ్ల రసంతో మిల్క్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "Dark Fantasy Shake",
                "name_te": "డార్క్ ఫాంటసీ షేక్",
                "price": 6900,
                "desc": "Decadent Dark Fantasy biscuit molten shake",
                "desc_te": "డార్క్ ఫాంటసీ చాక్లెట్ మిల్క్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Milk Shakes",
                "name": "KitKat Milk Shake",
                "name_te": "కిట్‌క్యాట్ మిల్క్ షేక్",
                "price": 7900,
                "desc": "Wafer KitKat chocolate blended thick shake",
                "desc_te": "కిట్‌క్యాట్ చాక్లెట్‌తో చిక్కని షేక్",
                "is_veg": True,
                "is_special": True,
            },

            # ================= SNACKS (13 items) =================
            {
                "cat": "Snacks",
                "name": "Onion Samosa (Each)",
                "name_te": "ఉల్లిపాయ సమోసా (ఒకటి)",
                "price": 600,
                "desc": "Crispy golden fried spiced onion pastry",
                "desc_te": "క్రిస్పీ గోల్డెన్ ఉల్లిపాయ సమోసా",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Snacks",
                "name": "Corn Samosa (Each)",
                "name_te": "కార్న్ సమోసా (ఒకటి)",
                "price": 700,
                "desc": "Sweet corn & spices filled crunchy samosa",
                "desc_te": "తీపి మొక్కజొన్న సమోసా",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Aloo Samosa (Each)",
                "name_te": "ఆలూ సమోసా (ఒకటి)",
                "price": 1500,
                "desc": "Classic spiced potato & peas jumbo samosa",
                "desc_te": "ఆలూ మసాలా సమోసా",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Osmania Biscuit (Each)",
                "name_te": "ఉస్మానియా బిస్కెట్ (ఒకటి)",
                "price": 400,
                "desc": "Authentic melt-in-mouth sweet & salty Irani cafe biscuit",
                "desc_te": "చాయ్‌కి సరైన జత ఉస్మానియా బిస్కెట్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Snacks",
                "name": "Veg Puff",
                "name_te": "వెజ్ పఫ్",
                "price": 2000,
                "desc": "Flaky oven-baked puff with spiced potato veggie filling",
                "desc_te": "కూరగాయల మసాలాతో క్రిస్పీ వెజ్ పఫ్",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Egg Puff",
                "name_te": "ఎగ్ పఫ్",
                "price": 2000,
                "desc": "Flaky puff stuffed with spiced boiled egg & onions",
                "desc_te": "గుడ్డు మసాలాతో క్రిస్పీ ఎగ్ పఫ్",
                "is_veg": False,
            },
            {
                "cat": "Snacks",
                "name": "Chicken Puff",
                "name_te": "చికెన్ పఫ్",
                "price": 3000,
                "desc": "Bakery fresh flaky puff filled with spicy minced chicken",
                "desc_te": "ఘాటైన చికెన్ మసాలాతో తాజా బేకరీ పఫ్",
                "is_veg": False,
                "is_special": True,
            },
            {
                "cat": "Snacks",
                "name": "Muffin",
                "name_te": "మఫిన్",
                "price": 2000,
                "desc": "Soft freshly baked vanilla sponge muffin",
                "desc_te": "తాజా మెత్తని బేకరీ మఫిన్",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Veg Maggi",
                "name_te": "వెజ్ మ్యాగీ",
                "price": 4000,
                "desc": "Hot masala Maggi noodles cooked with mixed veggies",
                "desc_te": "కూరగాయలతో వేడివేడి మసాలా మ్యాగీ",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Egg Maggi",
                "name_te": "ఎగ్ మ్యాగీ",
                "price": 6000,
                "desc": "Masala noodles tossed with scrambled egg",
                "desc_te": "గుడ్డుతో మసాలా మ్యాగీ",
                "is_veg": False,
            },
            {
                "cat": "Snacks",
                "name": "Double Egg Maggi",
                "name_te": "డబుల్ ఎగ్ మ్యాగీ",
                "price": 7000,
                "desc": "Loaded Maggi noodles with double farm fresh eggs",
                "desc_te": "రెండు గుడ్లతో స్పెషల్ డబుల్ ఎగ్ మ్యాగీ",
                "is_veg": False,
            },
            {
                "cat": "Snacks",
                "name": "Choco Chip Loaf",
                "name_te": "చోకో చిప్ కేక్ లోఫ్",
                "price": 12000,
                "desc": "Moist sliced tea cake loaf dotted with rich chocolate chips",
                "desc_te": "చాక్లెట్ చిప్స్ టీ కేక్",
                "is_veg": True,
            },
            {
                "cat": "Snacks",
                "name": "Coconut Loaf",
                "name_te": "కొబ్బరి కేక్ లోఫ్",
                "price": 14000,
                "desc": "Traditional desiccated coconut fragrant bakery cake loaf",
                "desc_te": "కొబ్బరి సువాసనతో స్పెషల్ కేక్",
                "is_veg": True,
            },

            # ================= COOLERS (8 items) =================
            {
                "cat": "Coolers",
                "name": "Lime Mint Cooler",
                "name_te": "నిమ్మ పుదీనా కూలర్",
                "price": 4900,
                "desc": "Chilled refreshing lemonade with crushed garden mint",
                "desc_te": "చల్లని నిమ్మకాయ మరియు తాజా పుదీనా పానీయం",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Coolers",
                "name": "Lime Mint Soda",
                "name_te": "నిమ్మ పుదీనా సోడా",
                "price": 5900,
                "desc": "Fizzy club soda with fresh lime & crushed mint",
                "desc_te": "ఫిజ్జీ సోడాతో నిమ్మ పుదీనా",
                "is_veg": True,
            },
            {
                "cat": "Coolers",
                "name": "Ginger Lemon Ice Tea",
                "name_te": "జింజర్ లెమన్ ఐస్ టీ",
                "price": 4900,
                "desc": "Cold brewed iced tea infused with ginger & lemon",
                "desc_te": "చల్లని అల్లం నిమ్మ ఐస్ టీ",
                "is_veg": True,
            },
            {
                "cat": "Coolers",
                "name": "Water Melon",
                "name_te": "పుచ్చకాయ జ్యూస్",
                "price": 5900,
                "desc": "Freshly crushed hydrating watermelon juice",
                "desc_te": "తాజా పుచ్చకాయ జ్యూస్",
                "is_veg": True,
            },
            {
                "cat": "Coolers",
                "name": "Fizi Mojito (Green/Blue)",
                "name_te": "ఫిజ్జీ మోజిటో (గ్రీన్/బ్లూ)",
                "price": 6900,
                "desc": "Sparkling citrus curacao cooler on crushed ice",
                "desc_te": "స్పెషల్ ఫిజ్జీ కూరకావో మోజిటో",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Coolers",
                "name": "Lime Mint Mojito",
                "name_te": "లైమ్ మింట్ మోజిటో",
                "price": 6900,
                "desc": "Classic sparkling mocktail with lime, mint & soda",
                "desc_te": "క్లాసిక్ లైమ్ మింట్ మాక్‌టైల్",
                "is_veg": True,
            },
            {
                "cat": "Coolers",
                "name": "Matka Lassi",
                "name_te": "మట్కా లస్సీ",
                "price": 5900,
                "desc": "Thick creamy sweet Punjabi curd lassi in earthen pot",
                "desc_te": "మట్టి పాత్రలో చిక్కని తీపి లస్సీ",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Coolers",
                "name": "Cold Coffee",
                "name_te": "కోల్డ్ కాఫీ",
                "price": 5900,
                "desc": "Thick blended iced espresso with creamy milk & chocolate drizzle",
                "desc_te": "చల్లని ఐస్డ్ కాఫీ చాక్లెట్ సిరప్‌తో",
                "is_veg": True,
                "is_special": True,
            },

            # ================= FLAVOURED MILKS (2 items) =================
            {
                "cat": "Flavoured Milks",
                "name": "Rose Milk",
                "name_te": "రోజ్ మిల్క్",
                "price": 5900,
                "desc": "Chilled fragrant Damascus rose petal syrup with cold milk",
                "desc_te": "చల్లని గులాబీ సువాసనతో రోజ్ మిల్క్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Flavoured Milks",
                "name": "Chilled Badam Milk",
                "name_te": "చిల్డ్ బాదం మిల్క్",
                "price": 5900,
                "desc": "Chilled thick saffron badam milk with almond flakes",
                "desc_te": "బాదం పలుకులతో చల్లని కేసర్ బాదం పాలు",
                "is_veg": True,
                "is_special": True,
            },

            # ================= PREMIUM SHAKES (8 items) =================
            {
                "cat": "Premium Shakes",
                "name": "Cranberry Shake",
                "name_te": "క్రాన్‌బెర్రీ షేక్",
                "price": 9900,
                "desc": "Tart sweet North American cranberries blended thick shake",
                "desc_te": "ప్రీమియం క్రాన్‌బెర్రీ మిల్క్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Pista Shake",
                "name_te": "పిస్తా షేక్",
                "price": 9900,
                "desc": "Rich roasted pistachios blended with malai ice cream",
                "desc_te": "స్వచ్ఛమైన పిస్తా పలుకులతో రిచ్ షేక్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Californian Shake",
                "name_te": "కాలిఫోర్నియన్ షేక్",
                "price": 9900,
                "desc": "Exotic California prunes and dry fruit thick shake",
                "desc_te": "కాలిఫోర్నియా డ్రైఫ్రూట్స్ స్పెషల్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Italian Shake",
                "name_te": "ఇటాలియన్ షేక్",
                "price": 9900,
                "desc": "Italian hazelnut chocolate and roasted coffee shake",
                "desc_te": "ఇటాలియన్ చాక్లెట్ & హాజెల్‌నట్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Royal Dates Shake",
                "name_te": "రాయల్ ఖర్జూరం షేక్",
                "price": 9900,
                "desc": "Arabian Medjool dates with honey & cream blend",
                "desc_te": "అరేబియన్ ఖర్జూరాలతో రాయల్ షేక్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Ban The Banana",
                "name_te": "బాన్ ది బనానా షేక్",
                "price": 9900,
                "desc": "Creamy banana caramel & butterscotch delight",
                "desc_te": "క్యారమెల్ బనానా స్పెషల్ షేక్",
                "is_veg": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Star Blast Shake",
                "name_te": "స్టార్ బ్లాస్ట్ షేక్",
                "price": 9900,
                "desc": "Chef special multi-berry & chocolate fusion explosion",
                "desc_te": "స్పెషల్ బెర్రీస్ మరియు చాక్లెట్ ఫ్యూజన్ షేక్",
                "is_veg": True,
                "is_special": True,
            },
            {
                "cat": "Premium Shakes",
                "name": "Mulberry Shake",
                "name_te": "మల్బరీ షేక్",
                "price": 9900,
                "desc": "Fresh sweet wild mulberries blended thick shake",
                "desc_te": "తాజా మల్బరీ పండ్లతో స్పెషల్ షేక్",
                "is_veg": True,
            },
        ]

        created_items = []
        for raw in menu_items_raw:
            cat_id = category_map[raw["cat"]]
            item = MenuItem(
                outlet_id=outlet.id,
                category_id=cat_id,
                name=raw["name"],
                name_te=raw.get("name_te"),
                description=raw.get("desc"),
                description_te=raw.get("desc_te"),
                price_paise=raw["price"],
                image_url=None,
                is_veg=raw.get("is_veg", True),
                is_available=True,
                track_stock=True,
                stock_qty=100,
                low_stock_threshold=10,
                is_special=raw.get("is_special", False),
            )
            db.add(item)
            created_items.append(item)

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
        print(f"[OK] Seeded {len(created_items)} Authentic Menu Items across {len(category_map)} Categories")

        db.commit()
        print("\n" + "=" * 70)
        print("[SUCCESS] TEA TIME CAFE DATABASE SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise e
    finally:
        db.close()


def auto_seed_if_empty():
    """Checks if database has an outlet; if empty, automatically seeds it."""
    db = SessionLocal()
    try:
        existing_outlet = db.query(Outlet).first()
        if existing_outlet is None:
            print("[AUTO-SEED] Database is empty. Running initial database seed...")
            seed_database(clear_existing=False)
        else:
            print(f"[AUTO-SEED] Database already populated with outlet: {existing_outlet.name}")
    except Exception as e:
        print(f"[AUTO-SEED] Warning: Auto-seed check encountered: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database(clear_existing=True)
