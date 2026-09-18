from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_admin, get_db
from models import Lead, Customer
from schemas import (
    LeadCreate,
    LeadUpdate,
    LeadStatusUpdate,
    LeadResponse,
)


router = APIRouter(
    prefix="/api/leads",
    tags=["Leads"],
)


# ============================================================
# CONSTANTS
# ============================================================

VALID_STATUSES = {
    "NEW",
    "CONTACTED",
    "REQUIREMENT_COLLECTED",
    "PROPOSAL_SENT",
    "FOLLOW_UP",
    "CONVERTED",
    "LOST",
}


# ============================================================
# HELPERS
# ============================================================

def clean_optional(value):
    """
    Convert empty strings to None and strip whitespace.
    """

    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()

        if value == "":
            return None

    return value


def validate_lead_data(
    full_name: str,
    phone: str,
    event_type: str,
    location: str,
    guest_count: int,
):
    """
    Validate required lead fields.
    """

    if not full_name or not full_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )

    if not phone or not phone.strip():
        raise HTTPException(
            status_code=400,
            detail="Phone number is required.",
        )

    if not event_type or not event_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Event type is required.",
        )

    if not location or not location.strip():
        raise HTTPException(
            status_code=400,
            detail="Location is required.",
        )

    if guest_count <= 0:
        raise HTTPException(
            status_code=400,
            detail="Guest count must be greater than 0.",
        )


# ============================================================
# CREATE LEAD
# ============================================================

@router.post(
    "/",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
):
    """
    Public endpoint.

    Creates a new lead from the SS UTSAV enquiry form.
    """

    full_name = lead_data.full_name.strip()
    phone = lead_data.phone.strip()
    event_type = lead_data.event_type.strip()
    location = lead_data.location.strip()

    validate_lead_data(
        full_name=full_name,
        phone=phone,
        event_type=event_type,
        location=location,
        guest_count=lead_data.guest_count,
    )

    lead = Lead(
        full_name=full_name,
        phone=phone,
        email=clean_optional(lead_data.email),
        event_type=event_type,
        event_date=lead_data.event_date,
        location=location,
        guest_count=lead_data.guest_count,
        budget_range=clean_optional(
            lead_data.budget_range
        ),
        services=clean_optional(
            lead_data.services
        ),
        message=clean_optional(
            lead_data.message
        ),
        status="NEW",
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return lead


# ============================================================
# GET ALL LEADS
# ============================================================

@router.get(
    "/",
    response_model=List[LeadResponse],
)
def get_leads(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Returns all leads.
    """

    leads = (
        db.query(Lead)
        .order_by(Lead.created_at.desc())
        .all()
    )

    return leads


# ============================================================
# GET SINGLE LEAD
# ============================================================

@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Returns one lead.
    """

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found.",
        )

    return lead


# ============================================================
# UPDATE LEAD
# ============================================================

@router.put(
    "/{lead_id}",
    response_model=LeadResponse,
)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Partially updates an existing lead.

    If the lead is already converted:
        Lead basic information is synchronized
        with the linked Customer.
    """

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found.",
        )

    update_data = lead_data.model_dump(
        exclude_unset=True
    )

    # --------------------------------------------------------
    # CHECK EMPTY UPDATE
    # --------------------------------------------------------

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields were provided for update.",
        )

    # --------------------------------------------------------
    # STRING CLEANING
    # --------------------------------------------------------

    string_fields = [
        "full_name",
        "phone",
        "email",
        "event_type",
        "location",
        "budget_range",
        "services",
        "message",
        "status",
    ]

    for field in string_fields:
        if field in update_data:
            update_data[field] = clean_optional(
                update_data[field]
            )

    # --------------------------------------------------------
    # REQUIRED FIELD VALIDATION
    # --------------------------------------------------------

    full_name = update_data.get(
        "full_name",
        lead.full_name,
    )

    phone = update_data.get(
        "phone",
        lead.phone,
    )

    event_type = update_data.get(
        "event_type",
        lead.event_type,
    )

    location = update_data.get(
        "location",
        lead.location,
    )

    guest_count = update_data.get(
        "guest_count",
        lead.guest_count,
    )

    validate_lead_data(
        full_name=full_name,
        phone=phone,
        event_type=event_type,
        location=location,
        guest_count=guest_count,
    )

    # --------------------------------------------------------
    # STATUS VALIDATION
    # --------------------------------------------------------

    if "status" in update_data:

        new_status = update_data["status"]

        if new_status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid lead status. "
                    "Allowed statuses: "
                    + ", ".join(
                        sorted(VALID_STATUSES)
                    )
                ),
            )

        # ----------------------------------------------------
        # CONVERTED STATUS MUST ONLY BE SET BY /convert
        # ----------------------------------------------------

        if new_status == "CONVERTED":
            raise HTTPException(
                status_code=400,
                detail=(
                    "A lead cannot be manually changed "
                    "to CONVERTED. "
                    "Use the Convert Lead action."
                ),
            )

    # --------------------------------------------------------
    # APPLY UPDATE
    # --------------------------------------------------------

    for field, value in update_data.items():
        setattr(
            lead,
            field,
            value,
        )

    # --------------------------------------------------------
    # SYNC LINKED CUSTOMER
    # --------------------------------------------------------
    #
    # Editing a normal lead does NOT create a customer.
    #
    # If the lead is already converted, a Customer should
    # already exist with Customer.lead_id = Lead.id.
    #
    # We synchronize only the basic customer information:
    #   full_name
    #   phone
    #   email
    #
    # Other Customer fields such as address and notes
    # remain managed from the Clients page.
    # --------------------------------------------------------

    if lead.status == "CONVERTED":

        linked_customer = (
            db.query(Customer)
            .filter(
                Customer.lead_id == lead.id
            )
            .first()
        )

        if linked_customer:

            linked_customer.full_name = (
                lead.full_name
            )

            linked_customer.phone = (
                lead.phone
            )

            linked_customer.email = (
                lead.email
            )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    db.commit()
    db.refresh(lead)

    return lead


# ============================================================
# UPDATE LEAD STATUS
# ============================================================

@router.put(
    "/{lead_id}/status",
    response_model=LeadResponse,
)
def update_lead_status(
    lead_id: int,
    status_data: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Updates only the lead status.

    CONVERTED cannot be manually selected here.
    Use /convert instead.
    """

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found.",
        )

    new_status = (
        status_data.status.strip().upper()
    )

    # --------------------------------------------------------
    # VALIDATE STATUS
    # --------------------------------------------------------

    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid lead status. "
                "Allowed statuses: "
                + ", ".join(
                    sorted(VALID_STATUSES)
                )
            ),
        )

    # --------------------------------------------------------
    # CONVERTED STATUS MUST ONLY BE SET BY /convert
    # --------------------------------------------------------

    if new_status == "CONVERTED":
        raise HTTPException(
            status_code=400,
            detail=(
                "A lead cannot be manually changed "
                "to CONVERTED. "
                "Use the Convert Lead action."
            ),
        )

    # --------------------------------------------------------
    # UPDATE STATUS
    # --------------------------------------------------------

    lead.status = new_status

    db.commit()
    db.refresh(lead)

    return lead


