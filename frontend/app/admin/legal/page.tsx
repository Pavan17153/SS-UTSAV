"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Link as LinkIcon,
    Upload,
    Save,
    Eye,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    ExternalLink,
} from "lucide-react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi, API_BASE_URL } from "@/lib/api";

type DocumentType =
    | "PRIVACY_POLICY"
    | "TERMS_AND_CONDITIONS";

type SourceType = "TEXT" | "FILE" | "URL";

interface LegalDocument {
    id: number;
    document_type: DocumentType;
    title: string;
    content: string;
    source_type: SourceType;
    source_url: string | null;
    file_url: string | null;
    file_name: string | null;
    is_published: boolean;
    version: number;
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

interface ApiResponse {
    message?: string;
    detail?: string;
    legal_document?: LegalDocument;
    file_url?: string;
    file_name?: string;
}


function emptyDocument(
    documentType: DocumentType
): LegalDocument {
    return {
        id: 0,
        document_type: documentType,
        title:
            documentType === "PRIVACY_POLICY"
                ? "Privacy Policy"
                : "Terms & Conditions",
        content: "",
        source_type: "TEXT",
        source_url: null,
        file_url: null,
        file_name: null,
        is_published: false,
        version: 1,
        created_at: "",
        updated_at: "",
        published_at: null,
    };
}

export default function LegalManagementPage() {
    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [documents, setDocuments] = useState<
        LegalDocument[]
    >([]);

    const [selectedType, setSelectedType] =
        useState<DocumentType>("PRIVACY_POLICY");

    const [document, setDocument] =
        useState<LegalDocument | null>(null);

    const [sourceType, setSourceType] =
        useState<SourceType>("TEXT");

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [fileName, setFileName] = useState("");

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showPreview, setShowPreview] =
        useState(false);

    // =====================================================
    // LOAD DOCUMENTS
    // =====================================================

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.get<LegalDocument[]>(
                "/api/legal/"
            );

            setDocuments(data);

            const selected = data.find(
                (item) =>
                    item.document_type === selectedType
            );

