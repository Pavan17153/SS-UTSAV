"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Eye,
    FileText,
    IndianRupee,
    Menu,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

type QuoteStatus =
    | "DRAFT"
    | "SENT"
    | "ACCEPTED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";

type QuotationItem = {
    id: number;
    quotation_id: number;
    service_name: string;
    description: string | null;
    quantity: number | string;
    unit_price: number | string;
    amount: number | string;
};

type Quotation = {
    id: number;
    event_id: number;
    quotation_number: string;
    total_amount: number | string;
    status: QuoteStatus;
    valid_until: string | null;
    notes: string | null;
    created_at: string;
};

type Event = {
    id: number;
    customer_id: number;
    event_type: string;
    event_date: string;
    location: string;
    venue: string | null;
    guest_count: number;
    budget: number | string | null;
    status: string;
    notes: string | null;
    created_at: string;
};

type Customer = {
    id: number;
    lead_id: number | null;
    full_name: string;
    phone: string;
    email: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
};

type QuotationForm = {
    event_id: string;
    status: QuoteStatus;
    valid_until: string;
    notes: string;
};

type ItemForm = {
    service_name: string;
    description: string;
    quantity: string;
    unit_price: string;
};

const statusOptions: QuoteStatus[] = [
    "DRAFT",
    "SENT",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
];

const emptyQuotationForm: QuotationForm = {
    event_id: "",
    status: "DRAFT",
    valid_until: "",
    notes: "",
};

const emptyItemForm: ItemForm = {
    service_name: "",
    description: "",
    quantity: "1",
    unit_price: "0",
};

function logout() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("ss_utsav_access_token");
    localStorage.removeItem("ss_utsav_admin");
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin");

    sessionStorage.removeItem("ss_utsav_access_token");
    sessionStorage.removeItem("ss_utsav_admin");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("admin");

    window.location.href = "/admin/login";
}

async function getApiError(response: Response): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data?.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data?.detail)) {
            return data.detail
                .map((item: any) => item?.msg || "Validation error")
                .join(", ");
        }

        if (typeof data?.message === "string") {
            return data.message;
        }

        return `Request failed with status ${response.status}`;
    } catch {
        return `Request failed with status ${response.status}`;
    }
}

function normalizeArray<T>(data: any, key: string): T[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.[key])) {
        return data[key];
    }

    return [];
}

function normalizeObject<T>(data: any, key: string): T | null {
    if (data?.[key]) {
        return data[key];
    }

    if (data?.id) {
        return data;
    }

    return null;
}

