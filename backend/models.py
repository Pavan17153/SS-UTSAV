from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Date,
    Text,
    Numeric,
    ForeignKey
)
from sqlalchemy.sql import func

from database import Base

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="admin")
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(150))
    event_type = Column(String(100), nullable=False)
    event_date = Column(Date, nullable=False)
    location = Column(String(255), nullable=False)
    guest_count = Column(Integer, nullable=False)
    budget_range = Column(String(100))
    services = Column(Text)
    message = Column(Text)
    status = Column(String(50), nullable=False, default="NEW", index=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="SET NULL"))
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(150))
    address = Column(String(255))
    notes = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    event_type = Column(String(100), nullable=False)
    event_date = Column(Date, nullable=False, index=True)
    location = Column(String(255), nullable=False)
    venue = Column(String(255))
    guest_count = Column(Integer, nullable=False)
    budget = Column(Numeric(12, 2))
    status = Column(String(50), nullable=False, default="PLANNING")
    notes = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    quotation_number = Column(String(50), unique=True, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="DRAFT")
    valid_until = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(
        Integer,
        ForeignKey("quotations.id", ondelete="CASCADE"),
        nullable=False
    )
    service_name = Column(String(150), nullable=False)
    description = Column(Text)
    quantity = Column(Numeric(10, 2), nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(DateTime, nullable=False, server_default=func.now())
    payment_method = Column(String(50), nullable=False)
    reference_number = Column(String(100))
    notes = Column(Text)

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    starting_price = Column(Numeric(12, 2))
    services = Column(Text)
    image_url = Column(String(500))
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(
        String(100),
        nullable=False
    )

    event_type = Column(
        String(100)
    )

    review = Column(
        Text,
        nullable=False
    )

    image_url = Column(
        String(500)
    )

    rating = Column(
        Integer,
        nullable=False,
        default=5
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    contact_person = Column(String(100))
    phone = Column(String(20), nullable=False, index=True)
    email = Column(String(150))
    address = Column(String(255))
    service_description = Column(Text)
    pricing = Column(Numeric(12, 2))
    is_available = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
class Gallery(Base):
    __tablename__ = "gallery"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    image_url = Column(String(500), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150), nullable=False, default="SS UTSAV")
    tagline = Column(String(255), default="We Plan. You Celebrate.")
    phone = Column(String(20))
    email = Column(String(150))
    address = Column(String(255))
    whatsapp_number = Column(String(20))
    website_url = Column(String(500))
    instagram_url = Column(String(500))
    facebook_url = Column(String(500))
    description = Column(Text)
    twitter_x_url = Column(String(500))
    logo_url = Column(String(500))
    is_active = Column(Boolean, nullable=False, default=True)
    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )
class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(Integer, primary_key=True, index=True)

    document_type = Column(
        String(50),
        nullable=False,
        unique=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    is_published = Column(
        Boolean,
        nullable=False,
        default=False
    )

    version = Column(
        Integer,
        nullable=False,
        default=1
    )

    created_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    published_at = Column(
        DateTime,
        nullable=True
    )
    source_type = Column(String(20), nullable=False, default="TEXT")
    source_url = Column(String(1000), nullable=True)
    file_url = Column(String(1000), nullable=True)
    file_name = Column(String(255), nullable=True)