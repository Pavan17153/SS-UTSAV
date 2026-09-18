from datetime import datetime
import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    status,
)
from sqlalchemy.orm import Session

from database import get_db
from models import LegalDocument
from schemas import (
    LegalDocumentCreate,
    LegalDocumentUpdate,
    LegalDocumentResponse,
)
from auth import get_current_admin


router = APIRouter(
    prefix="/api/legal",
    tags=["Legal Documents"],
)


# =========================================================
# CONSTANTS
# =========================================================

VALID_DOCUMENT_TYPES = {
    "PRIVACY_POLICY",
    "TERMS_AND_CONDITIONS",
}

VALID_SOURCE_TYPES = {
    "TEXT",
    "FILE",
    "URL",
}

ALLOWED_FILE_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

UPLOAD_DIRECTORY = "uploads/legal"


# Make sure upload directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)


# =========================================================
# VALIDATE DOCUMENT TYPE
# =========================================================

def validate_document_type(document_type: str) -> str:
    document_type = document_type.strip().upper()

    if document_type not in VALID_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "document_type must be "
                "PRIVACY_POLICY or TERMS_AND_CONDITIONS"
            ),
        )

    return document_type


# =========================================================
# VALIDATE SOURCE TYPE
# =========================================================

def validate_source_type(source_type: str) -> str:
    source_type = source_type.strip().upper()

    if source_type not in VALID_SOURCE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="source_type must be TEXT, FILE, or URL.",
        )

    return source_type


# =========================================================
# VALIDATE SOURCE DATA
# =========================================================

def validate_source_data(
    source_type: str,
    content: str | None = None,
    source_url: str | None = None,
    file_url: str | None = None,
):
    """
    Validate the data depending on the selected source type.
    """

    source_type = validate_source_type(source_type)

    if source_type == "TEXT":

        if not content or not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Content is required when "
                    "source_type is TEXT."
                ),
            )

    elif source_type == "URL":

        if not source_url or not source_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "source_url is required when "
                    "source_type is URL."
                ),
            )

        source_url = source_url.strip()

        if not (
            source_url.startswith("http://")
            or source_url.startswith("https://")
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "source_url must start with "
                    "http:// or https://."
                ),
            )

    elif source_type == "FILE":

        if not file_url or not file_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "file_url is required when "
                    "source_type is FILE."
                ),
            )


# =========================================================
# RESPONSE FORMAT
# =========================================================

def legal_response(document: LegalDocument):
    return {
        "id": document.id,
        "document_type": document.document_type,
        "title": document.title,
        "content": document.content,

        "source_type": document.source_type,
        "source_url": document.source_url,
        "file_url": document.file_url,
        "file_name": document.file_name,

        "is_published": document.is_published,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "published_at": document.published_at,
    }


# =========================================================
# GET ALL LEGAL DOCUMENTS
# =========================================================