function formatCurrency(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);

    if (!Number.isFinite(amount)) {
        return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function statusLabel(status: QuoteStatus) {
    switch (status) {
        case "DRAFT":
            return "Draft";
        case "SENT":
            return "Sent";
        case "ACCEPTED":
            return "Accepted";
        case "REJECTED":
            return "Rejected";
        case "EXPIRED":
            return "Expired";
        case "CANCELLED":
            return "Cancelled";
        default:
            return status;
    }
}

function statusClasses(status: QuoteStatus) {
    switch (status) {
        case "DRAFT":
            return "border-gray-200 bg-gray-50 text-gray-700";

        case "SENT":
            return "border-blue-200 bg-blue-50 text-blue-700";

        case "ACCEPTED":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "REJECTED":
            return "border-red-200 bg-red-50 text-red-700";

        case "EXPIRED":
            return "border-amber-200 bg-amber-50 text-amber-700";

        case "CANCELLED":
            return "border-slate-200 bg-slate-50 text-slate-700";

        default:
            return "border-gray-200 bg-gray-50 text-gray-700";
    }
}

function getCustomerName(
    event: Event | null | undefined,
    customers: Customer[]
) {
    if (!event) {
        return "Unknown Client";
    }

    const customer = customers.find(
        (item) => item.id === event.customer_id
    );

    return customer?.full_name || `Client #${event.customer_id}`;
}

function getEventLabel(event: Event | null | undefined) {
    if (!event) {
        return "Unknown Event";
    }

    return `${event.event_type} · ${formatDate(event.event_date)}`;
}

function StatCard({
    icon,
    title,
    value,
    description,
}: {
    icon: ReactNode;
    title: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[#E7DDCF] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A7A70]">
                        {title}
                    </p>

                    <p className="mt-3 font-serif text-3xl font-semibold text-[#39030F]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[#978880]">
                        {description}
                    </p>
                </div>

                <div className="rounded-xl bg-[#FBF4DD] p-3 text-[#9A7610]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function QuotationsPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedQuotation, setSelectedQuotation] =
        useState<Quotation | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingQuotation, setEditingQuotation] =
        useState<Quotation | null>(null);

    const [quotationForm, setQuotationForm] =
        useState<QuotationForm>(emptyQuotationForm);

    const [items, setItems] = useState<QuotationItem[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] =
        useState<QuotationItem | null>(null);

    const [itemForm, setItemForm] =
        useState<ItemForm>(emptyItemForm);

    const [savingQuotation, setSavingQuotation] = useState(false);
    const [savingItem, setSavingItem] = useState(false);

    const [deleteQuotation, setDeleteQuotation] =
        useState<Quotation | null>(null);

    const [deleteItem, setDeleteItem] =
        useState<QuotationItem | null>(null);

    const [deleting, setDeleting] = useState(false);

    const [notice, setNotice] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [apiError, setApiError] = useState("");

    function showNotice(
        type: "success" | "error",
        message: string
    ) {
        setNotice({
            type,
            message,
        });

        window.setTimeout(() => {
            setNotice(null);
        }, 3500);
    }

    async function loadData() {
        setLoading(true);
        setApiError("");

        try {
            const [
                quotationsData,
                eventsData,
                customersData,
            ] = await Promise.all([
                adminApi.get<any>("/api/quotations/"),
                adminApi.get<any>("/api/events/"),
                adminApi.get<any>("/api/customers/"),
            ]);

            setQuotations(
                normalizeArray<Quotation>(
                    quotationsData,
                    "quotations"
                )
            );

            setEvents(
                normalizeArray<Event>(
                    eventsData,
                    "events"
                )
            );

            setCustomers(
                normalizeArray<Customer>(
                    customersData,
                    "customers"
                )
            );
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            setApiError(
                error?.message || "Unable to load quotation data."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredQuotations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return quotations.filter((quotation) => {
            const event = events.find(
                (item) => item.id === quotation.event_id
            );

            const customerName = getCustomerName(
                event,
                customers
            );

            const searchableText = [
                quotation.quotation_number,
                customerName,
                event?.event_type || "",
                event?.location || "",
                event?.venue || "",
                String(quotation.event_id),
                String(quotation.id),
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !query || searchableText.includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                quotation.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        quotations,
        events,
        customers,
        search,
        statusFilter,
    ]);

    const totalQuotes = quotations.length;

    const pendingQuotes = quotations.filter(
        (quotation) =>
            quotation.status === "DRAFT" ||
            quotation.status === "SENT"
    ).length;

    const acceptedQuotes = quotations.filter(
        (quotation) => quotation.status === "ACCEPTED"
    ).length;

    const totalQuotedValue = quotations.reduce(
        (total, quotation) =>
            total + Number(quotation.total_amount || 0),
        0
    );

    function openCreateQuotation() {
        setEditingQuotation(null);
        setQuotationForm(emptyQuotationForm);
        setItems([]);
        setShowForm(true);
    }

    async function openEditQuotation(quotationId: number) {
        try {
            const data = await adminApi.get<any>(
                `/api/quotations/${quotationId}`
            );

            const quotation = normalizeObject<Quotation>(
                data,
                "quotation"
            );

            if (!quotation) {
                throw new Error(
                    "Quotation details were not returned."
                );
            }

            setEditingQuotation(quotation);

            setQuotationForm({
                event_id: String(quotation.event_id),
                status: quotation.status,
                valid_until: quotation.valid_until
                    ? quotation.valid_until.slice(0, 10)
                    : "",
                notes: quotation.notes || "",
            });

            setShowForm(true);

            await loadItems(quotation.id);
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to load quotation."
            );
        }
    }
    async function viewQuotation(quotationId: number) {
        try {
            const data = await adminApi.get<any>(
                `/api/quotations/${quotationId}`
            );

            const quotation = normalizeObject<Quotation>(
                data,
                "quotation"
            );

            if (!quotation) {
                throw new Error(
                    "Quotation details were not returned."
                );
            }

            setSelectedQuotation(quotation);

            await loadItems(quotation.id);
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to load quotation."
            );
        }
    }

    async function loadItems(quotationId: number) {
        setItemsLoading(true);

        try {
            const data = await adminApi.get<any>(
                `/api/quotations/${quotationId}/items`
            );

            setItems(
                normalizeArray<QuotationItem>(
                    data,
                    "items"
                )
            );
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to load quotation items."
            );

            setItems([]);
        } finally {
            setItemsLoading(false);
        }
    }

    async function saveQuotation(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!quotationForm.event_id) {
            showNotice("error", "Please select an event.");
            return;
        }

        setSavingQuotation(true);

        try {
            const payload = {
                event_id: Number(quotationForm.event_id),
                status: quotationForm.status,
                valid_until:
                    quotationForm.valid_until.trim() || null,
                notes: quotationForm.notes.trim() || null,
            };

            const isEditing = Boolean(editingQuotation);

            const data = isEditing
                ? await adminApi.put<any>(
                    `/api/quotations/${editingQuotation!.id}`,
                    payload
                )
                : await adminApi.post<any>(
                    "/api/quotations/",
                    payload
                );

            const quotation = normalizeObject<Quotation>(
                data,
                "quotation"
            );

            if (!quotation) {
                throw new Error(
                    "Quotation was saved but the server returned no quotation."
                );
            }

            await loadData();

            if (isEditing) {
                setEditingQuotation(quotation);
                await loadItems(quotation.id);

                showNotice(
                    "success",
                    "Quotation updated successfully."
                );
            } else {
                setEditingQuotation(quotation);

                setQuotationForm({
                    event_id: String(quotation.event_id),
                    status: quotation.status,
                    valid_until: quotation.valid_until
                        ? quotation.valid_until.slice(0, 10)
                        : "",
                    notes: quotation.notes || "",
                });

                setItems([]);

                showNotice(
                    "success",
                    `Quotation ${quotation.quotation_number} created successfully.`
                );
            }
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to save quotation."
            );
        } finally {
            setSavingQuotation(false);
        }
    }

    function closeQuotationForm() {
        if (savingQuotation) {
            return;
        }

        setShowForm(false);
        setEditingQuotation(null);
        setQuotationForm(emptyQuotationForm);
        setItems([]);
        setShowItemForm(false);
        setEditingItem(null);
        setItemForm(emptyItemForm);
    }

    function openAddItem() {
        if (!editingQuotation) {
            showNotice(
                "error",
                "Create the quotation first before adding services."
            );
            return;
        }

        setEditingItem(null);
        setItemForm(emptyItemForm);
        setShowItemForm(true);
    }

    function openEditItem(item: QuotationItem) {
        setEditingItem(item);

        setItemForm({
            service_name: item.service_name,
            description: item.description || "",
            quantity: String(item.quantity),
            unit_price: String(item.unit_price),
        });

        setShowItemForm(true);
    }

    async function saveItem(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!editingQuotation) {
            showNotice(
                "error",
                "Quotation must be created first."
            );
            return;
        }

        const serviceName = itemForm.service_name.trim();
        const quantity = Number(itemForm.quantity);
        const unitPrice = Number(itemForm.unit_price);

        if (!serviceName) {
            showNotice(
                "error",
                "Service name is required."
            );
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            showNotice(
                "error",
                "Quantity must be greater than zero."
            );
            return;
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            showNotice(
                "error",
                "Unit price cannot be negative."
            );
            return;
        }

        setSavingItem(true);

        try {
            const payload = {
                service_name: serviceName,
                description:
                    itemForm.description.trim() || null,
                quantity,
                unit_price: unitPrice,
            };

            const isEditing = Boolean(editingItem);

            if (isEditing) {
                await adminApi.put<any>(
                    `/api/quotations/${editingQuotation.id}/items/${editingItem!.id}`,
                    payload
                );
            } else {
                await adminApi.post<any>(
                    `/api/quotations/${editingQuotation.id}/items`,
                    payload
                );
            }

            await loadItems(editingQuotation.id);
            await loadData();

            setShowItemForm(false);
            setEditingItem(null);
            setItemForm(emptyItemForm);

            showNotice(
                "success",
                isEditing
                    ? "Quotation item updated successfully."
                    : "Quotation item added successfully."
            );
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to save quotation item."
            );
        } finally {
            setSavingItem(false);
        }
    }
    async function confirmDeleteItem() {
        if (!deleteItem || !editingQuotation) {
            return;
        }

        setDeleting(true);

        try {
            await adminApi.delete<any>(
                `/api/quotations/${editingQuotation.id}/items/${deleteItem.id}`
            );

            setDeleteItem(null);

            await loadItems(editingQuotation.id);
            await loadData();

            showNotice(
                "success",
                "Quotation item deleted successfully."
            );
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message ||
                "Unable to delete quotation item."
            );
        } finally {
            setDeleting(false);
        }
    }

    async function confirmDeleteQuotation() {
        if (!deleteQuotation) {
            return;
        }

        setDeleting(true);

        try {
            await adminApi.delete<any>(
                `/api/quotations/${deleteQuotation.id}`
            );

            setDeleteQuotation(null);

            if (
                selectedQuotation?.id === deleteQuotation.id
            ) {
                setSelectedQuotation(null);
            }

            if (
                editingQuotation?.id === deleteQuotation.id
            ) {
                closeQuotationForm();
            }

            await loadData();

            showNotice(
                "success",
                "Quotation deleted successfully."
            );
        } catch (error: any) {
            if (
                error?.message === "Unauthorized" ||
                error?.message === "Authentication required"
            ) {
                logout();
                return;
            }

            showNotice(
                "error",
                error?.message || "Unable to delete quotation."
            );
        } finally {
            setDeleting(false);
        }
    }
    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#39030F]">
            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* HEADER */}
            <header className="sticky top-0 z-30 h-[82px] border-b border-[#E8DED0] bg-[#FBF7F0]/95 backdrop-blur lg:ml-[270px]">
                <div className="flex h-full items-center justify-between px-5 md:px-8">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A16]">
                            SS UTSAV ADMIN
                        </p>

                        <h1
                            className="mt-1 text-2xl font-semibold text-[#39030F] md:text-3xl"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            Quotations
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E1D4C4] bg-white text-[#39030F] shadow-sm hover:border-[#D6A928] hover:text-[#B28A16] lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </header>

            <main className="min-h-screen lg:ml-[270px]">
                <div className="px-5 py-7 md:px-8 md:py-9">
                    {/* PAGE INTRO */}
                    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                        <div>
                            <p className="text-sm font-medium text-[#8A737B]">
                                Proposal & sales management
                            </p>

                            <h2
                                className="mt-2 text-3xl font-semibold text-[#39030F] md:text-4xl"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                Manage Quotations
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B6870]">
                                Create professional quotations for events,
                                manage service pricing and track quotation
                                status from draft to acceptance.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={loadData}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCCFC0] bg-white px-4 py-3 text-sm font-semibold text-[#39030F] shadow-sm hover:border-[#D6A928] hover:text-[#A47D08] disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        loading ? "animate-spin" : ""
                                    }
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openCreateQuotation}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#4A0618]"
                            >
                                <Plus size={18} />
                                Create Quotation
                            </button>
                        </div>
                    </div>

                    {/* NOTICE */}
                    {notice && (
                        <div
                            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${notice.type === "success"
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-red-200 bg-red-50 text-red-800"
                                }`}
                        >
                            {notice.type === "success" ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <AlertCircle size={18} />
                            )}

                            <span>{notice.message}</span>
                        </div>
                    )}

                    {/* ERROR */}
                    {apiError && !loading && (
                        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>
                                    <p className="font-semibold text-red-800">
                                        Unable to load quotations
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                        {apiError}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={loadData}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
                            >
                                <RefreshCw size={15} />
                                Retry
                            </button>
                        </div>
                    )}

                    {/* STATS */}
                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Quotations"
                            value={String(totalQuotes)}
                            description="All quotations"
                            icon={<FileText size={21} />}
                        />

                        <StatCard
                            title="Pending"
                            value={String(pendingQuotes)}
                            description="Draft or sent"
                            icon={<FileText size={21} />}
                        />

                        <StatCard
                            title="Accepted"
                            value={String(acceptedQuotes)}
                            description="Approved quotations"
                            icon={<CheckCircle2 size={21} />}
                        />

                        <StatCard
                            title="Quoted Value"
                            value={formatCurrency(totalQuotedValue)}
                            description="Total quotation value"
                            icon={<IndianRupee size={21} />}
                        />
                    </div>

                    {/* SEARCH / FILTER */}
                    <div className="mb-5 rounded-2xl border border-[#E8DED0] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:max-w-xl">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A898F]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search quotation, client, event, location..."
                                    className="h-12 w-full rounded-xl border border-[#E2D7CB] bg-[#FFFCF8] pl-11 pr-4 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                />
                            </div>

                            <div className="relative w-full lg:w-56">
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    className="h-12 w-full appearance-none rounded-xl border border-[#E2D7CB] bg-[#FFFCF8] px-4 text-sm outline-none focus:border-[#D6A928]"
                                >
                                    <option value="ALL">
                                        All Statuses
                                    </option>

                                    {statusOptions.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {statusLabel(status)}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={17}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7A70]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    {loading ? (
                        <div className="rounded-2xl border border-[#E8DED0] bg-white p-6 shadow-sm">
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="h-16 animate-pulse rounded-xl bg-[#F3EDE5]"
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    ) : filteredQuotations.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#D9CABB] bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF3DC] text-[#B28A16]">
                                <FileText size={28} />
                            </div>

                            <h3
                                className="mt-5 text-2xl font-semibold text-[#39030F]"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                No quotations found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7B6870]">
                                {search || statusFilter !== "ALL"
                                    ? "Try changing your search or status filter."
                                    : "Create your first quotation for an event."}
                            </p>

                            {!search &&
                                statusFilter === "ALL" && (
                                    <button
                                        type="button"
                                        onClick={openCreateQuotation}
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white"
                                    >
                                        <Plus size={18} />
                                        Create Quotation
                                    </button>
                                )}
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP */}
                            <div className="hidden overflow-hidden rounded-2xl border border-[#E8DED0] bg-white shadow-sm xl:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1100px]">
                                        <thead>
                                            <tr className="border-b border-[#E8DED0] bg-[#FCF8F2]">
                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Quotation
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Client
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Event
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Valid Until
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Amount
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Status
                                                </th>

                                                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredQuotations.map(
                                                (quotation) => {
                                                    const event = events.find(
                                                        (item) =>
                                                            item.id ===
                                                            quotation.event_id
                                                    );

                                                    return (
                                                        <tr
                                                            key={quotation.id}
                                                            className="border-b border-[#F0E9E1] last:border-b-0 hover:bg-[#FFFCF8]"
                                                        >
                                                            <td className="px-5 py-5">
                                                                <p className="font-semibold text-[#39030F]">
                                                                    {
                                                                        quotation.quotation_number
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#94848A]">
                                                                    ID #{quotation.id}
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-5">
                                                                <p className="text-sm font-semibold text-[#4E3D44]">
                                                                    {getCustomerName(
                                                                        event,
                                                                        customers
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#94848A]">
                                                                    Event #{quotation.event_id}
                                                                </p>
                                                            </td>

                                                            <td className="px-5 py-5">
                                                                <p className="text-sm font-medium text-[#4E3D44]">
                                                                    {event?.event_type ||
                                                                        "Unknown Event"}
                                                                </p>

                                                                {event && (
                                                                    <p className="mt-1 text-xs text-[#94848A]">
                                                                        {formatDate(
                                                                            event.event_date
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-5 text-sm text-[#625158]">
                                                                {formatDate(
                                                                    quotation.valid_until
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-5 text-sm font-bold text-[#39030F]">
                                                                {formatCurrency(
                                                                    quotation.total_amount
                                                                )}
                                                            </td>

                                                            <td className="px-5 py-5">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                                                                        quotation.status
                                                                    )}`}
                                                                >
                                                                    {statusLabel(
                                                                        quotation.status
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-5 py-5">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            viewQuotation(
                                                                                quotation.id
                                                                            )
                                                                        }
                                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DBD0] text-[#5E4A52] hover:border-[#D6A928] hover:bg-[#FBF3DC] hover:text-[#9A7510]"
                                                                        title="View quotation"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openEditQuotation(
                                                                                quotation.id
                                                                            )
                                                                        }
                                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DBD0] text-[#5E4A52] hover:border-[#D6A928] hover:bg-[#FBF3DC] hover:text-[#9A7510]"
                                                                        title="Edit quotation"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setDeleteQuotation(
                                                                                quotation
                                                                            )
                                                                        }
                                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                                        title="Delete quotation"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* part 2 start */}
                            {/* MOBILE */}
                            <div className="grid grid-cols-1 gap-4 xl:hidden">
                                {filteredQuotations.map(
                                    (quotation) => {
                                        const event = events.find(
                                            (item) =>
                                                item.id ===
                                                quotation.event_id
                                        );

                                        return (
                                            <div
                                                key={quotation.id}
                                                className="rounded-2xl border border-[#E8DED0] bg-white p-5 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-serif text-xl font-semibold text-[#39030F]">
                                                            {
                                                                quotation.quotation_number
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#94848A]">
                                                            #{quotation.id}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${statusClasses(
                                                            quotation.status
                                                        )}`}
                                                    >
                                                        {statusLabel(
                                                            quotation.status
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-5 space-y-3">
                                                    <MobileInfo
                                                        label="Client"
                                                        value={getCustomerName(
                                                            event,
                                                            customers
                                                        )}
                                                    />

                                                    <MobileInfo
                                                        label="Event"
                                                        value={
                                                            event?.event_type ||
                                                            "Unknown Event"
                                                        }
                                                    />

                                                    <MobileInfo
                                                        label="Event Date"
                                                        value={
                                                            event
                                                                ? formatDate(
                                                                    event.event_date
                                                                )
                                                                : "—"
                                                        }
                                                    />

                                                    <MobileInfo
                                                        label="Valid Until"
                                                        value={formatDate(
                                                            quotation.valid_until
                                                        )}
                                                    />

                                                    <MobileInfo
                                                        label="Total"
                                                        value={formatCurrency(
                                                            quotation.total_amount
                                                        )}
                                                    />
                                                </div>

                                                <div className="mt-5 flex gap-2 border-t border-[#F0E9E1] pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            viewQuotation(
                                                                quotation.id
                                                            )
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E3D8CD] px-3 py-2.5 text-xs font-semibold text-[#4F3E45] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                                    >
                                                        <Eye size={15} />
                                                        View
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditQuotation(
                                                                quotation.id
                                                            )
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E3D8CD] px-3 py-2.5 text-xs font-semibold text-[#4F3E45] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                                    >
                                                        <Pencil size={15} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteQuotation(
                                                                quotation
                                                            )
                                                        }
                                                        className="flex items-center justify-center rounded-lg border border-red-100 px-3 py-2.5 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* CREATE / EDIT QUOTATION MODAL */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] shadow-2xl">
                        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E8DED0] bg-[#FBF7F0] px-6 py-5 md:px-7">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B28A16]">
                                    Proposal Management
                                </p>

                                <h3
                                    className="mt-1 text-2xl font-semibold text-[#39030F]"
                                    style={{ fontFamily: "Georgia, serif" }}
                                >
                                    {editingQuotation
                                        ? `Edit ${editingQuotation.quotation_number}`
                                        : "Create Quotation"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeQuotationForm}
                                disabled={savingQuotation}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0D4C7] bg-white text-[#6D5A61] hover:border-[#D6A928] hover:text-[#39030F]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="p-6 md:p-7">
                            {/* BASIC DETAILS */}
                            <form onSubmit={saveQuotation}>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Event *
                                        </label>

                                        <select
                                            value={quotationForm.event_id}
                                            onChange={(event) =>
                                                setQuotationForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        event_id:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928]"
                                        >
                                            <option value="">
                                                Select Event
                                            </option>

                                            {events.map((event) => (
                                                <option
                                                    key={event.id}
                                                    value={event.id}
                                                >
                                                    {event.event_type} —{" "}
                                                    {getCustomerName(
                                                        event,
                                                        customers
                                                    )} —{" "}
                                                    {formatDate(
                                                        event.event_date
                                                    )}
                                                </option>
                                            ))}
                                        </select>

                                        {events.length === 0 && (
                                            <p className="mt-2 text-xs text-red-600">
                                                No events available.{" "}
                                                <Link
                                                    href="/admin/events"
                                                    className="font-semibold underline"
                                                >
                                                    Create an event first.
                                                </Link>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Status
                                        </label>

                                        <select
                                            value={quotationForm.status}
                                            onChange={(event) =>
                                                setQuotationForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        status:
                                                            event.target
                                                                .value as QuoteStatus,
                                                    })
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928]"
                                        >
                                            {statusOptions.map(
                                                (status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {statusLabel(status)}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Valid Until
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                quotationForm.valid_until
                                            }
                                            onChange={(event) =>
                                                setQuotationForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        valid_until:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928]"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Notes
                                        </label>

                                        <textarea
                                            value={quotationForm.notes}
                                            onChange={(event) =>
                                                setQuotationForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        notes:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            rows={4}
                                            placeholder="Quotation notes..."
                                            className="w-full resize-none rounded-xl border border-[#DED2C5] bg-white px-4 py-3 text-sm text-[#39030F] outline-none focus:border-[#D6A928]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end border-t border-[#E8DED0] pt-5">
                                    <button
                                        type="submit"
                                        disabled={savingQuotation}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A0618] disabled:opacity-60"
                                    >
                                        {savingQuotation ? (
                                            <>
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                {editingQuotation ? (
                                                    <Pencil size={16} />
                                                ) : (
                                                    <Plus size={16} />
                                                )}

                                                {editingQuotation
                                                    ? "Update Quotation"
                                                    : "Create Quotation"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* ITEMS */}
                            {editingQuotation && (
                                <div className="mt-8 border-t border-[#E8DED0] pt-7">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B28A16]">
                                                Services
                                            </p>

                                            <h4
                                                className="mt-1 text-2xl font-semibold text-[#39030F]"
                                                style={{
                                                    fontFamily: "Georgia, serif",
                                                }}
                                            >
                                                Quotation Items
                                            </h4>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={openAddItem}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8CABB] bg-white px-4 py-3 text-sm font-semibold text-[#39030F] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                        >
                                            <Plus size={17} />
                                            Add Service
                                        </button>
                                    </div>

                                    {itemsLoading ? (
                                        <div className="mt-5 space-y-3">
                                            {[1, 2, 3].map((item) => (
                                                <div
                                                    key={item}
                                                    className="h-20 animate-pulse rounded-xl bg-[#F3EDE5]"
                                                />
                                            ))}
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="mt-5 rounded-2xl border border-dashed border-[#D8CABB] bg-white p-8 text-center">
                                            <FileText
                                                size={27}
                                                className="mx-auto text-[#B28A16]"
                                            />

                                            <p className="mt-3 font-semibold text-[#39030F]">
                                                No services added
                                            </p>

                                            <p className="mt-1 text-xs text-[#8A7A70]">
                                                Add services and pricing to build
                                                the quotation.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E8DED0] bg-white">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[750px]">
                                                    <thead className="bg-[#FCF8F2]">
                                                        <tr className="border-b border-[#E8DED0]">
                                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Service
                                                            </th>

                                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Description
                                                            </th>

                                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Qty
                                                            </th>

                                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Rate
                                                            </th>

                                                            <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Amount
                                                            </th>

                                                            <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[#806E75]">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {items.map(
                                                            (item) => (
                                                                <tr
                                                                    key={item.id}
                                                                    className="border-b border-[#F0E9E1] last:border-0"
                                                                >
                                                                    <td className="px-4 py-4 text-sm font-semibold text-[#39030F]">
                                                                        {
                                                                            item.service_name
                                                                        }
                                                                    </td>

                                                                    <td className="max-w-[240px] px-4 py-4 text-sm text-[#6E5C63]">
                                                                        {item.description ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="px-4 py-4 text-sm">
                                                                        {item.quantity}
                                                                    </td>

                                                                    <td className="px-4 py-4 text-sm">
                                                                        {formatCurrency(
                                                                            item.unit_price
                                                                        )}
                                                                    </td>

                                                                    <td className="px-4 py-4 text-sm font-bold text-[#39030F]">
                                                                        {formatCurrency(
                                                                            item.amount
                                                                        )}
                                                                    </td>

                                                                    <td className="px-4 py-4">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openEditItem(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4D9CD] text-[#625158] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                                                            >
                                                                                <Pencil
                                                                                    size={14}
                                                                                />
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setDeleteItem(
                                                                                        item
                                                                                    )
                                                                                }
                                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                                                                            >
                                                                                <Trash2
                                                                                    size={14}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-5 flex justify-end">
                                        <div className="w-full max-w-sm rounded-2xl border border-[#DCCEA0] bg-[#FBF4DD] p-5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-[#75655C]">
                                                    Quotation Total
                                                </span>

                                                <span className="font-serif text-2xl font-bold text-[#39030F]">
                                                    {formatCurrency(
                                                        editingQuotation.total_amount
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs text-[#887760]">
                                                Total is calculated automatically by
                                                the backend from quotation items.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CLOSE */}
                            <div className="mt-7 flex justify-end border-t border-[#E8DED0] pt-5">
                                <button
                                    type="button"
                                    onClick={closeQuotationForm}
                                    className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A] hover:border-[#BFAE9D]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT ITEM MODAL */}
            {showItemForm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E8DED0] px-6 py-5">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B28A16]">
                                    Quotation Service
                                </p>

                                <h3
                                    className="mt-1 text-2xl font-semibold text-[#39030F]"
                                    style={{
                                        fontFamily: "Georgia, serif",
                                    }}
                                >
                                    {editingItem
                                        ? "Edit Service"
                                        : "Add Service"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowItemForm(false);
                                    setEditingItem(null);
                                    setItemForm(emptyItemForm);
                                }}
                                disabled={savingItem}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0D4C7] bg-white text-[#6D5A61]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form
                            onSubmit={saveItem}
                            className="p-6"
                        >
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Service Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={itemForm.service_name}
                                        onChange={(event) =>
                                            setItemForm(
                                                (previous) => ({
                                                    ...previous,
                                                    service_name:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        placeholder="Décor & Styling"
                                        required
                                        className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm outline-none focus:border-[#D6A928]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Description
                                    </label>

                                    <textarea
                                        value={itemForm.description}
                                        onChange={(event) =>
                                            setItemForm(
                                                (previous) => ({
                                                    ...previous,
                                                    description:
                                                        event.target.value,
                                                })
                                            )
                                        }
                                        rows={3}
                                        placeholder="Describe the service..."
                                        className="w-full resize-none rounded-xl border border-[#DED2C5] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Quantity *
                                        </label>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={itemForm.quantity}
                                            onChange={(event) =>
                                                setItemForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        quantity:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm outline-none focus:border-[#D6A928]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                            Unit Price *
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={itemForm.unit_price}
                                            onChange={(event) =>
                                                setItemForm(
                                                    (previous) => ({
                                                        ...previous,
                                                        unit_price:
                                                            event.target.value,
                                                    })
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm outline-none focus:border-[#D6A928]"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#DCCEA0] bg-[#FBF4DD] p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#75655C]">
                                            Item Amount
                                        </span>

                                        <span className="font-serif text-xl font-bold text-[#39030F]">
                                            {formatCurrency(
                                                Number(
                                                    itemForm.quantity || 0
                                                ) *
                                                Number(
                                                    itemForm.unit_price || 0
                                                )
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#E8DED0] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowItemForm(false);
                                        setEditingItem(null);
                                        setItemForm(emptyItemForm);
                                    }}
                                    disabled={savingItem}
                                    className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingItem}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A0618] disabled:opacity-60"
                                >
                                    {savingItem ? (
                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingItem ? (
                                                <Pencil size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}

                                            {editingItem
                                                ? "Update Service"
                                                : "Add Service"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW QUOTATION MODAL */}
            {selectedQuotation && (
                <QuotationDetailsModal
                    quotation={selectedQuotation}
                    events={events}
                    customers={customers}
                    items={items}
                    itemsLoading={itemsLoading}
                    onClose={() =>
                        setSelectedQuotation(null)
                    }
                    onEdit={() => {
                        setSelectedQuotation(null);
                        openEditQuotation(
                            selectedQuotation.id
                        );
                    }}
                />
            )}

            {/* DELETE QUOTATION */}
            {deleteQuotation && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] p-6 shadow-2xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <Trash2 size={25} />
                        </div>

                        <h3
                            className="mt-5 text-2xl font-semibold text-[#39030F]"
                            style={{
                                fontFamily: "Georgia, serif",
                            }}
                        >
                            Delete Quotation?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#6E5C63]">
                            You are about to delete{" "}
                            <span className="font-semibold text-[#39030F]">
                                {
                                    deleteQuotation.quotation_number
                                }
                            </span>
                            .
                        </p>

                        <p className="mt-2 text-xs leading-5 text-[#8A7A70]">
                            The quotation and its quotation items will
                            be removed according to the backend delete
                            operation.
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteQuotation(null)
                                }
                                disabled={deleting}
                                className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDeleteQuotation}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Quotation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE ITEM */}
            {deleteItem && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] p-6 shadow-2xl">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <Trash2 size={25} />
                        </div>

                        <h3
                            className="mt-5 text-2xl font-semibold text-[#39030F]"
                            style={{
                                fontFamily: "Georgia, serif",
                            }}
                        >
                            Remove Service?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#6E5C63]">
                            Remove{" "}
                            <span className="font-semibold text-[#39030F]">
                                {deleteItem.service_name}
                            </span>{" "}
                            from this quotation?
                        </p>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteItem(null)
                                }
                                disabled={deleting}
                                className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A]"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDeleteItem}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Remove Service
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MobileInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-5 rounded-xl bg-[#FCFAF7] p-3">
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                {label}
            </span>

            <span className="text-right text-sm font-medium text-[#39030F]">
                {value}
            </span>
        </div>
    );
}

function QuotationDetailsModal({
    quotation,
    events,
    customers,
    items,
    itemsLoading,
    onClose,
    onEdit,
}: {
    quotation: Quotation;
    events: Event[];
    customers: Customer[];
    items: QuotationItem[];
    itemsLoading: boolean;
    onClose: () => void;
    onEdit: () => void;
}) {
    const event = events.find(
        (item) => item.id === quotation.event_id
    );

    const customer = event
        ? customers.find(
            (item) => item.id === event.customer_id
        )
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] shadow-2xl">
                <div className="sticky top-0 z-20 flex items-start justify-between border-b border-[#E8DED0] bg-[#FBF7F0] px-6 py-5 md:px-7">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B28A16]">
                            Quotation Details
                        </p>

                        <h2
                            className="mt-1 text-3xl font-semibold text-[#39030F]"
                            style={{
                                fontFamily: "Georgia, serif",
                            }}
                        >
                            {quotation.quotation_number}
                        </h2>

                        <p className="mt-1 text-sm text-[#817168]">
                            Created {formatDate(quotation.created_at)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0D4C7] bg-white text-[#6D5A61] hover:border-[#D6A928]"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="p-6 md:p-7">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <DetailBox
                            icon={<Users size={17} />}
                            label="Client"
                            value={
                                customer?.full_name ||
                                (event
                                    ? `Client #${event.customer_id}`
                                    : "Unknown Client")
                            }
                        />

                        <DetailBox
                            icon={<CalendarDays size={17} />}
                            label="Event"
                            value={
                                event?.event_type ||
                                `Event #${quotation.event_id}`
                            }
                        />

                        <DetailBox
                            icon={<CalendarDays size={17} />}
                            label="Event Date"
                            value={
                                event
                                    ? formatDate(event.event_date)
                                    : "—"
                            }
                        />

                        <DetailBox
                            label="Location"
                            value={
                                event?.location || "—"
                            }
                        />

                        <DetailBox
                            label="Venue"
                            value={event?.venue || "—"}
                        />

                        <DetailBox
                            label="Valid Until"
                            value={formatDate(
                                quotation.valid_until
                            )}
                        />
                    </div>

                    <div className="mt-7">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B28A16]">
                                    Services
                                </p>

                                <h3
                                    className="mt-1 text-2xl font-semibold text-[#39030F]"
                                    style={{
                                        fontFamily: "Georgia, serif",
                                    }}
                                >
                                    Quotation Items
                                </h3>
                            </div>

                            <span
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                                    quotation.status
                                )}`}
                            >
                                {statusLabel(quotation.status)}
                            </span>
                        </div>

                        {itemsLoading ? (
                            <div className="mt-5 space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-16 animate-pulse rounded-xl bg-[#F3EDE5]"
                                    />
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="mt-5 rounded-2xl border border-dashed border-[#D8CABB] bg-white p-8 text-center">
                                <FileText
                                    size={27}
                                    className="mx-auto text-[#B28A16]"
                                />

                                <p className="mt-3 font-semibold text-[#39030F]">
                                    No quotation items
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 overflow-hidden rounded-2xl border border-[#E8DED0] bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="bg-[#FCF8F2]">
                                            <tr className="border-b border-[#E8DED0]">
                                                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[#806E75]">
                                                    Service
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[#806E75]">
                                                    Description
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[#806E75]">
                                                    Qty
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-[#806E75]">
                                                    Rate
                                                </th>

                                                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.12em] text-[#806E75]">
                                                    Amount
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-[#F0E9E1] last:border-0"
                                                >
                                                    <td className="px-4 py-4 text-sm font-semibold text-[#39030F]">
                                                        {item.service_name}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm text-[#6E5C63]">
                                                        {item.description ||
                                                            "—"}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {item.quantity}
                                                    </td>

                                                    <td className="px-4 py-4 text-sm">
                                                        {formatCurrency(
                                                            item.unit_price
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-4 text-right text-sm font-bold text-[#39030F]">
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {quotation.notes && (
                        <div className="mt-6 rounded-2xl border border-[#E7DBCE] bg-white p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5F4E55]">
                                {quotation.notes}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-sm rounded-2xl border border-[#DCCEA0] bg-[#FBF4DD] p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[#75655C]">
                                    Total Amount
                                </span>

                                <span className="font-serif text-2xl font-bold text-[#39030F]">
                                    {formatCurrency(
                                        quotation.total_amount
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8DED0] pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A]"
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4A0618]"
                        >
                            <Pencil size={16} />
                            Edit Quotation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailBox({
    icon,
    label,
    value,
}: {
    icon?: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#E7DBCE] bg-white p-4">
            <div className="flex items-center gap-2 text-[#B28A16]">
                {icon}
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                    {label}
                </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-[#39030F]">
                {value}
            </p>
        </div>
    );
}