from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal

from database import SessionLocal
from models import Payment, Event
from schemas import PaymentCreate, PaymentUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
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
# RESPONSE HELPER
# =========================================================

def payment_response(payment):
    return {
        "id": payment.id,
        "event_id": payment.event_id,
        "amount": payment.amount,
        "payment_date": payment.payment_date,
        "payment_method": payment.payment_method,
        "reference_number": payment.reference_number,
        "notes": payment.notes,
    }


# =========================================================
# GET PAYMENTS FOR AN EVENT
# IMPORTANT:
# This route must come BEFORE /{payment_id}
# =========================================================

@router.get("/event/{event_id}")
def get_event_payments(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    # -----------------------------------------------------
    # Check event
    # -----------------------------------------------------

    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # -----------------------------------------------------
    # Get payments
    # -----------------------------------------------------

    payments = (
        db.query(Payment)
        .filter(Payment.event_id == event_id)
        .order_by(Payment.payment_date.desc())
        .all()
    )

    # -----------------------------------------------------
    # Calculate total
    # -----------------------------------------------------

    total_paid = sum(
        (
            payment.amount
            if payment.amount is not None
            else Decimal("0")
        )
        for payment in payments
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "event_id": event_id,
        "total_paid": total_paid,
        "payment_count": len(payments),
        "payments": [
            payment_response(payment)
            for payment in payments
        ]
    }


# =========================================================
# CREATE PAYMENT
# =========================================================

@router.post("/")
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    # -----------------------------------------------------
    # Check event
    # -----------------------------------------------------

    event = (
        db.query(Event)
        .filter(Event.id == payment_data.event_id)
        .first()
    )

    if event is None:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # -----------------------------------------------------
    # Validate amount
    # -----------------------------------------------------

    if payment_data.amount is None:
        raise HTTPException(
            status_code=400,
            detail="Payment amount is required"
        )

    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than 0"
        )

    # -----------------------------------------------------
    # Create payment
    # -----------------------------------------------------

    payment = Payment(
        event_id=payment_data.event_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        reference_number=(
            payment_data.reference_number.strip()
            if payment_data.reference_number
            else None
        ),
        notes=(
            payment_data.notes.strip()
            if payment_data.notes
            else None
        ),
    )

    db.add(payment)

    db.commit()

    db.refresh(payment)

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return {
        "message": "Payment created successfully",
        "payment": payment_response(payment)
    }


# =========================================================
# GET ALL PAYMENTS
# =========================================================

@router.get("/")
def get_payments(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    payments = (
        db.query(Payment)
        .order_by(Payment.payment_date.desc())
        .all()
    )

    return [
        payment_response(payment)
        for payment in payments
    ]


# =========================================================
# GET PAYMENT BY ID
# =========================================================

@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment_response(payment)


# =========================================================
# UPDATE PAYMENT
# =========================================================

@router.put("/{payment_id}")
def update_payment(
    payment_id: int,
    payment_data: PaymentUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    # -----------------------------------------------------
    # Find payment
    # -----------------------------------------------------

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    # -----------------------------------------------------
    # Get only supplied fields
    # -----------------------------------------------------

    update_data = payment_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    # -----------------------------------------------------
    # EVENT
    # -----------------------------------------------------

    if "event_id" in update_data:

        if update_data["event_id"] is None:
            raise HTTPException(
                status_code=400,
                detail="Event ID cannot be null"
            )

        event = (
            db.query(Event)
            .filter(Event.id == update_data["event_id"])
            .first()
        )

        if event is None:
            raise HTTPException(
                status_code=404,
                detail="Event not found"
            )

        payment.event_id = update_data["event_id"]

    # -----------------------------------------------------
    # AMOUNT
    # -----------------------------------------------------

    if "amount" in update_data:

        if update_data["amount"] is None:
            raise HTTPException(
                status_code=400,
                detail="Payment amount cannot be null"
            )

        if update_data["amount"] <= 0:
            raise HTTPException(
                status_code=400,
                detail="Payment amount must be greater than 0"
            )

        payment.amount = update_data["amount"]

    # -----------------------------------------------------
    # PAYMENT METHOD
    # -----------------------------------------------------

    if "payment_method" in update_data:

        if update_data["payment_method"] is None:
            raise HTTPException(
                status_code=400,
                detail="Payment method cannot be null"
            )

        payment.payment_method = update_data["payment_method"]

    # -----------------------------------------------------
    # REFERENCE NUMBER
    # -----------------------------------------------------

    if "reference_number" in update_data:

        payment.reference_number = (
            update_data["reference_number"].strip()
            if update_data["reference_number"]
            else None
        )

    # -----------------------------------------------------
    # NOTES
    # -----------------------------------------------------

    if "notes" in update_data:

        payment.notes = (
            update_data["notes"].strip()
            if update_data["notes"]
            else None
        )

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    db.commit()

    db.refresh(payment)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": "Payment updated successfully",
        "payment": payment_response(payment)
    }


# =========================================================
# DELETE PAYMENT
# =========================================================

@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):

    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    db.delete(payment)

    db.commit()

    return {
        "message": "Payment deleted successfully",
        "payment_id": payment_id
    }