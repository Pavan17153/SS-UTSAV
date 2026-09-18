from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Quotation, QuotationItem, Event
from schemas import (
    QuotationCreate,
    QuotationUpdate,
    QuotationItemCreate,
    QuotationItemUpdate,
)
from auth import get_current_admin


router = APIRouter(
    prefix="/api/quotations",
    tags=["Quotations"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def quotation_response(quotation):
    return {
        "id": quotation.id,
        "event_id": quotation.event_id,
        "quotation_number": quotation.quotation_number,
        "total_amount": quotation.total_amount,
        "status": quotation.status,
        "valid_until": quotation.valid_until,
        "notes": quotation.notes,
        "created_at": quotation.created_at,
    }


def quotation_item_response(item):
    return {
        "id": item.id,
        "quotation_id": item.quotation_id,
        "service_name": item.service_name,
        "description": item.description,
        "quantity": item.quantity,
        "unit_price": item.unit_price,
        "amount": item.amount,
    }


def recalculate_total(quotation, db):
    items = (
        db.query(QuotationItem)
        .filter(QuotationItem.quotation_id == quotation.id)
        .all()
    )

    total = Decimal("0")

    for item in items:
        item.amount = (
            Decimal(str(item.quantity))
            * Decimal(str(item.unit_price))
        )
        total += item.amount

    quotation.total_amount = total

    return total


def generate_quotation_number(db):
    today = date.today().strftime("%Y%m%d")

    existing_count = (
        db.query(Quotation)
        .filter(
            Quotation.quotation_number.like(
                f"QUO-{today}-%"
            )
        )
        .count()
    )

    return f"QUO-{today}-{existing_count + 1:04d}"


# =========================================================
# CREATE QUOTATION
# =========================================================

@router.post("/")
def create_quotation(
    quotation_data: QuotationCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    event = (
        db.query(Event)
        .filter(Event.id == quotation_data.event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    quotation_number = generate_quotation_number(db)

    quotation = Quotation(
        event_id=quotation_data.event_id,
        quotation_number=quotation_number,
        total_amount=Decimal("0"),
        status="DRAFT",
        valid_until=quotation_data.valid_until,
        notes=(
            quotation_data.notes.strip()
            if quotation_data.notes
            else None
        ),
    )

    db.add(quotation)
    db.commit()
    db.refresh(quotation)

    return {
        "message": "Quotation created successfully",
        "quotation": quotation_response(quotation)
    }


# =========================================================
# GET ALL QUOTATIONS
# =========================================================

@router.get("/")
def get_quotations(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotations = (
        db.query(Quotation)
        .order_by(Quotation.created_at.desc())
        .all()
    )

    return [
        quotation_response(quotation)
        for quotation in quotations
    ]


# =========================================================
# GET QUOTATION BY ID
# =========================================================

@router.get("/{quotation_id}")
def get_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    items = (
        db.query(QuotationItem)
        .filter(QuotationItem.quotation_id == quotation.id)
        .all()
    )

    return {
        "id": quotation.id,
        "event_id": quotation.event_id,
        "quotation_number": quotation.quotation_number,
        "total_amount": quotation.total_amount,
        "status": quotation.status,
        "valid_until": quotation.valid_until,
        "notes": quotation.notes,
        "created_at": quotation.created_at,
        "items": [
            quotation_item_response(item)
            for item in items
        ]
    }


# =========================================================
# UPDATE QUOTATION
# =========================================================

@router.put("/{quotation_id}")
def update_quotation(
    quotation_id: int,
    quotation_data: QuotationUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    update_data = quotation_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    if "status" in update_data:
        quotation.status = update_data["status"]

    if "valid_until" in update_data:
        quotation.valid_until = update_data["valid_until"]

    if "notes" in update_data:
        quotation.notes = (
            update_data["notes"].strip()
            if update_data["notes"]
            else None
        )

    db.commit()
    db.refresh(quotation)

    return {
        "message": "Quotation updated successfully",
        "quotation": quotation_response(quotation)
    }


# =========================================================
# DELETE QUOTATION
# =========================================================

@router.delete("/{quotation_id}")
def delete_quotation(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    db.query(QuotationItem).filter(
        QuotationItem.quotation_id == quotation.id
    ).delete(
        synchronize_session=False
    )

    db.delete(quotation)
    db.commit()

    return {
        "message": "Quotation deleted successfully",
        "quotation_id": quotation_id
    }


# =========================================================
# CREATE QUOTATION ITEM
# =========================================================

@router.post("/{quotation_id}/items")
def create_quotation_item(
    quotation_id: int,
    item_data: QuotationItemCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    service_name = item_data.service_name.strip()

    if not service_name:
        raise HTTPException(
            status_code=400,
            detail="Service name is required"
        )

    if item_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    if item_data.unit_price < 0:
        raise HTTPException(
            status_code=400,
            detail="Unit price cannot be negative"
        )

    amount = (
        item_data.quantity
        * item_data.unit_price
    )

    item = QuotationItem(
        quotation_id=quotation.id,
        service_name=service_name,
        description=(
            item_data.description.strip()
            if item_data.description
            else None
        ),
        quantity=item_data.quantity,
        unit_price=item_data.unit_price,
        amount=amount,
    )

    db.add(item)
    db.flush()

    recalculate_total(quotation, db)

    db.commit()
    db.refresh(item)
    db.refresh(quotation)

    return {
        "message": "Quotation item created successfully",
        "item": quotation_item_response(item),
        "quotation_total": quotation.total_amount
    }


# =========================================================
# GET QUOTATION ITEMS
# =========================================================

@router.get("/{quotation_id}/items")
def get_quotation_items(
    quotation_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    items = (
        db.query(QuotationItem)
        .filter(QuotationItem.quotation_id == quotation_id)
        .all()
    )

    return {
        "quotation_id": quotation_id,
        "total_amount": quotation.total_amount,
        "items": [
            quotation_item_response(item)
            for item in items
        ]
    }


# =========================================================
# UPDATE QUOTATION ITEM
# =========================================================

@router.put("/{quotation_id}/items/{item_id}")
def update_quotation_item(
    quotation_id: int,
    item_id: int,
    item_data: QuotationItemUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    item = (
        db.query(QuotationItem)
        .filter(
            QuotationItem.id == item_id,
            QuotationItem.quotation_id == quotation_id
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation item not found"
        )

    update_data = item_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    if "service_name" in update_data:
        if update_data["service_name"] is None:
            raise HTTPException(
                status_code=400,
                detail="Service name cannot be null"
            )

        service_name = update_data["service_name"].strip()

        if not service_name:
            raise HTTPException(
                status_code=400,
                detail="Service name cannot be empty"
            )

        item.service_name = service_name

    if "description" in update_data:
        item.description = (
            update_data["description"].strip()
            if update_data["description"]
            else None
        )

    if "quantity" in update_data:
        if update_data["quantity"] is None:
            raise HTTPException(
                status_code=400,
                detail="Quantity cannot be null"
            )

        if update_data["quantity"] <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        item.quantity = update_data["quantity"]

    if "unit_price" in update_data:
        if update_data["unit_price"] is None:
            raise HTTPException(
                status_code=400,
                detail="Unit price cannot be null"
            )

        if update_data["unit_price"] < 0:
            raise HTTPException(
                status_code=400,
                detail="Unit price cannot be negative"
            )

        item.unit_price = update_data["unit_price"]

    item.amount = (
        Decimal(str(item.quantity))
        * Decimal(str(item.unit_price))
    )

    recalculate_total(quotation, db)

    db.commit()
    db.refresh(item)
    db.refresh(quotation)

    return {
        "message": "Quotation item updated successfully",
        "item": quotation_item_response(item),
        "quotation_total": quotation.total_amount
    }


# =========================================================
# DELETE QUOTATION ITEM
# =========================================================

@router.delete("/{quotation_id}/items/{item_id}")
def delete_quotation_item(
    quotation_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    quotation = (
        db.query(Quotation)
        .filter(Quotation.id == quotation_id)
        .first()
    )

    if quotation is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation not found"
        )

    item = (
        db.query(QuotationItem)
        .filter(
            QuotationItem.id == item_id,
            QuotationItem.quotation_id == quotation_id
        )
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Quotation item not found"
        )

    db.delete(item)
    db.flush()

    recalculate_total(quotation, db)

    db.commit()

    return {
        "message": "Quotation item deleted successfully",
        "item_id": item_id,
        "quotation_id": quotation_id,
        "quotation_total": quotation.total_amount
    }