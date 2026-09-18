from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Package
from schemas import PackageCreate, PackageUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/packages",
    tags=["Packages"]
)


# =========================================================
# DATABASE
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# RESPONSE FORMAT
# =========================================================

def package_response(package):
    return {
        "id": package.id,
        "name": package.name,
        "description": package.description,
        "starting_price": package.starting_price,
        "services": package.services,
        "image_url": package.image_url,
        "is_active": package.is_active,
        "created_at": package.created_at,
    }


# =========================================================
# CREATE PACKAGE
# ADMIN ONLY
# =========================================================

@router.post("/")
def create_package(
    package_data: PackageCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    name = package_data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Package name is required"
        )

    if (
        package_data.starting_price is not None
        and package_data.starting_price < 0
    ):
        raise HTTPException(
            status_code=400,
            detail="Starting price cannot be negative"
        )

    package = Package(
        name=name,

        description=(
            package_data.description.strip()
            if package_data.description
            else None
        ),

        starting_price=package_data.starting_price,

        services=(
            package_data.services.strip()
            if package_data.services
            else None
        ),

        image_url=(
            package_data.image_url.strip()
            if package_data.image_url
            else None
        ),

        is_active=package_data.is_active
    )

    db.add(package)
    db.commit()
    db.refresh(package)

    return {
        "message": "Package created successfully",
        "package": package_response(package)
    }


# =========================================================
# GET ALL PACKAGES
# ADMIN ONLY
# =========================================================

@router.get("/")
def get_packages(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    packages = (
        db.query(Package)
        .order_by(Package.created_at.desc())
        .all()
    )

    return [
        package_response(package)
        for package in packages
    ]


# =========================================================
# GET ACTIVE PACKAGES
# ADMIN ONLY
# =========================================================

@router.get("/active")
def get_active_packages(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    packages = (
        db.query(Package)
        .filter(Package.is_active == True)
        .order_by(Package.created_at.desc())
        .all()
    )

    return [
        package_response(package)
        for package in packages
    ]


# =========================================================
# GET PUBLIC ACTIVE PACKAGES
# PUBLIC - NO LOGIN REQUIRED
# =========================================================

@router.get("/public")
def get_public_packages(
    db: Session = Depends(get_db)
):
    packages = (
        db.query(Package)
        .filter(Package.is_active == True)
        .order_by(Package.created_at.desc())
        .all()
    )

    return [
        package_response(package)
        for package in packages
    ]


# =========================================================
# GET PACKAGE BY ID
# ADMIN ONLY
# =========================================================

@router.get("/{package_id}")
def get_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    package = (
        db.query(Package)
        .filter(Package.id == package_id)
        .first()
    )

    if package is None:
        raise HTTPException(
            status_code=404,
            detail="Package not found"
        )

    return package_response(package)


# =========================================================
# UPDATE PACKAGE
# ADMIN ONLY
# =========================================================

@router.put("/{package_id}")
def update_package(
    package_id: int,
    package_data: PackageUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    package = (
        db.query(Package)
        .filter(Package.id == package_id)
        .first()
    )

    if package is None:
        raise HTTPException(
            status_code=404,
            detail="Package not found"
        )

    update_data = package_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # -----------------------------------------------------
    # NAME VALIDATION
    # -----------------------------------------------------

    if "name" in update_data:

        if update_data["name"] is None:
            raise HTTPException(
                status_code=400,
                detail="Package name cannot be null"
            )

        update_data["name"] = update_data["name"].strip()

        if not update_data["name"]:
            raise HTTPException(
                status_code=400,
                detail="Package name cannot be empty"
            )

    # -----------------------------------------------------
    # PRICE VALIDATION
    # -----------------------------------------------------

    if "starting_price" in update_data:

        if (
            update_data["starting_price"] is not None
            and update_data["starting_price"] < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Starting price cannot be negative"
            )

    # -----------------------------------------------------
    # OPTIONAL TEXT FIELDS
    # -----------------------------------------------------

    if "description" in update_data:

        update_data["description"] = (
            update_data["description"].strip()
            if update_data["description"]
            else None
        )

    if "services" in update_data:

        update_data["services"] = (
            update_data["services"].strip()
            if update_data["services"]
            else None
        )

    if "image_url" in update_data:

        update_data["image_url"] = (
            update_data["image_url"].strip()
            if update_data["image_url"]
            else None
        )

    # -----------------------------------------------------
    # APPLY UPDATE
    # -----------------------------------------------------

    for field, value in update_data.items():
        setattr(package, field, value)

    db.commit()
    db.refresh(package)

    return {
        "message": "Package updated successfully",
        "package": package_response(package)
    }


# =========================================================
# DELETE PACKAGE
# ADMIN ONLY
# =========================================================

@router.delete("/{package_id}")
def delete_package(
    package_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    package = (
        db.query(Package)
        .filter(Package.id == package_id)
        .first()
    )

    if package is None:
        raise HTTPException(
            status_code=404,
            detail="Package not found"
        )

    db.delete(package)
    db.commit()

    return {
        "message": "Package deleted successfully",
        "package_id": package_id
    }