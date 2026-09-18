from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from models import Admin
from auth import (
    get_db,
    hash_password,
    verify_password,
    create_access_token,
    get_current_admin,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin Authentication"]
)

security = HTTPBearer()


# =========================
# SCHEMAS
# =========================

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


# =========================
# CREATE FIRST ADMIN
# =========================

@router.post("/setup")
def create_first_admin(
    admin_data: AdminCreate,
    db: Session = Depends(get_db)
):
    # Only allow setup when no admin exists
    existing_admin = db.query(Admin).first()

    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin setup is already completed"
        )

    # Check password length
    if len(admin_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters"
        )

    # Hash password
    password_hash = hash_password(admin_data.password)

    admin = Admin(
        name=admin_data.name,
        email=admin_data.email,
        password_hash=password_hash,
        role="admin",
        is_active=True
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "message": "Admin created successfully",
        "admin_id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "role": admin.role
    }


# =========================
# ADMIN LOGIN
# =========================

@router.post("/login")
def admin_login(
    login_data: AdminLogin,
    db: Session = Depends(get_db)
):

    admin = db.query(Admin).filter(
        Admin.email == login_data.email
    ).first()

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        admin.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )

    access_token = create_access_token({
        "admin_id": admin.id,
        "email": admin.email,
        "role": admin.role
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "admin_id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "role": admin.role
    }


# =========================
# CURRENT ADMIN
# =========================

@router.get("/me")
def get_me(
    current_admin: Admin = Depends(get_current_admin)
):
    return {
        "id": current_admin.id,
        "name": current_admin.name,
        "email": current_admin.email,
        "role": current_admin.role
    }