@router.get(
    "/",
    response_model=list[LegalDocumentResponse],
)
def get_legal_documents(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    return (
        db.query(LegalDocument)
        .order_by(LegalDocument.id.asc())
        .all()
    )


# =========================================================
# GET ONE LEGAL DOCUMENT
# =========================================================

@router.get(
    "/{document_type}",
    response_model=LegalDocumentResponse,
)
def get_legal_document(
    document_type: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(document_type)

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal document not found.",
        )

    return legal_response(document)


# =========================================================
# UPLOAD LEGAL FILE
# =========================================================

@router.post(
    "/upload",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
async def upload_legal_file(
    file: UploadFile = File(...),
    current_admin=Depends(get_current_admin),
):
    """
    Upload a legal document file.

    Supported:
    - PDF
    - DOC
    - DOCX
    - TXT

    Maximum size:
    - 10 MB
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required.",
        )

    original_filename = file.filename.strip()

    extension = os.path.splitext(
        original_filename
    )[1].lower()

    if extension not in ALLOWED_FILE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported file type. Allowed files: "
                "PDF, DOC, DOCX, TXT."
            ),
        )

    # Read file
    file_content = await file.read()

    # Check size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size cannot exceed 10 MB.",
        )

    # Generate unique filename
    unique_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIRECTORY,
        unique_filename,
    )

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save legal document file.",
        )

    file_url = (
        f"/uploads/legal/{unique_filename}"
    )

    return {
        "message": "Legal document file uploaded successfully.",
        "file_url": file_url,
        "file_name": original_filename,
    }


# =========================================================
# CREATE LEGAL DOCUMENT
# =========================================================

@router.post(
    "/",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
)
def create_legal_document(
    data: LegalDocumentCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(
        data.document_type
    )

    title = data.title.strip()

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty.",
        )

    source_type = validate_source_type(
        data.source_type
    )

    content = (
        data.content.strip()
        if data.content
        else ""
    )

    source_url = (
        data.source_url.strip()
        if data.source_url
        else None
    )

    file_url = (
        data.file_url.strip()
        if data.file_url
        else None
    )

    file_name = (
        data.file_name.strip()
        if data.file_name
        else None
    )

    validate_source_data(
        source_type=source_type,
        content=content,
        source_url=source_url,
        file_url=file_url,
    )

    # Clean fields depending on source
    if source_type == "TEXT":
        source_url = None
        file_url = None
        file_name = None

    elif source_type == "URL":
        content = ""
        file_url = None
        file_name = None

    elif source_type == "FILE":
        source_url = None

    existing = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"{document_type} already exists. "
                "Use the update endpoint."
            ),
        )

    document = LegalDocument(
        document_type=document_type,
        title=title,
        content=content,

        source_type=source_type,
        source_url=source_url,
        file_url=file_url,
        file_name=file_name,

        is_published=False,
        version=1,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Legal document created successfully.",
        "legal_document": legal_response(document),
    }


# =========================================================
# UPDATE LEGAL DOCUMENT
# =========================================================

@router.put(
    "/{document_type}",
    response_model=dict,
)
def update_legal_document(
    document_type: str,
    data: LegalDocumentUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(
        document_type
    )

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal document not found.",
        )

    changed = False

    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    if data.title is not None:

        title = data.title.strip()

        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title cannot be empty.",
            )

        if title != document.title:
            document.title = title
            changed = True

    # -----------------------------------------------------
    # SOURCE TYPE
    # -----------------------------------------------------

    new_source_type = document.source_type

    if data.source_type is not None:

        new_source_type = validate_source_type(
            data.source_type
        )

        if new_source_type != document.source_type:
            document.source_type = new_source_type
            changed = True

    # -----------------------------------------------------
    # CONTENT
    # -----------------------------------------------------

    if data.content is not None:

        content = data.content.strip()

        if content != document.content:
            document.content = content
            changed = True

    # -----------------------------------------------------
    # SOURCE URL
    # -----------------------------------------------------

    if data.source_url is not None:

        source_url = data.source_url.strip()

        if source_url != document.source_url:
            document.source_url = source_url
            changed = True

    # -----------------------------------------------------
    # FILE URL
    # -----------------------------------------------------

    if data.file_url is not None:

        file_url = data.file_url.strip()

        if file_url != document.file_url:
            document.file_url = file_url
            changed = True

    # -----------------------------------------------------
    # FILE NAME
    # -----------------------------------------------------

    if data.file_name is not None:

        file_name = data.file_name.strip()

        if file_name != document.file_name:
            document.file_name = file_name
            changed = True

    # -----------------------------------------------------
    # SOURCE VALIDATION
    # -----------------------------------------------------

    validate_source_data(
        source_type=new_source_type,
        content=document.content,
        source_url=document.source_url,
        file_url=document.file_url,
    )

    # -----------------------------------------------------
    # CLEAN UNUSED FIELDS
    # -----------------------------------------------------

    if new_source_type == "TEXT":

        document.source_url = None
        document.file_url = None
        document.file_name = None

    elif new_source_type == "URL":

        document.content = ""
        document.file_url = None
        document.file_name = None

    elif new_source_type == "FILE":

        document.source_url = None

    # -----------------------------------------------------
    # VERSIONING
    # -----------------------------------------------------

    if changed:

        document.version += 1

        # Any edit creates a new unpublished version.
        document.is_published = False
        document.published_at = None

    db.commit()
    db.refresh(document)

    return {
        "message": "Legal document updated successfully.",
        "legal_document": legal_response(document),
    }


# =========================================================
# DELETE LEGAL DOCUMENT
# =========================================================

@router.delete(
    "/{document_type}",
    response_model=dict,
)
def delete_legal_document(
    document_type: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(
        document_type
    )

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal document not found.",
        )

    # Delete associated uploaded file
    if (
        document.file_url
        and document.file_url.startswith(
            "/uploads/legal/"
        )
    ):
        filename = os.path.basename(
            document.file_url
        )

        file_path = os.path.join(
            UPLOAD_DIRECTORY,
            filename,
        )

        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

    db.delete(document)
    db.commit()

    return {
        "message": "Legal document deleted successfully.",
        "document_type": document_type,
    }


# =========================================================
# PUBLISH
# =========================================================

@router.post(
    "/{document_type}/publish",
    response_model=dict,
)
def publish_legal_document(
    document_type: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(
        document_type
    )

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal document not found.",
        )

    # Make sure current source is valid
    validate_source_data(
        source_type=document.source_type,
        content=document.content,
        source_url=document.source_url,
        file_url=document.file_url,
    )

    document.is_published = True
    document.published_at = datetime.utcnow()

    db.commit()
    db.refresh(document)

    return {
        "message": "Legal document published successfully.",
        "legal_document": legal_response(document),
    }


# =========================================================
# UNPUBLISH
# =========================================================

@router.post(
    "/{document_type}/unpublish",
    response_model=dict,
)
def unpublish_legal_document(
    document_type: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin),
):
    document_type = validate_document_type(
        document_type
    )

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Legal document not found.",
        )

    document.is_published = False
    document.published_at = None

    db.commit()
    db.refresh(document)

    return {
        "message": "Legal document unpublished successfully.",
        "legal_document": legal_response(document),
    }
# =========================================================
# PUBLIC GET LEGAL DOCUMENT
# =========================================================

@router.get(
    "/public/{document_type}",
    response_model=LegalDocumentResponse,
)
def get_public_legal_document(
    document_type: str,
    db: Session = Depends(get_db),
):
    document_type = validate_document_type(
        document_type
    )

    document = (
        db.query(LegalDocument)
        .filter(
            LegalDocument.document_type == document_type,
            LegalDocument.is_published == True,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Published legal document not found.",
        )

    return legal_response(document)