from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import SessionLocal
from models import (
    Lead,
    Customer,
    Event,
    Quotation,
    Payment,
    Vendor,
    Gallery,
    Package,
    Testimonial,
)
from auth import get_current_admin


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    # =====================================================
    # LEADS
    # =====================================================

    total_leads = db.query(Lead).count()

    new_leads = (
        db.query(Lead)
        .filter(Lead.status == "NEW")
        .count()
    )

    converted_leads = (
        db.query(Lead)
        .filter(Lead.status == "CONVERTED")
        .count()
    )

    # =====================================================
    # CUSTOMERS
    # =====================================================

    total_customers = db.query(Customer).count()

    # =====================================================
    # EVENTS
    # =====================================================

    total_events = db.query(Event).count()

    upcoming_events = (
        db.query(Event)
        .filter(
            Event.event_date >= date.today(),
            Event.status.notin_(["COMPLETED", "CANCELLED"])
        )
        .count()
    )

    planning_events = (
        db.query(Event)
        .filter(Event.status == "PLANNING")
        .count()
    )

    confirmed_events = (
        db.query(Event)
        .filter(Event.status == "CONFIRMED")
        .count()
    )

    in_progress_events = (
        db.query(Event)
        .filter(Event.status == "IN_PROGRESS")
        .count()
    )

    completed_events = (
        db.query(Event)
        .filter(Event.status == "COMPLETED")
        .count()
    )

    cancelled_events = (
        db.query(Event)
        .filter(Event.status == "CANCELLED")
        .count()
    )

    # =====================================================
    # QUOTATIONS
    # =====================================================

    total_quotations = db.query(Quotation).count()

    draft_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == "DRAFT")
        .count()
    )

    sent_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == "SENT")
        .count()
    )

    accepted_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == "ACCEPTED")
        .count()
    )

    rejected_quotations = (
        db.query(Quotation)
        .filter(Quotation.status == "REJECTED")
        .count()
    )

    total_quotation_value = (
        db.query(
            func.coalesce(
                func.sum(Quotation.total_amount),
                0
            )
        )
        .scalar()
    )

    # =====================================================
    # PAYMENTS
    # =====================================================

    total_payments_received = (
        db.query(
            func.coalesce(
                func.sum(Payment.amount),
                0
            )
        )
        .scalar()
    )

    # =====================================================
    # VENDORS
    # =====================================================

    total_vendors = db.query(Vendor).count()

    active_vendors = (
        db.query(Vendor)
        .filter(Vendor.is_active == True)
        .count()
    )

    available_vendors = (
        db.query(Vendor)
        .filter(
            Vendor.is_active == True,
            Vendor.is_available == True
        )
        .count()
    )

    # =====================================================
    # WEBSITE CONTENT
    # =====================================================

    active_gallery_items = (
        db.query(Gallery)
        .filter(Gallery.is_active == True)
        .count()
    )

    active_packages = (
        db.query(Package)
        .filter(Package.is_active == True)
        .count()
    )

    active_testimonials = (
        db.query(Testimonial)
        .filter(Testimonial.is_active == True)
        .count()
    )

    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "leads": {
            "total": total_leads,
            "new": new_leads,
            "converted": converted_leads,
        },

        "customers": {
            "total": total_customers,
        },

        "events": {
            "total": total_events,
            "upcoming": upcoming_events,
            "planning": planning_events,
            "confirmed": confirmed_events,
            "in_progress": in_progress_events,
            "completed": completed_events,
            "cancelled": cancelled_events,
        },

        "quotations": {
            "total": total_quotations,
            "draft": draft_quotations,
            "sent": sent_quotations,
            "accepted": accepted_quotations,
            "rejected": rejected_quotations,
            "total_value": total_quotation_value,
        },

        "payments": {
            "total_received": total_payments_received,
        },

        "vendors": {
            "total": total_vendors,
            "active": active_vendors,
            "available": available_vendors,
        },

        "content": {
            "active_gallery": active_gallery_items,
            "active_packages": active_packages,
            "active_testimonials": active_testimonials,
        },
    }