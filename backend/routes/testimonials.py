from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from database import SessionLocal
from models import Testimonial
from schemas import TestimonialCreate, TestimonialUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/testimonials",
    tags=["Testimonials"]
)
TESTIMONIAL_UPLOAD_DIR = "uploads/testimonials"

os.makedirs(
    TESTIMONIAL_UPLOAD_DIR,
    exist_ok=True
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def testimonial_response(testimonial):
    return {
        "id": testimonial.id,
        "customer_name": testimonial.customer_name,
        "event_type": testimonial.event_type,
        "review": testimonial.review,
        "image_url": testimonial.image_url,
        "rating": testimonial.rating,
        "is_active": testimonial.is_active,
        "created_at": testimonial.created_at,
    }


# =========================================================
# CREATE TESTIMONIAL - ADMIN
# =========================================================

@router.post("/")
def create_testimonial(
    testimonial_data: TestimonialCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    customer_name = testimonial_data.customer_name.strip()
    review = testimonial_data.review.strip()

    if not customer_name:
        raise HTTPException(
            status_code=400,
            detail="Customer name is required"
        )

    if not review:
        raise HTTPException(
            status_code=400,
            detail="Review is required"
        )

    testimonial = Testimonial(
    customer_name=customer_name,
    event_type=(
        testimonial_data.event_type.strip()
        if testimonial_data.event_type
        else None
    ),
    review=review,
    image_url=(
        testimonial_data.image_url.strip()
        if testimonial_data.image_url
        else None
    ),
    rating=testimonial_data.rating,
    is_active=testimonial_data.is_active
)
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)

    return {
        "message": "Testimonial created successfully",
        "testimonial": testimonial_response(testimonial)
    }


# =========================================================
# GET ALL TESTIMONIALS - ADMIN
# =========================================================

@router.get("/")
def get_testimonials(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    testimonials = (
        db.query(Testimonial)
        .order_by(Testimonial.created_at.desc())
        .all()
    )

    return [
        testimonial_response(testimonial)
        for testimonial in testimonials
    ]


# =========================================================
# GET ACTIVE TESTIMONIALS - ADMIN
# =========================================================

@router.get("/active")
def get_active_testimonials(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .order_by(Testimonial.created_at.desc())
        .all()
    )

    return [
        testimonial_response(testimonial)
        for testimonial in testimonials
    ]


# =========================================================
# GET PUBLIC TESTIMONIALS - CUSTOMER WEBSITE
# =========================================================

@router.get("/public")
def get_public_testimonials(
    db: Session = Depends(get_db)
):
    testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .order_by(Testimonial.created_at.desc())
        .all()
    )

    return [
        testimonial_response(testimonial)
        for testimonial in testimonials
    ]


# =========================================================
# GET TESTIMONIAL BY ID - ADMIN
# =========================================================

@router.get("/{testimonial_id}")
def get_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    testimonial = (
        db.query(Testimonial)
        .filter(Testimonial.id == testimonial_id)
        .first()
    )

    if testimonial is None:
        raise HTTPException(
            status_code=404,
            detail="Testimonial not found"
        )

    return testimonial_response(testimonial)


# =========================================================
# UPDATE TESTIMONIAL - ADMIN
# =========================================================
@router.post("/upload")
def upload_testimonial_image(
    file: UploadFile = File(...),
    current_admin=Depends(get_current_admin)
):
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    }

    max_file_size = 10 * 1024 * 1024

    original_name = file.filename or ""

    extension = os.path.splitext(
        original_name
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, WEBP and GIF files are allowed"
        )

    unique_name = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        TESTIMONIAL_UPLOAD_DIR,
        unique_name
    )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        file_size = os.path.getsize(file_path)

        if file_size > max_file_size:
            os.remove(file_path)

            raise HTTPException(
                status_code=400,
                detail="Image size must not exceed 10MB"
            )

    except HTTPException:
        raise

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload testimonial image"
        )

    image_url = (
        f"/uploads/testimonials/{unique_name}"
    )

    return {
        "message": "Testimonial image uploaded successfully",
        "image_url": image_url,
        "filename": unique_name
    }

@router.put("/{testimonial_id}")
def update_testimonial(
    testimonial_id: int,
    testimonial_data: TestimonialUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    testimonial = (
        db.query(Testimonial)
        .filter(Testimonial.id == testimonial_id)
        .first()
    )

    if testimonial is None:
        raise HTTPException(
            status_code=404,
            detail="Testimonial not found"
        )

    update_data = testimonial_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # Customer name
    if "customer_name" in update_data:
        if update_data["customer_name"] is None:
            raise HTTPException(
                status_code=400,
                detail="Customer name cannot be null"
            )

        update_data["customer_name"] = (
            update_data["customer_name"].strip()
        )

        if not update_data["customer_name"]:
            raise HTTPException(
                status_code=400,
                detail="Customer name cannot be empty"
            )

    # Review
    if "review" in update_data:
        if update_data["review"] is None:
            raise HTTPException(
                status_code=400,
                detail="Review cannot be null"
            )

        update_data["review"] = (
            update_data["review"].strip()
        )

        if not update_data["review"]:
            raise HTTPException(
                status_code=400,
                detail="Review cannot be empty"
            )

    # Optional fields
    if "event_type" in update_data:
        update_data["event_type"] = (
            update_data["event_type"].strip()
            if update_data["event_type"]
            else None
        )

    if "image_url" in update_data:
        update_data["image_url"] = (
            update_data["image_url"].strip()
            if update_data["image_url"]
            else None
        )
    # Rating
    if "rating" in update_data:
        if update_data["rating"] is None:
            raise HTTPException(
                status_code=400,
                detail="Rating cannot be null"
            )

    if update_data["rating"] < 1 or update_data["rating"] > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5"
        )
    for field, value in update_data.items():
        setattr(testimonial, field, value)

    db.commit()
    db.refresh(testimonial)

    return {
        "message": "Testimonial updated successfully",
        "testimonial": testimonial_response(testimonial)
    }


# =========================================================
# DELETE TESTIMONIAL - ADMIN
# =========================================================

@router.delete("/{testimonial_id}")
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    testimonial = (
        db.query(Testimonial)
        .filter(Testimonial.id == testimonial_id)
        .first()
    )

    if testimonial is None:
        raise HTTPException(
            status_code=404,
            detail="Testimonial not found"
        )

    db.delete(testimonial)
    db.commit()

    return {
        "message": "Testimonial deleted successfully",
        "testimonial_id": testimonial_id
    }