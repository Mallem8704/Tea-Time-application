import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import (
    auth,
    categories,
    menu,
    tables,
    orders,
    stock,
    payments,
    service_calls,
    analytics,
    ws,
    audit,
    outlets,
)

# Initialize database schema tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Arabic Restaurant API",
    description="Backend API for Arabic Restaurant QR Ordering & Admin SaaS",
    version="1.0.0",
)

@app.on_event("startup")
def on_startup():
    """Ensure database schema tables exist, run column migrations, and seed initial store data if database is empty."""
    Base.metadata.create_all(bind=engine)
    
    # Run auto-migrations for PostgreSQL tables
    from sqlalchemy import text
    with engine.begin() as conn:
        migrations = [
            "ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'dine_in';",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_paise INTEGER DEFAULT 0;",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS opening_hours VARCHAR(100);",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);",
        ]
        for sql in migrations:
            try:
                conn.execute(text(sql))
            except Exception as mig_err:
                print(f"[MIGRATION] Note: {mig_err}")

    try:
        from app.seed import auto_seed_if_empty
        auto_seed_if_empty()
    except Exception as e:
        print(f"[STARTUP] Auto-seed warning: {e}")


@app.get("/api/migrate-db")
def trigger_db_migration():
    """Endpoint to trigger schema column migrations on demand."""
    from sqlalchemy import text
    results = []
    with engine.begin() as conn:
        migrations = [
            "ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'dine_in';",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50);",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_paise INTEGER DEFAULT 0;",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS opening_hours VARCHAR(100);",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);",
            "ALTER TABLE outlets ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);",
        ]
        for sql in migrations:
            try:
                conn.execute(text(sql))
                results.append({"query": sql, "status": "success"})
            except Exception as err:
                results.append({"query": sql, "status": f"skipped/error: {err}"})
    return {"status": "ok", "migrations": results}

# CORS configuration
frontend_env_raw = os.getenv("FRONTEND_URL", "http://localhost:3000")
frontend_origins = [u.strip() for u in frontend_env_raw.split(",") if u.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://arabic-restaurant-dineos.vercel.app",
    "https://tea-time-application.vercel.app",
    *frontend_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://(arabic-restaurant|tea-time)[a-zA-Z0-9_-]*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    dishes_dir = os.path.join(static_dir, "dishes")
    if os.path.exists(dishes_dir):
        app.mount("/dishes", StaticFiles(directory=dishes_dir), name="dishes")

# Include Routers with standard /api prefix and root aliases
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication (Alias)"])

app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(categories.router, prefix="/categories", tags=["Categories (Alias)"])

app.include_router(menu.router, prefix="/api/menu", tags=["Menu Items"])
app.include_router(menu.router, prefix="/menu", tags=["Menu Items (Alias)"])

app.include_router(tables.router, prefix="/api/tables", tags=["Tables & QR"])
app.include_router(tables.router, prefix="/tables", tags=["Tables & QR (Alias)"])

app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(orders.router, prefix="/orders", tags=["Orders (Alias)"])

app.include_router(stock.router, prefix="/api/stock", tags=["Inventory & Stock"])
app.include_router(stock.router, prefix="/stock", tags=["Inventory & Stock (Alias)"])

app.include_router(payments.router, prefix="/api/payments", tags=["Payments & Cashier"])
app.include_router(payments.router, prefix="/payments", tags=["Payments & Cashier (Alias)"])

app.include_router(service_calls.router, prefix="/api/service-calls", tags=["Service Calls"])
app.include_router(service_calls.router, prefix="/service-calls", tags=["Service Calls (Alias)"])

app.include_router(analytics.router, prefix="/api/analytics", tags=["Sales & Analytics"])
app.include_router(analytics.router, prefix="/analytics", tags=["Sales & Analytics (Alias)"])

app.include_router(ws.router, tags=["WebSockets"])

app.include_router(audit.router, prefix="/api/audit", tags=["Audit Logs"])
app.include_router(audit.router, prefix="/audit", tags=["Audit Logs (Alias)"])

app.include_router(outlets.router, prefix="/api/outlets", tags=["Outlet Settings"])
app.include_router(outlets.router, prefix="/outlets", tags=["Outlet Settings (Alias)"])


@app.get("/")
def root():
    return {
        "app": "Arabic Restaurant API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "ws_url": "/ws",
        "endpoints": {
            "auth_login": "/api/auth/login",
            "categories": "/api/categories",
            "menu": "/api/menu",
            "tables": "/api/tables",
            "orders": "/api/orders",
            "stock": "/api/stock",
            "payments": "/api/payments",
            "service_calls": "/api/service-calls",
            "analytics": "/api/analytics",
            "audit": "/api/audit",
        },
    }


@app.get("/api/health")
def health_check():
    try:
        from app.seed import auto_seed_if_empty
        auto_seed_if_empty()
    except Exception as e:
        print(f"[HEALTH] Auto-seed warning: {e}")
    return {
        "status": "healthy",
        "service": "tea-time-backend",
        "timestamp": "ok",
    }


@app.get("/api/seed")
@app.post("/api/seed")
def trigger_seed(key: str = "admin123"):
    if key != "admin123":
        return {"error": "Invalid key"}
    try:
        from app.seed import seed_database
        seed_database(clear_existing=True)
        return {
            "status": "success",
            "message": "Seeded full 198-item Arabieq Restaurant menu with 11 categories and 10 tables",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