# ============================================================
# DELETE LEAD
# ============================================================

@router.delete(
    "/{lead_id}",
)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Permanently deletes a lead.

    A converted lead cannot be deleted from the Leads page.
    The Customer must be deleted first.
    """

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found.",
        )

    # --------------------------------------------------------
    # CHECK IF LEAD WAS CONVERTED
    # --------------------------------------------------------

    customer = (
        db.query(Customer)
        .filter(
            Customer.lead_id == lead_id
        )
        .first()
    )

    if customer is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "This lead has already been converted "
                "to a customer and cannot be deleted."
            ),
        )

    # --------------------------------------------------------
    # DELETE LEAD
    # --------------------------------------------------------

    db.delete(lead)
    db.commit()

    return {
        "message": "Lead deleted successfully.",
        "lead_id": lead_id,
    }


# ============================================================
# CONVERT LEAD TO CUSTOMER
# ============================================================

@router.post(
    "/{lead_id}/convert",
)
def convert_lead_to_customer(
    lead_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint.

    Converts a lead into a customer.

    Flow:

        Lead
          |
          | Convert
          v
        Customer
          |
          +-- Customer.lead_id = Lead.id
          |
          +-- Lead.status = CONVERTED
    """

    # --------------------------------------------------------
    # FIND LEAD
    # --------------------------------------------------------

    lead = (
        db.query(Lead)
        .filter(Lead.id == lead_id)
        .first()
    )

    if lead is None:
        raise HTTPException(
            status_code=404,
            detail="Lead not found.",
        )

    # --------------------------------------------------------
    # PREVENT DUPLICATE CONVERSION
    # --------------------------------------------------------

    existing_customer = (
        db.query(Customer)
        .filter(
            Customer.lead_id == lead.id
        )
        .first()
    )

    if existing_customer is not None:
        raise HTTPException(
            status_code=409,
            detail=(
                "This lead has already been "
                "converted to a customer."
            ),
        )

    # --------------------------------------------------------
    # CREATE CUSTOMER
    # --------------------------------------------------------

    customer = Customer(
        lead_id=lead.id,
        full_name=lead.full_name,
        phone=lead.phone,
        email=lead.email,
    )

    db.add(customer)

    # --------------------------------------------------------
    # UPDATE LEAD STATUS
    # --------------------------------------------------------

    lead.status = "CONVERTED"

    # --------------------------------------------------------
    # SAVE BOTH
    # --------------------------------------------------------

    db.commit()

    # --------------------------------------------------------
    # REFRESH BOTH OBJECTS
    # --------------------------------------------------------

    db.refresh(customer)
    db.refresh(lead)

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "message": "Lead converted successfully.",
        "lead_id": lead.id,
        "customer_id": customer.id,
        "lead": lead,
        "customer": customer,
    }