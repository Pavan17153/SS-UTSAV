import os
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from database import engine,Base
from models import (
    Admin,
    Lead,
    Customer,
    Event,
    Quotation,
    QuotationItem,
    Payment,
    Vendor,
    Gallery,
    Package,
    Testimonial,
    Settings,
    LegalDocument,
)
Base.metadata.create_all(bind=engine)
from routes.leads import router as leads_router
from routes.admin import router as admin_router
from routes.customers import router as customers_router
from routes.events import router as events_router
from routes.quotations import router as quotations_router
from routes.payments import router as payments_router
from routes.vendors import router as vendors_router
from routes.gallery import router as gallery_router
from routes.packages import router as packages_router
from routes.testimonials import router as testimonials_router
from routes.dashboard import router as dashboard_router
from routes.settings import router as settings_router
from routes.legal import router as legal_router

app = FastAPI(
    title="SS UTSAV API",
    description="Backend API for SS UTSAV Event Management",
    version="1.0.0"
)
os.makedirs("uploads/gallery", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(leads_router)
app.include_router(admin_router)
app.include_router(customers_router)
app.include_router(events_router)
app.include_router(quotations_router)
app.include_router(payments_router)
app.include_router(vendors_router)
app.include_router(gallery_router)
app.include_router(packages_router)
app.include_router(testimonials_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(legal_router)

@app.get("/")
def root():
    return {
        "message": "SS UTSAV API is running"
    }


@app.get("/db-test")
def database_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {
            "database": "connected",
            "result": result.scalar()
        }
