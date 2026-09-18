from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Vendor
from schemas import VendorCreate, VendorUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/vendors",
    tags=["Vendors"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def vendor_response(vendor):
    return {
        "id": vendor.id,
        "name": vendor.name,
        "category": vendor.category,
        "contact_person": vendor.contact_person,
        "phone": vendor.phone,
        "email": vendor.email,
        "address": vendor.address,
        "service_description": vendor.service_description,
        "pricing": vendor.pricing,
        "is_available": vendor.is_available,
        "is_active": vendor.is_active,
        "created_at": vendor.created_at,
    }


# =========================================================
# CREATE VENDOR
# =========================================================

@router.post("/")
def create_vendor(
    vendor_data: VendorCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    name = vendor_data.name.strip()
    category = vendor_data.category.strip()
    phone = vendor_data.phone.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Vendor name is required"
        )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Vendor category is required"
        )

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="Vendor phone number is required"
        )

    if vendor_data.pricing is not None and vendor_data.pricing < 0:
        raise HTTPException(
            status_code=400,
            detail="Pricing cannot be negative"
        )

    vendor = Vendor(
        name=name,
        category=category,
        contact_person=(
            vendor_data.contact_person.strip()
            if vendor_data.contact_person
            else None
        ),
        phone=phone,
        email=vendor_data.email,
        address=(
            vendor_data.address.strip()
            if vendor_data.address
            else None
        ),
        service_description=(
            vendor_data.service_description.strip()
            if vendor_data.service_description
            else None
        ),
        pricing=vendor_data.pricing,
        is_available=vendor_data.is_available,
        is_active=vendor_data.is_active,
    )

    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor created successfully",
        "vendor": vendor_response(vendor)
    }


# =========================================================
# GET ALL VENDORS
# =========================================================

@router.get("/")
def get_vendors(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vendors = (
        db.query(Vendor)
        .order_by(Vendor.created_at.desc())
        .all()
    )

    return [
        vendor_response(vendor)
        for vendor in vendors
    ]


# =========================================================
# GET VENDOR BY ID
# =========================================================

@router.get("/{vendor_id}")
def get_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vendor = (
        db.query(Vendor)
        .filter(Vendor.id == vendor_id)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return vendor_response(vendor)


# =========================================================
# UPDATE VENDOR
# =========================================================

@router.put("/{vendor_id}")
def update_vendor(
    vendor_id: int,
    vendor_data: VendorUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vendor = (
        db.query(Vendor)
        .filter(Vendor.id == vendor_id)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    update_data = vendor_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # Required text fields
    if "name" in update_data:
        if update_data["name"] is None:
            raise HTTPException(
                status_code=400,
                detail="Vendor name cannot be null"
            )

        update_data["name"] = update_data["name"].strip()

        if not update_data["name"]:
            raise HTTPException(
                status_code=400,
                detail="Vendor name cannot be empty"
            )

    if "category" in update_data:
        if update_data["category"] is None:
            raise HTTPException(
                status_code=400,
                detail="Vendor category cannot be null"
            )

        update_data["category"] = update_data["category"].strip()

        if not update_data["category"]:
            raise HTTPException(
                status_code=400,
                detail="Vendor category cannot be empty"
            )

    if "phone" in update_data:
        if update_data["phone"] is None:
            raise HTTPException(
                status_code=400,
                detail="Vendor phone cannot be null"
            )

        update_data["phone"] = update_data["phone"].strip()

        if not update_data["phone"]:
            raise HTTPException(
                status_code=400,
                detail="Vendor phone cannot be empty"
            )

    # Pricing
    if "pricing" in update_data:
        if (
            update_data["pricing"] is not None
            and update_data["pricing"] < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Pricing cannot be negative"
            )

    # Optional text
    if "contact_person" in update_data:
        update_data["contact_person"] = (
            update_data["contact_person"].strip()
            if update_data["contact_person"]
            else None
        )

    if "address" in update_data:
        update_data["address"] = (
            update_data["address"].strip()
            if update_data["address"]
            else None
        )

    if "service_description" in update_data:
        update_data["service_description"] = (
            update_data["service_description"].strip()
            if update_data["service_description"]
            else None
        )

    for field, value in update_data.items():
        setattr(vendor, field, value)

    db.commit()
    db.refresh(vendor)

    return {
        "message": "Vendor updated successfully",
        "vendor": vendor_response(vendor)
    }


# =========================================================
# DELETE VENDOR
# =========================================================

@router.delete("/{vendor_id}")
def delete_vendor(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vendor = (
        db.query(Vendor)
        .filter(Vendor.id == vendor_id)
        .first()
    )

    if vendor is None:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    db.delete(vendor)
    db.commit()

    return {
        "message": "Vendor deleted successfully",
        "vendor_id": vendor_id
    }