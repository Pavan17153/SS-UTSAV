from datetime import date,datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Literal
from typing import Optional


class LeadCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None
    event_type: str = Field(min_length=2, max_length=100)
    event_date: date
    location: str = Field(min_length=2, max_length=255)
    guest_count: int = Field(gt=0)
    budget_range: str | None = None
    services: str | None = None
    message: str | None = None
class LeadUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    location: Optional[str] = None
    guest_count: Optional[int] = None
    budget_range: Optional[str] = None
    services: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: str


class LeadResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    event_type: str
    event_date: date
    location: str
    guest_count: int
    budget_range: Optional[str] = None
    services: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerCreate(BaseModel):
    full_name: str
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    notes: str | None = None
class CustomerUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    notes: str | None = None

class EventCreate(BaseModel):
    customer_id: int
    event_type: str
    event_date: date
    location: str
    venue: str | None = None
    guest_count: int
    budget: Decimal | None = None
    status: Literal[
        "PLANNING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
    ] = "PLANNING"
    notes: str | None = None


class EventUpdate(BaseModel):
    event_type: str | None = None
    event_date: date | None = None
    location: str | None = None
    venue: str | None = None
    guest_count: int | None = None
    budget: Decimal | None = None
    status: Literal[
        "PLANNING",
        "CONFIRMED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
    ] | None = None
    notes: str | None = None

# ---------------- QUOTATION SCHEMAS ----------------

class QuotationCreate(BaseModel):
    event_id: int
    valid_until: date | None = None
    notes: str | None = None


class QuotationUpdate(BaseModel):
    valid_until: date | None = None
    status: Literal[
        "DRAFT",
        "SENT",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED"
    ] | None = None
    notes: str | None = None


class QuotationItemCreate(BaseModel):
    service_name: str
    description: str | None = None
    quantity: Decimal = Decimal("1")
    unit_price: Decimal


class QuotationItemUpdate(BaseModel):
    service_name: str | None = None
    description: str | None = None
    quantity: Decimal | None = None
    unit_price: Decimal | None = None

# ---------------- PAYMENT SCHEMAS ----------------

class PaymentCreate(BaseModel):
    event_id: int
    amount: Decimal
    payment_method: Literal[
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "CHEQUE",
        "OTHER"
    ]
    reference_number: str | None = None
    notes: str | None = None


class PaymentUpdate(BaseModel):
    amount: Decimal | None = None
    payment_method: Literal[
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "CHEQUE",
        "OTHER"
    ] | None = None
    reference_number: str | None = None
    notes: str | None = None
# ---------------- VENDOR SCHEMAS ----------------

class VendorCreate(BaseModel):
    name: str
    category: str
    contact_person: str | None = None
    phone: str
    email: EmailStr | None = None
    address: str | None = None
    service_description: str | None = None
    pricing: Decimal | None = None
    is_available: bool = True
    is_active: bool = True


class VendorUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    contact_person: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    service_description: str | None = None
    pricing: Decimal | None = None
    is_available: bool | None = None
    is_active: bool | None = None


# ---------------- PACKAGE SCHEMAS ----------------

class PackageCreate(BaseModel):
    name: str
    description: str | None = None
    starting_price: Decimal | None = None
    services: str | None = None
    image_url: str | None = None
    is_active: bool = True


class PackageUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    starting_price: Decimal | None = None
    services: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
# ---------------- TESTIMONIAL SCHEMAS ----------------

class TestimonialCreate(BaseModel):
    customer_name: str
    event_type: Optional[str] = None
    review: str
    image_url: Optional[str] = None

    rating: int = Field(
        default=5,
        ge=1,
        le=5
    )

    is_active: bool = True


class TestimonialUpdate(BaseModel):
    customer_name: Optional[str] = None
    event_type: Optional[str] = None
    review: Optional[str] = None
    image_url: Optional[str] = None

    rating: Optional[int] = Field(
        default=None,
        ge=1,
        le=5
    )

    is_active: Optional[bool] = None
# ---------------- SETTINGS SCHEMAS ----------------

class SettingsCreate(BaseModel):
    company_name: str = "SS UTSAV"
    tagline: str | None = "We Plan. You Celebrate."
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    whatsapp_number: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    facebook_url: str | None = None
    description: str | None = None
    logo_url: str | None = None
    is_active: bool = True
    twitter_x_url: Optional[str] = None


class SettingsUpdate(BaseModel):
    company_name: str | None = None
    tagline: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    whatsapp_number: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    facebook_url: str | None = None
    description: str | None = None
    logo_url: str | None = None
    is_active: bool | None = None
    twitter_x_url: Optional[str] = None

class SiteSettingCreate(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=150)
    tagline: Optional[str] = None

    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    business_description: Optional[str] = None

    website_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

    is_active: bool = True


class SiteSettingUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=150)
    tagline: Optional[str] = None

    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    business_description: Optional[str] = None

    website_url: Optional[str] = None
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

    is_active: Optional[bool] = None


class SiteSettingResponse(BaseModel):
    id: int

    company_name: str
    tagline: Optional[str]

    phone: Optional[str]
    whatsapp_number: Optional[str]
    email: Optional[str]

    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]

    business_description: Optional[str]

    website_url: Optional[str]
    instagram_url: Optional[str]
    facebook_url: Optional[str]
    youtube_url: Optional[str]
    linkedin_url: Optional[str]

    logo_url: Optional[str]
    favicon_url: Optional[str]

    primary_color: Optional[str]
    secondary_color: Optional[str]

    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class PublicSiteSettingResponse(BaseModel):
    company_name: str
    tagline: Optional[str]

    phone: Optional[str]
    whatsapp_number: Optional[str]
    email: Optional[str]

    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]

    business_description: Optional[str]

    website_url: Optional[str]
    instagram_url: Optional[str]
    facebook_url: Optional[str]
    youtube_url: Optional[str]
    linkedin_url: Optional[str]

    logo_url: Optional[str]
    favicon_url: Optional[str]

    primary_color: Optional[str]
    secondary_color: Optional[str]
class GalleryCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    image_url: str
    is_active: bool = True


class GalleryUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class GalleryResponse(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = None
    image_url: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
class LegalDocumentCreate(BaseModel):
    document_type: str
    title: str
    content: str = ""
    source_type: str = "TEXT"
    source_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class LegalDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    source_type: Optional[str] = None
    source_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class LegalDocumentResponse(BaseModel):
    id: int
    document_type: str
    title: str
    content: str
    source_type: str
    source_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    is_published: bool
    version: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True