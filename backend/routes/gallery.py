import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    status,
)
from sqlalchemy.orm import Session

from auth import get_current_admin, get_db
from models import Gallery
from schemas import GalleryCreate, GalleryUpdate, GalleryResponse


router = APIRouter(
    prefix="/api/gallery",
    tags=["Gallery"],
)


# ============================================================
# CONSTANTS
# ============================================================

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ============================================================
# HELPERS
# ============================================================

def clean_text(value):
    if value is None:
        return None

    value = value.strip()

    return value if value else None


# ============================================================
# UPLOAD IMAGE
# ADMIN ONLY
#
# IMPORTANT:
# This route must stay ABOVE /{gallery_id}
# ============================================================

@router.post("/upload")
async def upload_gallery_image(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected",
        )

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, WEBP and GIF images are allowed",
        )

    upload_dir = os.path.join("uploads", "gallery")

    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"

    file_path = os.path.join(upload_dir, filename)

    total_size = 0

    try:
        with open(file_path, "wb") as buffer:

            while True:

                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:

                    if os.path.exists(file_path):
                        os.remove(file_path)

                    raise HTTPException(
                        status_code=400,
                        detail="Image size must be 10 MB or less",
                    )

                buffer.write(chunk)

    except HTTPException:
        raise

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload image",
        )

    finally:
        await file.close()

    image_url = f"/uploads/gallery/{filename}"

    return {
        "message": "Image uploaded successfully",
        "image_url": image_url,
        "filename": filename,
    }


# ============================================================
# CREATE GALLERY ITEM
# ADMIN ONLY
# ============================================================

@router.post(
    "/",
    response_model=GalleryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_gallery(
    data: GalleryCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    title = data.title.strip()
    category = data.category.strip()
    image_url = data.image_url.strip()

    if not title:
        raise HTTPException(
            status_code=400,
            detail="Title is required",
        )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category is required",
        )

    if not image_url:
        raise HTTPException(
            status_code=400,
            detail="Image URL is required",
        )

    gallery = Gallery(
        title=title,
        category=category,
        description=clean_text(data.description),
        image_url=image_url,
        is_active=data.is_active,
    )

    db.add(gallery)
    db.commit()
    db.refresh(gallery)

    return gallery


# ============================================================
# GET ALL GALLERY
# ADMIN ONLY
# ============================================================

@router.get(
    "/",
    response_model=list[GalleryResponse],
)
def get_gallery(
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    return (
        db.query(Gallery)
        .order_by(Gallery.created_at.desc())
        .all()
    )


# ============================================================
# GET ACTIVE GALLERY
# PUBLIC
#
# Used when you want active gallery images only.
# ============================================================

@router.get(
    "/active",
    response_model=list[GalleryResponse],
)
def get_active_gallery(
    db: Session = Depends(get_db),
):
    return (
        db.query(Gallery)
        .filter(Gallery.is_active == True)
        .order_by(Gallery.created_at.desc())
        .all()
    )


# ============================================================
# GET PUBLIC GALLERY
# PUBLIC WEBSITE
#
# IMPORTANT:
# NO get_current_admin() HERE
# ============================================================

@router.get(
    "/public",
    response_model=list[GalleryResponse],
)
def get_public_gallery(
    db: Session = Depends(get_db),
):
    return (
        db.query(Gallery)
        .filter(Gallery.is_active == True)
        .order_by(Gallery.created_at.desc())
        .all()
    )


# ============================================================
# GET BY CATEGORY
# ADMIN ONLY
# ============================================================

@router.get(
    "/category/{category}",
    response_model=list[GalleryResponse],
)
def get_gallery_by_category(
    category: str,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    return (
        db.query(Gallery)
        .filter(Gallery.category == category)
        .order_by(Gallery.created_at.desc())
        .all()
    )


# ============================================================
# GET SINGLE GALLERY ITEM
# ADMIN ONLY
# ============================================================

@router.get(
    "/{gallery_id}",
    response_model=GalleryResponse,
)
def get_gallery_item(
    gallery_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    gallery = (
        db.query(Gallery)
        .filter(Gallery.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery item not found",
        )

    return gallery


# ============================================================
# UPDATE GALLERY
# ADMIN ONLY
# ============================================================

@router.put(
    "/{gallery_id}",
    response_model=GalleryResponse,
)
def update_gallery(
    gallery_id: int,
    data: GalleryUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    gallery = (
        db.query(Gallery)
        .filter(Gallery.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery item not found",
        )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    if data.title is not None:

        title = data.title.strip()

        if not title:
            raise HTTPException(
                status_code=400,
                detail="Title cannot be empty",
            )

        gallery.title = title

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    if data.category is not None:

        category = data.category.strip()

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Category cannot be empty",
            )

        gallery.category = category

    # --------------------------------------------------------
    # DESCRIPTION
    # --------------------------------------------------------

    if data.description is not None:
        gallery.description = clean_text(data.description)

    # --------------------------------------------------------
    # IMAGE URL
    # --------------------------------------------------------

    if data.image_url is not None:

        image_url = data.image_url.strip()

        if not image_url:
            raise HTTPException(
                status_code=400,
                detail="Image URL cannot be empty",
            )

        gallery.image_url = image_url

    # --------------------------------------------------------
    # ACTIVE STATUS
    # --------------------------------------------------------

    if data.is_active is not None:
        gallery.is_active = data.is_active

    db.commit()
    db.refresh(gallery)

    return gallery


# ============================================================
# DELETE GALLERY
# ADMIN ONLY
# ============================================================

@router.delete("/{gallery_id}")
def delete_gallery(
    gallery_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    gallery = (
        db.query(Gallery)
        .filter(Gallery.id == gallery_id)
        .first()
    )

    if not gallery:
        raise HTTPException(
            status_code=404,
            detail="Gallery item not found",
        )

    # --------------------------------------------------------
    # DELETE LOCAL IMAGE FILE
    # --------------------------------------------------------

    if gallery.image_url:

        relative_path = gallery.image_url.lstrip("/")

        if relative_path.startswith("uploads/gallery/"):

            file_path = relative_path.replace("/", os.sep)

            if os.path.exists(file_path):

                try:
                    os.remove(file_path)

                except Exception:
                    pass

    # --------------------------------------------------------
    # DELETE DATABASE RECORD
    # --------------------------------------------------------

    db.delete(gallery)
    db.commit()

    return {
        "message": "Gallery item deleted successfully"
    }