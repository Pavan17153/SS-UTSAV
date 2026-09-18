from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Event, Customer
from schemas import EventCreate, EventUpdate
from auth import get_current_admin


router = APIRouter(
    prefix="/api/events",
    tags=["Events"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- CREATE EVENT ----------------

@router.post("/")
def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == event_data.customer_id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    if event_data.guest_count <= 0:
        raise HTTPException(
            status_code=400,
            detail="Guest count must be greater than 0"
        )

    if event_data.budget is not None and event_data.budget < 0:
        raise HTTPException(
            status_code=400,
            detail="Budget cannot be negative"
        )

    event = Event(
        customer_id=event_data.customer_id,
        event_type=event_data.event_type.strip(),
        event_date=event_data.event_date,
        location=event_data.location.strip(),
        venue=event_data.venue.strip() if event_data.venue else None,
        guest_count=event_data.guest_count,
        budget=event_data.budget,
        status=event_data.status.strip().upper(),
        notes=event_data.notes.strip() if event_data.notes else None,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "message": "Event created successfully",
        "event": {
            "id": event.id,
            "customer_id": event.customer_id,
            "event_type": event.event_type,
            "event_date": event.event_date,
            "location": event.location,
            "venue": event.venue,
            "guest_count": event.guest_count,
            "budget": event.budget,
            "status": event.status,
            "notes": event.notes,
            "created_at": event.created_at,
        }
    }

# ---------------- GET ALL EVENTS ----------------

@router.get("/")
def get_events(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    events = (
        db.query(Event)
        .order_by(Event.event_date.asc())
        .all()
    )

    return [
        {
            "id": event.id,
            "customer_id": event.customer_id,
            "event_type": event.event_type,
            "event_date": event.event_date,
            "location": event.location,
            "venue": event.venue,
            "guest_count": event.guest_count,
            "budget": event.budget,
            "status": event.status,
            "notes": event.notes,
            "created_at": event.created_at,
        }
        for event in events
    ]
# ---------------- GET EVENT BY ID ----------------

@router.get("/{event_id}")
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
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

    return {
        "id": event.id,
        "customer_id": event.customer_id,
        "event_type": event.event_type,
        "event_date": event.event_date,
        "location": event.location,
        "venue": event.venue,
        "guest_count": event.guest_count,
        "budget": event.budget,
        "status": event.status,
        "notes": event.notes,
        "created_at": event.created_at,
    }

# ---------------- UPDATE EVENT ----------------

@router.put("/{event_id}")
def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
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

    update_data = event_data.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields provided for update"
        )

    if "event_type" in update_data:
        if update_data["event_type"] is None:
            raise HTTPException(
                status_code=400,
                detail="Event type cannot be null"
            )

        update_data["event_type"] = update_data["event_type"].strip()

        if not update_data["event_type"]:
            raise HTTPException(
                status_code=400,
                detail="Event type cannot be empty"
            )

    if "location" in update_data:
        if update_data["location"] is None:
            raise HTTPException(
                status_code=400,
                detail="Location cannot be null"
            )

        update_data["location"] = update_data["location"].strip()

        if not update_data["location"]:
            raise HTTPException(
                status_code=400,
                detail="Location cannot be empty"
            )

    if "guest_count" in update_data:
        if update_data["guest_count"] is None:
            raise HTTPException(
                status_code=400,
                detail="Guest count cannot be null"
            )

        if update_data["guest_count"] <= 0:
            raise HTTPException(
                status_code=400,
                detail="Guest count must be greater than 0"
            )

    if "budget" in update_data:
        if update_data["budget"] is not None and update_data["budget"] < 0:
            raise HTTPException(
                status_code=400,
                detail="Budget cannot be negative"
            )

    if "venue" in update_data and update_data["venue"]:
        update_data["venue"] = update_data["venue"].strip()

    if "notes" in update_data and update_data["notes"]:
        update_data["notes"] = update_data["notes"].strip()

    if "status" in update_data:
        if update_data["status"] is None:
            raise HTTPException(
                status_code=400,
                detail="Status cannot be null"
            )

        update_data["status"] = update_data["status"].strip().upper()

    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return {
        "message": "Event updated successfully",
        "event": {
            "id": event.id,
            "customer_id": event.customer_id,
            "event_type": event.event_type,
            "event_date": event.event_date,
            "location": event.location,
            "venue": event.venue,
            "guest_count": event.guest_count,
            "budget": event.budget,
            "status": event.status,
            "notes": event.notes,
            "created_at": event.created_at,
        }
    }

# ---------------- DELETE EVENT ----------------

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
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

    # Prevent deletion if financial records are linked
    from models import Payment, Quotation

    existing_payment = (
        db.query(Payment)
        .filter(Payment.event_id == event_id)
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=409,
            detail="Event cannot be deleted because payments are linked to this event"
        )

    existing_quotation = (
        db.query(Quotation)
        .filter(Quotation.event_id == event_id)
        .first()
    )

    if existing_quotation:
        raise HTTPException(
            status_code=409,
            detail="Event cannot be deleted because quotations are linked to this event"
        )

    db.delete(event)
    db.commit()

    return {
        "message": "Event deleted successfully",
        "event_id": event_id
    }