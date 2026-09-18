from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Settings
from schemas import SettingsCreate, SettingsUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)


# =========================================================
# DATABASE DEPENDENCY
# =========================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# RESPONSE HELPER
# =========================================================

def settings_response(settings):
    return {
        "id": settings.id,
        "company_name": settings.company_name,
        "tagline": settings.tagline,
        "phone": settings.phone,
        "email": settings.email,
        "address": settings.address,
        "whatsapp_number": settings.whatsapp_number,
        "website_url": settings.website_url,
        "instagram_url": settings.instagram_url,
        "facebook_url": settings.facebook_url,
        "description": settings.description,
        "logo_url": settings.logo_url,
        "is_active": settings.is_active,
        "updated_at": settings.updated_at,
        "twitter_x_url": settings.twitter_x_url,
    }


# =========================================================
# GET SETTINGS - ADMIN
# =========================================================

@router.get("/")
def get_settings(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    settings = (
        db.query(Settings)
        .order_by(Settings.id.asc())
        .first()
    )

    if settings is None:
        raise HTTPException(
            status_code=404,
            detail="Settings not configured"
        )

    return settings_response(settings)


# =========================================================
# CREATE SETTINGS
# =========================================================

@router.post("/")
def create_settings(
    settings_data: SettingsCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # Only one global settings record is allowed
    existing_settings = (
        db.query(Settings)
        .order_by(Settings.id.asc())
        .first()
    )

    if existing_settings:
        raise HTTPException(
            status_code=409,
            detail="Settings already exist. Use PUT to update them."
        )

    # Validate company name
    company_name = settings_data.company_name.strip()

    if not company_name:
        raise HTTPException(
            status_code=400,
            detail="Company name is required"
        )

    settings = Settings(
        company_name=company_name,

        tagline=(
            settings_data.tagline.strip()
            if settings_data.tagline
            else None
        ),

        phone=(
            settings_data.phone.strip()
            if settings_data.phone
            else None
        ),

        email=(
            settings_data.email.strip()
            if settings_data.email
            else None
        ),

        address=(
            settings_data.address.strip()
            if settings_data.address
            else None
        ),

        whatsapp_number=(
            settings_data.whatsapp_number.strip()
            if settings_data.whatsapp_number
            else None
        ),

        website_url=(
            settings_data.website_url.strip()
            if settings_data.website_url
            else None
        ),

        instagram_url=(
            settings_data.instagram_url.strip()
            if settings_data.instagram_url
            else None
        ),

        facebook_url=(
            settings_data.facebook_url.strip()
            if settings_data.facebook_url
            else None
        ),

        description=(
            settings_data.description.strip()
            if settings_data.description
            else None
        ),

        logo_url=(
            settings_data.logo_url.strip()
            if settings_data.logo_url
            else None
        ),
        twitter_x_url=(settings_data.twitter_x_url.strip() if settings_data.twitter_x_url else None),

        is_active=settings_data.is_active,
    )

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return {
        "message": "Settings created successfully",
        "settings": settings_response(settings)
    }


# =========================================================
# UPDATE SETTINGS
# =========================================================

@router.put("/")
def update_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    settings = (
        db.query(Settings)
        .order_by(Settings.id.asc())
        .first()
    )

    if settings is None:
        raise HTTPException(
            status_code=404,
            detail="Settings not configured"
        )

    update_data = settings_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # -----------------------------------------------------
    # COMPANY NAME VALIDATION
    # -----------------------------------------------------

    if "company_name" in update_data:

        if update_data["company_name"] is None:
            raise HTTPException(
                status_code=400,
                detail="Company name cannot be null"
            )

        update_data["company_name"] = (
            update_data["company_name"].strip()
        )

        if not update_data["company_name"]:
            raise HTTPException(
                status_code=400,
                detail="Company name cannot be empty"
            )

    # -----------------------------------------------------
    # CLEAN TEXT FIELDS
    # -----------------------------------------------------

    text_fields = [
        "tagline",
        "phone",
        "email",
        "address",
        "whatsapp_number",
        "website_url",
        "instagram_url",
        "facebook_url",
        "description",
        "twitter_x_url",
        "logo_url",
    ]

    for field in text_fields:

        if field in update_data:

            value = update_data[field]

            if isinstance(value, str):
                value = value.strip()

                if not value:
                    value = None

            update_data[field] = value

    # -----------------------------------------------------
    # APPLY UPDATE
    # -----------------------------------------------------

    for field, value in update_data.items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return {
        "message": "Settings updated successfully",
        "settings": settings_response(settings)
    }


# =========================================================
# PUBLIC SETTINGS
# =========================================================

@router.get("/public")
def get_public_settings(
    db: Session = Depends(get_db)
):
    settings = (
        db.query(Settings)
        .filter(Settings.is_active == True)
        .order_by(Settings.id.asc())
        .first()
    )

    if settings is None:
        raise HTTPException(
            status_code=404,
            detail="Public settings not available"
        )

    return {
        "company_name": settings.company_name,
        "tagline": settings.tagline,
        "phone": settings.phone,
        "email": settings.email,
        "address": settings.address,
        "whatsapp_number": settings.whatsapp_number,
        "website_url": settings.website_url,
        "instagram_url": settings.instagram_url,
        "facebook_url": settings.facebook_url,
        "description": settings.description,
        "logo_url": settings.logo_url,
        "twitter_x_url": settings.twitter_x_url,
    }