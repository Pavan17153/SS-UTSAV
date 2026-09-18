from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Customer, Event, Lead
from schemas import CustomerCreate, CustomerUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"]
)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# HELPER
# ============================================================

def customer_response(customer: Customer):
    """
    Convert Customer model into API response.
    """

    return {
        "id": customer.id,
        "lead_id": customer.lead_id,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "email": customer.email,
        "address": customer.address,
        "notes": customer.notes,
        "created_at": customer.created_at,
    }


# ============================================================
# GET ALL CUSTOMERS
# ============================================================

@router.get("/")
def get_customers(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Admin-only endpoint.

    Returns all customers.
    """

    customers = (
        db.query(Customer)
        .order_by(Customer.created_at.desc())
        .all()
    )

    return [
        customer_response(customer)
        for customer in customers
    ]


# ============================================================
# CREATE CUSTOMER
# ============================================================

@router.post("/")
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Admin-only endpoint.

    Creates a customer manually.

    Manually created customers have:
        lead_id = None

    Customers created through Lead conversion are created
    from the /api/leads/{lead_id}/convert endpoint.
    """

    # --------------------------------------------------------
    # CLEAN REQUIRED FIELDS
    # --------------------------------------------------------

    full_name = (
        customer_data.full_name.strip()
        if customer_data.full_name
        else ""
    )

    phone = (
        customer_data.phone.strip()
        if customer_data.phone
        else ""
    )

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client name is required"
        )

    # --------------------------------------------------------
    # VALIDATE PHONE
    # --------------------------------------------------------

    if not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is required"
        )

    # --------------------------------------------------------
    # CLEAN OPTIONAL FIELDS
    # --------------------------------------------------------

    email = (
        customer_data.email.strip()
        if customer_data.email
        else None
    )

    address = (
        customer_data.address.strip()
        if customer_data.address
        else None
    )

    notes = (
        customer_data.notes.strip()
        if customer_data.notes
        else None
    )

    # --------------------------------------------------------
    # CREATE CUSTOMER
    # --------------------------------------------------------

    customer = Customer(
        lead_id=None,
        full_name=full_name,
        phone=phone,
        email=email,
        address=address,
        notes=notes,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Client created successfully",
        "customer": customer_response(customer)
    }


# ============================================================
# GET CUSTOMER BY ID
# ============================================================

@router.get("/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Admin-only endpoint.

    Returns one customer.
    """

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    return customer_response(customer)


# ============================================================
# UPDATE CUSTOMER
# ============================================================

@router.put("/{customer_id}")
def update_customer(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Admin-only endpoint.

    Partially updates an existing customer.

    Important:
        Customer lead_id is NOT editable from this endpoint.

    Lead relationship is controlled by:
        Lead conversion
        Customer deletion/restoration
    """

    # --------------------------------------------------------
    # FIND CUSTOMER
    # --------------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # --------------------------------------------------------
    # GET ONLY PROVIDED FIELDS
    # --------------------------------------------------------

    update_data = customer_data.model_dump(
        exclude_unset=True
    )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if "full_name" in update_data:

        if update_data["full_name"] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client name cannot be null"
            )

        update_data["full_name"] = (
            update_data["full_name"].strip()
        )

        if not update_data["full_name"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client name cannot be empty"
            )

    # --------------------------------------------------------
    # VALIDATE PHONE
    # --------------------------------------------------------

    if "phone" in update_data:

        if update_data["phone"] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number cannot be null"
            )

        update_data["phone"] = (
            update_data["phone"].strip()
        )

        if not update_data["phone"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number cannot be empty"
            )

    # --------------------------------------------------------
    # CLEAN EMAIL
    # --------------------------------------------------------

    if "email" in update_data:

        update_data["email"] = (
            update_data["email"].strip()
            if update_data["email"]
            else None
        )

    # --------------------------------------------------------
    # CLEAN ADDRESS
    # --------------------------------------------------------

    if "address" in update_data:

        update_data["address"] = (
            update_data["address"].strip()
            if update_data["address"]
            else None
        )

    # --------------------------------------------------------
    # CLEAN NOTES
    # --------------------------------------------------------

    if "notes" in update_data:

        update_data["notes"] = (
            update_data["notes"].strip()
            if update_data["notes"]
            else None
        )

    # --------------------------------------------------------
    # PREVENT LEAD RELATIONSHIP MODIFICATION
    # --------------------------------------------------------

    if "lead_id" in update_data:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Customer lead relationship cannot be "
                "changed manually."
            )
        )

    # --------------------------------------------------------
    # APPLY UPDATE
    # --------------------------------------------------------

    for field, value in update_data.items():

        setattr(
            customer,
            field,
            value
        )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()
    db.refresh(customer)

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Client updated successfully",
        "customer": customer_response(customer)
    }


# ============================================================
# DELETE CUSTOMER
# ============================================================

@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    """
    Admin-only endpoint.

    Deletes a customer.

    Rules:

    1. Customer does not exist
       -> 404

    2. Customer has events
       -> 409
       -> Customer is NOT deleted
       -> Lead is NOT changed

    3. Customer came from a Lead
       -> Customer deleted
       -> Linked Lead restored to NEW

    4. Customer was manually created
       -> Customer deleted
       -> No Lead exists to restore
    """

    # --------------------------------------------------------
    # FIND CUSTOMER
    # --------------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found"
        )

    # --------------------------------------------------------
    # CHECK LINKED EVENTS
    # --------------------------------------------------------

    existing_event = (
        db.query(Event)
        .filter(
            Event.customer_id == customer_id
        )
        .first()
    )

    if existing_event:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Client cannot be deleted because "
                "events are linked to this client"
            )
        )

    # --------------------------------------------------------
    # REMEMBER LINKED LEAD
    # --------------------------------------------------------

    restored_lead_id = None

    if customer.lead_id is not None:

        lead = (
            db.query(Lead)
            .filter(
                Lead.id == customer.lead_id
            )
            .first()
        )

        if lead:

            # Restore the Lead so it can be processed again.
            lead.status = "NEW"

            restored_lead_id = lead.id

    # --------------------------------------------------------
    # DELETE CUSTOMER
    # --------------------------------------------------------

    db.delete(customer)

    # --------------------------------------------------------
    # SAVE BOTH OPERATIONS
    # --------------------------------------------------------

    db.commit()

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Client deleted successfully",
        "customer_id": customer_id,
        "lead_restored": restored_lead_id is not None,
        "restored_lead_id": restored_lead_id,
    }