            if (selected) {
                loadDocumentIntoForm(selected);
            } else {
                const empty = emptyDocument(selectedType);

                setDocument(null);
                setTitle(empty.title);
                setContent("");
                setSourceType("TEXT");
                setSourceUrl("");
                setFileUrl("");
                setFileName("");
                setSelectedFile(null);
            }
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load legal documents."
            );
        } finally {
            setLoading(false);
        }
    };
    // =====================================================
    // LOAD DOCUMENT INTO FORM
    // =====================================================

    const loadDocumentIntoForm = (
        selected: LegalDocument
    ) => {
        setDocument(selected);
        setTitle(selected.title);
        setContent(selected.content || "");
        setSourceType(
            selected.source_type || "TEXT"
        );
        setSourceUrl(selected.source_url || "");
        setFileUrl(selected.file_url || "");
        setFileName(selected.file_name || "");
        setSelectedFile(null);
    };

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        fetchDocuments();
    }, []);

    // =====================================================
    // DOCUMENT SELECT
    // =====================================================

    const handleDocumentChange = (
        value: DocumentType
    ) => {
        setSelectedType(value);
        setError("");
        setSuccess("");
        setShowPreview(false);

        const selected = documents.find(
            (item) =>
                item.document_type === value
        );

        if (selected) {
            loadDocumentIntoForm(selected);
        } else {
            const empty = emptyDocument(value);

            setDocument(null);
            setTitle(empty.title);
            setContent("");
            setSourceType("TEXT");
            setSourceUrl("");
            setFileUrl("");
            setFileName("");
            setSelectedFile(null);
        }
    };

    // =====================================================
    // SOURCE TYPE CHANGE
    // =====================================================

    const handleSourceChange = (
        value: SourceType
    ) => {
        setSourceType(value);
        setError("");
        setSuccess("");

        if (value === "TEXT") {
            setSourceUrl("");
            setFileUrl("");
            setFileName("");
            setSelectedFile(null);
        }

        if (value === "URL") {
            setContent("");
            setFileUrl("");
            setFileName("");
            setSelectedFile(null);
        }

        if (value === "FILE") {
            setContent("");
            setSourceUrl("");
        }
    };

    // =====================================================
    // FILE SELECT
    // =====================================================

    const handleFileSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            ".pdf",
            ".doc",
            ".docx",
            ".txt",
        ];

        const extension =
            "." +
            file.name
                .split(".")
                .pop()
                ?.toLowerCase();

        if (!extension || !allowedTypes.includes(extension)) {
            setError(
                "Only PDF, DOC, DOCX and TXT files are allowed."
            );
            event.target.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError(
                "File size cannot exceed 10 MB."
            );
            event.target.value = "";
            return;
        }

        setError("");
        setSuccess("");
        setSelectedFile(file);
        setFileName(file.name);
    };

    // =====================================================
    // UPLOAD FILE
    // =====================================================

    const uploadFile = async () => {
        if (!selectedFile) {
            return null;
        }

        try {
            setUploading(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "file",
                selectedFile
            );

            const data = await adminApi.post<ApiResponse>(
                "/api/legal/upload",
                formData
            );

            setFileUrl(data.file_url || "");
            setFileName(
                data.file_name ||
                selectedFile.name
            );

            setSelectedFile(null);

            return {
                file_url: data.file_url || "",
                file_name:
                    data.file_name ||
                    selectedFile.name,
            };
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to upload file."
            );

            return null;
        } finally {
            setUploading(false);
        }
    };

    // =====================================================
    // SAVE DOCUMENT
    // =====================================================

    const handleSave = async () => {
        setError("");
        setSuccess("");

        if (!title.trim()) {
            setError("Title cannot be empty.");
            return;
        }

        if (
            sourceType === "TEXT" &&
            !content.trim()
        ) {
            setError(
                "Please enter the document content."
            );
            return;
        }

        if (
            sourceType === "URL" &&
            !sourceUrl.trim()
        ) {
            setError(
                "Please enter the policy URL."
            );
            return;
        }

        if (
            sourceType === "URL" &&
            !(
                sourceUrl.startsWith("http://") ||
                sourceUrl.startsWith("https://")
            )
        ) {
            setError(
                "URL must start with http:// or https://."
            );
            return;
        }

        let finalFileUrl = fileUrl;
        let finalFileName = fileName;

        if (
            sourceType === "FILE" &&
            selectedFile
        ) {
            const uploaded =
                await uploadFile();

            if (!uploaded) {
                return;
            }

            finalFileUrl =
                uploaded.file_url;
            finalFileName =
                uploaded.file_name;
        }

        if (
            sourceType === "FILE" &&
            !finalFileUrl
        ) {
            setError(
                "Please select and upload a file."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: title.trim(),
                content:
                    sourceType === "TEXT"
                        ? content.trim()
                        : "",
                source_type: sourceType,
                source_url:
                    sourceType === "URL"
                        ? sourceUrl.trim()
                        : null,
                file_url:
                    sourceType === "FILE"
                        ? finalFileUrl
                        : null,
                file_name:
                    sourceType === "FILE"
                        ? finalFileName
                        : null,
            };

            if (document) {
                await adminApi.put<ApiResponse>(
                    `/api/legal/${selectedType}`,
                    payload
                );
            } else {
                await adminApi.post<ApiResponse>(
                    "/api/legal/",
                    {
                        document_type: selectedType,
                        ...payload,
                    }
                );
            }
            setSuccess(
                document
                    ? "Legal document updated successfully."
                    : "Legal document created successfully."
            );

            await fetchDocuments();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save legal document."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // PUBLISH
    // =====================================================

    const handlePublish = async () => {
        if (!document) {
            setError(
                "Save the document before publishing."
            );
            return;
        }

        try {
            setPublishing(true);
            setError("");
            setSuccess("");

            await adminApi.post<ApiResponse>(
                `/api/legal/${selectedType}/publish`,
                {}
            );

            setSuccess(
                "Legal document published successfully."
            );

            await fetchDocuments();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to publish document."
            );
        } finally {
            setPublishing(false);
        }
    };

    // =====================================================
    // UNPUBLISH
    // =====================================================

    const handleUnpublish = async () => {
        if (!document) {
            return;
        }

        try {
            setPublishing(true);
            setError("");
            setSuccess("");

            await adminApi.post<ApiResponse>(
                `/api/legal/${selectedType}/unpublish`,
                {}
            );

            setSuccess(
                "Legal document unpublished successfully."
            );

            await fetchDocuments();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to unpublish document."
            );
        } finally {
            setPublishing(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async () => {
        if (!document) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${document.title}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await adminApi.delete<ApiResponse>(
                `/api/legal/${selectedType}`
            );

            setSuccess(
                "Legal document deleted successfully."
            );

            await fetchDocuments();
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete document."
            );
        } finally {
            setDeleting(false);
        }
    };

    // =====================================================
    // PREVIEW
    // =====================================================

    const previewContent =
        sourceType === "TEXT"
            ? content
            : sourceType === "URL"
                ? sourceUrl
                : fileUrl;

    // =====================================================
    // RENDER
    // =====================================================

    return (<div className="min-h-screen bg-[#FBF7F0]">

        <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}

        <main className="min-h-screen lg:ml-[270px]">

            {/* Top Header */}

            <header className="sticky top-0 z-30 border-b border-[#D6A928]/20 bg-[#FBF7F0]/95 px-5 py-5 backdrop-blur sm:px-8 lg:px-10">

                <div className="flex items-center justify-between gap-4">

                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D6A928]">
                            Management
                        </p>

                        <h1
                            className="mt-1 text-2xl font-semibold text-[#39030F] sm:text-3xl"
                            style={{
                                fontFamily:
                                    "Georgia, serif",
                            }}
                        >
                            Legal Management
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage Privacy Policy and Terms & Conditions.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen(
                                true
                            )
                        }
                        className="rounded-xl bg-[#39030F] px-4 py-2 text-sm font-medium text-white lg:hidden"
                    >
                        Menu
                    </button>

                </div>
            </header>

            {/* Page */}

            <section className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">

                {/* Alerts */}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#D6A928]" />
                    </div>
                ) : (
                    <>
                        {/* Document Selector */}

                        <div className="mb-6 rounded-2xl border border-[#D6A928]/20 bg-white p-5 shadow-sm">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D6A928]">
                                        Document
                                    </p>

                                    <h2
                                        className="mt-1 text-xl font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily:
                                                "Georgia, serif",
                                        }}
                                    >
                                        Select Legal Document
                                    </h2>
                                </div>

                                <select
                                    value={
                                        selectedType
                                    }
                                    onChange={(e) =>
                                        handleDocumentChange(
                                            e.target
                                                .value as DocumentType
                                        )}
                                    className="w-full rounded-xl border border-gray-200 bg-[#FBF7F0] px-4 py-3 text-sm font-medium text-[#39030F] outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20 sm:w-[330px]"
                                >
                                    <option value="PRIVACY_POLICY">
                                        Privacy Policy
                                    </option>

                                    <option value="TERMS_AND_CONDITIONS">
                                        Terms & Conditions
                                    </option>
                                </select>

                            </div>

                        </div>

                        {/* Main Grid */}

                        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

                            {/* Editor */}

                            <div className="rounded-2xl border border-[#D6A928]/20 bg-white shadow-sm">

                                <div className="border-b border-gray-100 px-5 py-5 sm:px-7">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <h2
                                                className="text-xl font-semibold text-[#39030F]"
                                                style={{
                                                    fontFamily:
                                                        "Georgia, serif",
                                                }}
                                            >
                                                {title ||
                                                    "Legal Document"}
                                            </h2>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Version{" "}
                                                {document
                                                    ?.version ||
                                                    1}
                                            </p>
                                        </div>

                                        <div
                                            className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${document
                                                ?.is_published
                                                ? "bg-green-50 text-green-700"
                                                : "bg-amber-50 text-amber-700"
                                                }`}
                                        >
                                            <span className="h-2 w-2 rounded-full bg-current" />

                                            {document
                                                ?.is_published
                                                ? "Published"
                                                : "Unpublished"}
                                        </div>

                                    </div>

                                </div>

                                <div className="space-y-6 p-5 sm:p-7">

                                    {/* Title */}

                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                                            Document Title
                                        </label>

                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Privacy Policy"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                        />
                                    </div>

                                    {/* Source */}

                                    <div>

                                        <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                                            Content Source
                                        </label>

                                        <div className="grid gap-3 sm:grid-cols-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSourceChange(
                                                        "TEXT"
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${sourceType ===
                                                    "TEXT"
                                                    ? "border-[#D6A928] bg-[#D6A928]/10 text-[#39030F]"
                                                    : "border-gray-200 hover:border-[#D6A928]/50"
                                                    }`}
                                            >
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39030F] text-white">
                                                    <FileText className="h-4 w-4" />
                                                </span>

                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        Write Text
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Enter manually
                                                    </p>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSourceChange(
                                                        "FILE"
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${sourceType ===
                                                    "FILE"
                                                    ? "border-[#D6A928] bg-[#D6A928]/10 text-[#39030F]"
                                                    : "border-gray-200 hover:border-[#D6A928]/50"
                                                    }`}
                                            >
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39030F] text-white">
                                                    <Upload className="h-4 w-4" />
                                                </span>

                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        File
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Upload document
                                                    </p>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSourceChange(
                                                        "URL"
                                                    )
                                                }
                                                className={`flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition ${sourceType ===
                                                    "URL"
                                                    ? "border-[#D6A928] bg-[#D6A928]/10 text-[#39030F]"
                                                    : "border-gray-200 hover:border-[#D6A928]/50"
                                                    }`}
                                            >
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39030F] text-white">
                                                    <LinkIcon className="h-4 w-4" />
                                                </span>

                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        URL
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        External page
                                                    </p>
                                                </div>
                                            </button>

                                        </div>

                                    </div>

                                    {/* TEXT */}

                                    {sourceType ===
                                        "TEXT" && (
                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                                                    Policy Content
                                                </label>

                                                <textarea
                                                    value={
                                                        content
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setContent(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    rows={18}
                                                    placeholder="Enter your Privacy Policy or Terms & Conditions..."
                                                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-4 text-sm leading-7 text-gray-800 outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                                />
                                            </div>
                                        )}

                                    {/* FILE */}

                                    {sourceType ===
                                        "FILE" && (
                                            <div className="rounded-2xl border border-dashed border-[#D6A928]/50 bg-[#FBF7F0] p-6">

                                                <div className="text-center">

                                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39030F] text-white">
                                                        <Upload className="h-6 w-6" />
                                                    </div>

                                                    <h3 className="mt-4 text-base font-semibold text-[#39030F]">
                                                        Upload Legal Document
                                                    </h3>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        PDF, DOC, DOCX or TXT · Maximum 10 MB
                                                    </p>

                                                    <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0618]">
                                                        <Upload className="h-4 w-4" />
                                                        Select File

                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,.txt"
                                                            onChange={
                                                                handleFileSelect
                                                            }
                                                            className="hidden"
                                                        />
                                                    </label>

                                                    {fileName && (
                                                        <div className="mx-auto mt-5 flex max-w-lg items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left">

                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <FileText className="h-5 w-5 shrink-0 text-[#D6A928]" />

                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-medium text-gray-800">
                                                                        {
                                                                            fileName
                                                                        }
                                                                    </p>

                                                                    {fileUrl && (
                                                                        <p className="text-xs text-green-600">
                                                                            Uploaded
                                                                        </p>
                                                                    )}

                                                                    {selectedFile && (
                                                                        <p className="text-xs text-amber-600">
                                                                            Ready to upload
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {fileUrl && (
                                                                <a
                                                                    href={`${API_BASE_URL}${fileUrl}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="ml-3 rounded-lg p-2 text-[#39030F] hover:bg-[#FBF7F0]"
                                                                    title="Open file"
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </a>
                                                            )}

                                                        </div>
                                                    )}

                                                    {uploading && (
                                                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Uploading file...
                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        )}

                                    {/* URL */}

                                    {sourceType ===
                                        "URL" && (
                                            <div>
                                                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-gray-600">
                                                    Policy URL
                                                </label>

                                                <div className="relative">

                                                    <LinkIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                                                    <input
                                                        type="url"
                                                        value={
                                                            sourceUrl
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            setSourceUrl(
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="https://example.com/privacy-policy"
                                                        className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                                    />

                                                </div>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    The customer page will open this external policy URL.
                                                </p>
                                            </div>
                                        )}

                                    {/* Actions */}

                                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:flex-wrap">

                                        <button
                                            type="button"
                                            onClick={
                                                handleSave
                                            }
                                            disabled={
                                                saving ||
                                                uploading
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A0618] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {saving ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}

                                            {saving
                                                ? "Saving..."
                                                : "Save Changes"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPreview(
                                                    true
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#39030F] px-5 py-3 text-sm font-semibold text-[#39030F] transition hover:bg-[#FBF7F0]"
                                        >
                                            <Eye className="h-4 w-4" />
                                            Preview
                                        </button>

                                        {document && (
                                            <>
                                                {document.is_published ? (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleUnpublish
                                                        }
                                                        disabled={
                                                            publishing
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 px-5 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                                                    >
                                                        {publishing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )}

                                                        Unpublish
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handlePublish
                                                        }
                                                        disabled={
                                                            publishing
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
                                                    >
                                                        {publishing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        )}

                                                        Publish
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleDelete
                                                    }
                                                    disabled={
                                                        deleting
                                                    }
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                                >
                                                    {deleting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}

                                                    Delete
                                                </button>
                                            </>
                                        )}

                                    </div>

                                </div>

                            </div>

                            {/* Right Information Panel */}

                            <aside className="space-y-6">

                                {/* Status */}

                                <div className="rounded-2xl border border-[#D6A928]/20 bg-white p-6 shadow-sm">

                                    <h3
                                        className="text-lg font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily:
                                                "Georgia, serif",
                                        }}
                                    >
                                        Document Status
                                    </h3>

                                    <div className="mt-5 space-y-4">

                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-sm text-gray-500">
                                                Document
                                            </span>

                                            <span className="text-sm font-semibold text-[#39030F]">
                                                {selectedType ===
                                                    "PRIVACY_POLICY"
                                                    ? "Privacy Policy"
                                                    : "Terms & Conditions"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-sm text-gray-500">
                                                Source
                                            </span>

                                            <span className="text-sm font-semibold text-[#39030F]">
                                                {
                                                    sourceType
                                                }
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                            <span className="text-sm text-gray-500">
                                                Version
                                            </span>

                                            <span className="text-sm font-semibold text-[#39030F]">
                                                {document
                                                    ?.version ||
                                                    1}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">
                                                Status
                                            </span>

                                            <span
                                                className={`text-sm font-semibold ${document
                                                    ?.is_published
                                                    ? "text-green-700"
                                                    : "text-amber-700"
                                                    }`}
                                            >
                                                {document
                                                    ?.is_published
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {/* Source Help */}

                                <div className="rounded-2xl bg-[#39030F] p-6 text-white shadow-sm">

                                    <h3
                                        className="text-lg font-semibold text-[#D6A928]"
                                        style={{
                                            fontFamily:
                                                "Georgia, serif",
                                        }}
                                    >
                                        Content Sources
                                    </h3>

                                    <div className="mt-5 space-y-4 text-sm text-[#FBF7F0]/75">

                                        <div>
                                            <p className="font-semibold text-white">
                                                Write Text
                                            </p>

                                            <p className="mt-1">
                                                Enter and maintain the legal content directly in SS UTSAV.
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-white">
                                                File
                                            </p>

                                            <p className="mt-1">
                                                Upload a PDF, DOC, DOCX or TXT document.
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-white">
                                                URL
                                            </p>

                                            <p className="mt-1">
                                                Connect the customer page to an external legal document.
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            </aside>

                        </div>
                    </>
                )}

            </section>

        </main>

        {/* Preview Modal */}

        {showPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">

                <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D6A928]">
                                Preview
                            </p>

                            <h2
                                className="mt-1 text-xl font-semibold text-[#39030F]"
                                style={{
                                    fontFamily:
                                        "Georgia, serif",
                                }}
                            >
                                {title}
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowPreview(
                                    false
                                )
                            }
                            className="rounded-xl p-2 text-gray-500 hover:bg-[#FBF7F0] hover:text-[#39030F]"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>

                    </div>

                    <div className="overflow-y-auto p-6 sm:p-8">

                        {sourceType ===
                            "TEXT" && (
                                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                                    {previewContent ||
                                        "No content available."}
                                </div>
                            )}

                        {sourceType ===
                            "URL" && (
                                <div className="text-center">

                                    <LinkIcon className="mx-auto h-10 w-10 text-[#D6A928]" />

                                    <p className="mt-4 text-sm text-gray-600">
                                        This document uses an external URL.
                                    </p>

                                    {sourceUrl && (
                                        <a
                                            href={
                                                sourceUrl
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white"
                                        >
                                            Open Policy
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}

                                </div>
                            )}

                        {sourceType ===
                            "FILE" && (
                                <div className="text-center">

                                    <FileText className="mx-auto h-12 w-12 text-[#D6A928]" />

                                    <p className="mt-4 text-sm font-semibold text-[#39030F]">
                                        {fileName ||
                                            "Legal document"}
                                    </p>

                                    {fileUrl && (
                                        <a
                                            href={`${API_BASE_URL}${fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white"
                                        >
                                            Open File
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}

                                </div>
                            )}

                    </div>

                </div>

            </div>
        )}

    </div>
    );
}
