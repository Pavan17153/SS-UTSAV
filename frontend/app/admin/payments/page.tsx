"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowDownLeft,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    CreditCard,
    Edit3,
    Eye,
    FileText,
    IndianRupee,
    Menu,
    Plus,
    RefreshCw,
    Search,
    Wallet,
    X,
    XCircle,
    Trash2,
    AlertCircle,
} from "lucide-react";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

type PaymentMethod =
    | "CASH"
    | "UPI"
    | "CARD"
    | "BANK_TRANSFER"
    | "CHEQUE"
    | "OTHER";

type EventStatus =
    | "PLANNING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

type Payment = {
    id: number;
    event_id: number;
    amount: number | string;
    payment_date: string;
    payment_method: PaymentMethod | string;
    reference_number: string | null;
    notes: string | null;
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
    status: EventStatus | string;
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

type PaymentForm = {
    event_id: string;
    amount: string;
    payment_date: string;
    payment_method: PaymentMethod;
    reference_number: string;
    notes: string;
};

const paymentMethods: PaymentMethod[] = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "CHEQUE",
    "OTHER",
];


function clearAuthAndRedirect() {
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

function formatCurrency(value: number | string | null | undefined) {
    const amount = Number(value || 0);

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

    const datePart = value.split("T")[0];

    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(year, month - 1, day));
}

function formatDateTime(value: string | null | undefined) {
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
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatPaymentMethod(method: string) {
    return method
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractList<T>(
    data: any,
    possibleKeys: string[] = []
): T[] {
    if (Array.isArray(data)) {
        return data;
    }

    for (const key of possibleKeys) {
        if (Array.isArray(data?.[key])) {
            return data[key];
        }
    }

    return [];
}

function extractSingle<T>(data: any, possibleKeys: string[] = []): T {
    for (const key of possibleKeys) {
        if (data?.[key]) {
            return data[key];
        }
    }

    return data as T;
}

function paymentMethodClasses(method: string) {
    switch (method) {
        case "UPI":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "BANK_TRANSFER":
            return "bg-purple-50 text-purple-700 border-purple-200";

        case "CARD":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "CASH":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "CHEQUE":
            return "bg-orange-50 text-orange-700 border-orange-200";

        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
}

function emptyForm(): PaymentForm {
    return {
        event_id: "",
        amount: "",
        payment_date: new Date().toISOString().slice(0, 10),
        payment_method: "UPI",
        reference_number: "",
        notes: "",
    };
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [search, setSearch] = useState("");
    const [methodFilter, setMethodFilter] = useState("All");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showFormModal, setShowFormModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedPayment, setSelectedPayment] =
        useState<Payment | null>(null);

    const [editingPayment, setEditingPayment] =
        useState<Payment | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Payment | null>(null);

    const [form, setForm] = useState<PaymentForm>(emptyForm());

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const customerMap = useMemo(() => {
        const map = new Map<number, Customer>();

        customers.forEach((customer) => {
            map.set(customer.id, customer);
        });

        return map;
    }, [customers]);

    const eventMap = useMemo(() => {
        const map = new Map<number, Event>();

        events.forEach((event) => {
            map.set(event.id, event);
        });

        return map;
    }, [events]);

    const getCustomerName = (eventId: number) => {
        const event = eventMap.get(eventId);

        if (!event) {
            return "Unknown Client";
        }

        return (
            customerMap.get(event.customer_id)?.full_name ||
            `Customer #${event.customer_id}`
        );
    };

    const getEventName = (eventId: number) => {
        const event = eventMap.get(eventId);

        if (!event) {
            return `Event #${eventId}`;
        }

        return event.event_type;
    };

    async function loadData(showRefresh = false) {
        try {
            setError("");

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [paymentsResponse, eventsResponse, customersResponse] =
                await Promise.all([
                    adminApi.get<any>("/api/payments/"),
                    adminApi.get<any>("/api/events/"),
                    adminApi.get<any>("/api/customers/"),
                ]);

            const paymentList = extractList<Payment>(paymentsResponse, [
                "payments",
                "items",
                "data",
            ]);

            const eventList = extractList<Event>(eventsResponse, [
                "events",
                "items",
                "data",
            ]);

            const customerList = extractList<Customer>(customersResponse, [
                "customers",
                "clients",
                "items",
                "data",
            ]);

            setPayments(paymentList);
            setEvents(eventList);
            setCustomers(customerList);
        } catch (err: any) {
            setError(err?.message || "Failed to load payment data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!success) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccess("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [success]);

    const stats = useMemo(() => {
        const totalReceived = payments.reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
        );

        const paymentCount = payments.length;

        const averagePayment =
            paymentCount > 0 ? totalReceived / paymentCount : 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayReceived = payments
            .filter((payment) => {
                const date = new Date(payment.payment_date);
                date.setHours(0, 0, 0, 0);

                return date.getTime() === today.getTime();
            })
            .reduce(
                (sum, payment) => sum + Number(payment.amount || 0),
                0
            );

        return {
            totalReceived,
            paymentCount,
            averagePayment,
            todayReceived,
        };
    }, [payments]);

    const filteredPayments = useMemo(() => {
        const query = search.toLowerCase().trim();

        return payments.filter((payment) => {
            const event = eventMap.get(payment.event_id);

            const clientName = event
                ? customerMap.get(event.customer_id)?.full_name || ""
                : "";

            const eventType = event?.event_type || "";

            const matchesSearch =
                !query ||
                String(payment.id).includes(query) ||
                String(payment.event_id).includes(query) ||
                payment.payment_method
                    .toLowerCase()
                    .includes(query) ||
                (payment.reference_number || "")
                    .toLowerCase()
                    .includes(query) ||
                clientName.toLowerCase().includes(query) ||
                eventType.toLowerCase().includes(query);

            const matchesMethod =
                methodFilter === "All" ||
                payment.payment_method === methodFilter;

            return matchesSearch && matchesMethod;
        });
    }, [
        payments,
        search,
        methodFilter,
        eventMap,
        customerMap,
    ]);

    function openCreateModal() {
        setEditingPayment(null);
        setForm(emptyForm());
        setError("");
        setShowFormModal(true);
    }

    function openEditModal(payment: Payment) {
        setEditingPayment(payment);

        setForm({
            event_id: String(payment.event_id),
            amount: String(payment.amount),
            payment_date: payment.payment_date
                ? payment.payment_date.split("T")[0]
                : "",
            payment_method:
                (payment.payment_method as PaymentMethod) || "UPI",
            reference_number: payment.reference_number || "",
            notes: payment.notes || "",
        });

        setError("");
        setShowFormModal(true);
    }

    async function openViewModal(payment: Payment) {
        try {
            setError("");

            const response = await adminApi.get<any>(
                `/api/payments/${payment.id}`
            );

            const detail = extractSingle<Payment>(response, [
                "payment",
                "data",
            ]);

            setSelectedPayment(detail);
            setShowViewModal(true);
        } catch (err: any) {
            setError(err?.message || "Failed to load payment details.");
        }
    }

    function openDeleteModal(payment: Payment) {
        setDeleteTarget(payment);
        setShowDeleteModal(true);
    }

    function closeFormModal() {
        if (saving) {
            return;
        }

        setShowFormModal(false);
        setEditingPayment(null);
        setForm(emptyForm());
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const eventId = Number(form.event_id);
        const amount = Number(form.amount);

        if (!eventId) {
            setError("Please select an event.");
            return;
        }

        if (!amount || amount <= 0) {
            setError("Payment amount must be greater than 0.");
            return;
        }

        if (!form.payment_date) {
            setError("Please select a payment date.");
            return;
        }

        const payload = {
            event_id: eventId,
            amount,
            payment_date: form.payment_date,
            payment_method: form.payment_method,
            reference_number:
                form.reference_number.trim() || null,
            notes: form.notes.trim() || null,
        };

        try {
            setSaving(true);

            if (editingPayment) {
                const response = await adminApi.put<any>(
                    `/api/payments/${editingPayment.id}`,
                    payload
                );

                const updatedPayment = extractSingle<Payment>(
                    response,
                    ["payment", "data"]
                );

                setPayments((current) =>
                    current.map((payment) =>
                        payment.id === editingPayment.id
                            ? updatedPayment
                            : payment
                    )
                );

                setSuccess("Payment updated successfully.");
            } else {
                const response = await adminApi.post<any>(
                    "/api/payments/",
                    payload
                );

                const newPayment = extractSingle<Payment>(
                    response,
                    ["payment", "data"]
                );

                setPayments((current) => [
                    newPayment,
                    ...current,
                ]);

                setSuccess("Payment recorded successfully.");
            }

            closeFormModal();
        } catch (err: any) {
            setError(err?.message || "Failed to save payment.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await adminApi.delete<any>(
                `/api/payments/${deleteTarget.id}`
            );

            setPayments((current) =>
                current.filter(
                    (payment) => payment.id !== deleteTarget.id
                )
            );

            setShowDeleteModal(false);
            setDeleteTarget(null);

            setSuccess("Payment deleted successfully.");
        } catch (err: any) {
            setError(err?.message || "Failed to delete payment.");
        } finally {
            setDeleting(false);
        }
    }

    function logout() {
        clearAuthAndRedirect();
    }

    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#35030F]">
            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* Main Content */}
            <main className="min-h-screen lg:ml-[270px]">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eadfce] bg-white px-5 shadow-sm md:px-8">
                    <div>
                        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08B27] sm:block">
                            Finance
                        </p>

                        <h1 className="font-serif text-xl text-[#4A0618] md:text-2xl">
                            Payments Management
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="rounded-lg border border-[#D6A928]/40 bg-[#4A0618] p-2 text-[#D6A928] lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={21} />
                        </button>

                        <div className="hidden items-center gap-4 md:flex">
                            <Clock3
                                size={19}
                                className="text-[#806B72]"
                            />

                            <div className="h-8 w-px bg-[#eadfce]" />

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A0618] font-serif text-sm font-bold text-[#D6A928]">
                                    SA
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-[#4A0618]">
                                        SS Utsav Admin
                                    </div>

                                    <div className="text-[10px] text-[#9A8188]">
                                        Administrator
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-5 py-7 md:px-8 md:py-9">
                    {/* Page Heading */}
                    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B08B27]">
                                Financial Overview
                            </p>

                            <h2 className="font-serif text-3xl text-[#4A0618] sm:text-4xl">
                                Payment Management
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#765E65]">
                                Record event payments, track received
                                amounts, and maintain accurate financial
                                records.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => loadData(true)}
                                disabled={refreshing}
                                className="flex items-center justify-center gap-2 rounded-lg border border-[#e2d5c7] bg-white px-4 py-3 text-sm font-medium text-[#4A0618] transition hover:border-[#B08B27] disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                <span className="hidden sm:inline">
                                    Refresh
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35030F]"
                            >
                                <Plus size={17} />
                                Record Payment
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0"
                            />

                            <div className="flex-1">
                                <p className="font-medium">
                                    Something went wrong
                                </p>

                                <p className="mt-0.5 text-xs">
                                    {error}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                className="text-red-500 hover:text-red-700"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <CheckCircle2 size={18} />

                            <span>{success}</span>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Received"
                            value={formatCurrency(
                                stats.totalReceived
                            )}
                            subtitle={`${stats.paymentCount} payment records`}
                            icon={<IndianRupee size={21} />}
                        />

                        <StatCard
                            title="Payments Recorded"
                            value={String(stats.paymentCount)}
                            subtitle="Total transactions"
                            icon={<Wallet size={21} />}
                        />

                        <StatCard
                            title="Average Payment"
                            value={formatCurrency(
                                stats.averagePayment
                            )}
                            subtitle="Average transaction value"
                            icon={<CreditCard size={21} />}
                        />

                        <StatCard
                            title="Today's Collection"
                            value={formatCurrency(
                                stats.todayReceived
                            )}
                            subtitle="Payments received today"
                            icon={<ArrowDownLeft size={21} />}
                        />
                    </div>

                    {/* Payment Table */}
                    <section className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-[0_8px_35px_rgba(74,6,24,0.04)]">
                        {/* Toolbar */}
                        <div className="border-b border-[#eee5d9] p-5 sm:p-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <h3 className="font-serif text-xl text-[#4A0618]">
                                        Payment Records
                                    </h3>

                                    <p className="mt-1 text-xs text-[#927980]">
                                        Manage all payments recorded
                                        against events.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <div className="relative">
                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A38A90]"
                                        />

                                        <input
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search payments..."
                                            className="h-10 w-full rounded-lg border border-[#e7dbcd] bg-[#FCFAF6] pl-10 pr-4 text-sm outline-none transition focus:border-[#B08B27] sm:w-[280px]"
                                        />
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={methodFilter}
                                            onChange={(e) =>
                                                setMethodFilter(
                                                    e.target.value
                                                )
                                            }
                                            className="h-10 w-full appearance-none rounded-lg border border-[#e7dbcd] bg-[#FCFAF6] pl-4 pr-10 text-sm outline-none focus:border-[#B08B27] sm:w-[180px]"
                                        >
                                            <option value="All">
                                                All Methods
                                            </option>

                                            {paymentMethods.map(
                                                (method) => (
                                                    <option
                                                        key={method}
                                                        value={method}
                                                    >
                                                        {formatPaymentMethod(
                                                            method
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <ChevronDown
                                            size={16}
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E747B]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="px-6 py-20 text-center">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D6A928]/30 border-t-[#4A0618]" />

                                <p className="mt-4 text-sm text-[#806B72]">
                                    Loading payment records...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto xl:block">
                                    <table className="w-full min-w-[1050px]">
                                        <thead>
                                            <tr className="border-b border-[#eee5d9] bg-[#FCFAF6] text-left">
                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Payment
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Client / Event
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Amount
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Method
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Payment Date
                                                </th>

                                                <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredPayments.map(
                                                (payment) => {
                                                    const event =
                                                        eventMap.get(
                                                            payment.event_id
                                                        );

                                                    const customer =
                                                        event
                                                            ? customerMap.get(
                                                                event.customer_id
                                                            )
                                                            : null;

                                                    return (
                                                        <tr
                                                            key={
                                                                payment.id
                                                            }
                                                            className="border-b border-[#f0e8de] transition hover:bg-[#FCFAF6]"
                                                        >
                                                            <td className="px-6 py-5">
                                                                <div className="font-medium text-[#4A0618]">
                                                                    PAY-
                                                                    {String(
                                                                        payment.id
                                                                    ).padStart(
                                                                        4,
                                                                        "0"
                                                                    )}
                                                                </div>

                                                                <div className="mt-1 text-[11px] text-[#9A8188]">
                                                                    Event #
                                                                    {
                                                                        payment.event_id
                                                                    }
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="text-sm font-medium text-[#4A0618]">
                                                                    {customer?.full_name ||
                                                                        "Unknown Client"}
                                                                </div>

                                                                <div className="mt-1 text-xs text-[#91777F]">
                                                                    {event?.event_type ||
                                                                        "Event"}
                                                                </div>

                                                                {event?.venue && (
                                                                    <div className="mt-1 text-[11px] text-[#A18B91]">
                                                                        {
                                                                            event.venue
                                                                        }
                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="text-sm font-semibold text-[#4A0618]">
                                                                    {formatCurrency(
                                                                        payment.amount
                                                                    )}
                                                                </div>

                                                                <div className="mt-1 text-[11px] text-[#8D757C]">
                                                                    Recorded
                                                                    payment
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${paymentMethodClasses(
                                                                        payment.payment_method
                                                                    )}`}
                                                                >
                                                                    {formatPaymentMethod(
                                                                        payment.payment_method
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-2 text-sm text-[#665159]">
                                                                    <CalendarDays
                                                                        size={
                                                                            14
                                                                        }
                                                                    />

                                                                    {formatDate(
                                                                        payment.payment_date
                                                                    )}
                                                                </div>
                                                            </td>

                                                            <td className="px-6 py-5">
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openViewModal(
                                                                                payment
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dacd] px-3 py-2 text-xs font-medium text-[#4A0618] transition hover:border-[#B08B27] hover:bg-[#FCFAF6]"
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        View
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                payment
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dacd] px-3 py-2 text-xs font-medium text-[#4A0618] transition hover:border-[#B08B27] hover:bg-[#FCFAF6]"
                                                                    >
                                                                        <Edit3
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                        Edit
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openDeleteModal(
                                                                                payment
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50"
                                                                        aria-label="Delete payment"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
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

                                {/* Mobile / Tablet Cards */}
                                <div className="divide-y divide-[#eee5d9] xl:hidden">
                                    {filteredPayments.map(
                                        (payment) => {
                                            const event =
                                                eventMap.get(
                                                    payment.event_id
                                                );

                                            const customer =
                                                event
                                                    ? customerMap.get(
                                                        event.customer_id
                                                    )
                                                    : null;

                                            return (
                                                <div
                                                    key={payment.id}
                                                    className="p-5"
                                                >
                                                    <div className="mb-4 flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="font-medium text-[#4A0618]">
                                                                PAY-
                                                                {String(
                                                                    payment.id
                                                                ).padStart(
                                                                    4,
                                                                    "0"
                                                                )}
                                                            </div>

                                                            <div className="mt-1 text-xs text-[#927980]">
                                                                {
                                                                    customer?.full_name
                                                                }
                                                            </div>
                                                        </div>

                                                        <span
                                                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${paymentMethodClasses(
                                                                payment.payment_method
                                                            )}`}
                                                        >
                                                            {formatPaymentMethod(
                                                                payment.payment_method
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-3 text-sm">
                                                        <div>
                                                            <span className="text-[#9A8188]">
                                                                Event:{" "}
                                                            </span>

                                                            <span className="font-medium text-[#4A0618]">
                                                                {event?.event_type ||
                                                                    `Event #${payment.event_id}`}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="rounded-lg bg-[#FCFAF6] p-3">
                                                                <div className="text-[10px] uppercase tracking-wider text-[#9A8188]">
                                                                    Amount
                                                                </div>

                                                                <div className="mt-1 font-semibold text-[#4A0618]">
                                                                    {formatCurrency(
                                                                        payment.amount
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="rounded-lg bg-[#FCFAF6] p-3">
                                                                <div className="text-[10px] uppercase tracking-wider text-[#9A8188]">
                                                                    Date
                                                                </div>

                                                                <div className="mt-1 font-semibold text-[#4A0618]">
                                                                    {formatDate(
                                                                        payment.payment_date
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {payment.reference_number && (
                                                            <div className="rounded-lg border border-[#eadfce] bg-[#FFFCF5] p-3 text-xs">
                                                                <span className="text-[#927980]">
                                                                    Reference:{" "}
                                                                </span>

                                                                <span className="font-medium text-[#4A0618]">
                                                                    {
                                                                        payment.reference_number
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    payment
                                                                )
                                                            }
                                                            className="flex items-center justify-center gap-1 rounded-lg border border-[#e5d8ca] py-2.5 text-xs font-medium text-[#4A0618]"
                                                        >
                                                            <Eye
                                                                size={14}
                                                            />
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    payment
                                                                )
                                                            }
                                                            className="flex items-center justify-center gap-1 rounded-lg border border-[#e5d8ca] py-2.5 text-xs font-medium text-[#4A0618]"
                                                        >
                                                            <Edit3
                                                                size={14}
                                                            />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    payment
                                                                )
                                                            }
                                                            className="flex items-center justify-center gap-1 rounded-lg border border-red-200 py-2.5 text-xs font-medium text-red-600"
                                                        >
                                                            <Trash2
                                                                size={14}
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                {filteredPayments.length === 0 && (
                                    <div className="px-6 py-16 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F0E4] text-[#B08B27]">
                                            <Search size={20} />
                                        </div>

                                        <h4 className="mt-4 font-serif text-lg text-[#4A0618]">
                                            No payments found
                                        </h4>

                                        <p className="mt-1 text-sm text-[#927980]">
                                            Try changing your search or
                                            payment method filter.
                                        </p>
                                    </div>
                                )}

                                <div className="border-t border-[#eee5d9] px-5 py-4 text-xs text-[#927980] sm:px-6">
                                    Showing{" "}
                                    {filteredPayments.length} of{" "}
                                    {payments.length} payment records
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* View Payment Modal */}
            {showViewModal && selectedPayment && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#eee5d9] px-6 py-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B08B27]">
                                    Payment Details
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                    PAY-
                                    {String(
                                        selectedPayment.id
                                    ).padStart(4, "0")}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowViewModal(false)
                                }
                                className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <div className="flex items-center justify-between rounded-xl bg-[#FCFAF6] p-4">
                                <div>
                                    <div className="text-xs text-[#927980]">
                                        Payment Method
                                    </div>

                                    <span
                                        className={`mt-2 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${paymentMethodClasses(
                                            selectedPayment.payment_method
                                        )}`}
                                    >
                                        {formatPaymentMethod(
                                            selectedPayment.payment_method
                                        )}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-[#927980]">
                                        Event
                                    </div>

                                    <div className="mt-1 font-medium text-[#4A0618]">
                                        #
                                        {
                                            selectedPayment.event_id
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Detail
                                    label="Client"
                                    value={getCustomerName(
                                        selectedPayment.event_id
                                    )}
                                />

                                <Detail
                                    label="Event"
                                    value={getEventName(
                                        selectedPayment.event_id
                                    )}
                                />

                                <Detail
                                    label="Amount"
                                    value={formatCurrency(
                                        selectedPayment.amount
                                    )}
                                />

                                <Detail
                                    label="Payment Date"
                                    value={formatDate(
                                        selectedPayment.payment_date
                                    )}
                                />

                                <Detail
                                    label="Reference Number"
                                    value={
                                        selectedPayment.reference_number ||
                                        "—"
                                    }
                                />

                                <Detail
                                    label="Recorded At"
                                    value={formatDateTime(
                                        selectedPayment.payment_date
                                    )}
                                />
                            </div>

                            {selectedPayment.notes && (
                                <div className="border-t border-[#eee5d9] pt-5">
                                    <div className="mb-3 flex items-center gap-2 font-serif text-lg text-[#4A0618]">
                                        <FileText
                                            size={17}
                                            className="text-[#B08B27]"
                                        />

                                        Payment Notes
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] bg-[#FCFAF6] p-4 text-sm leading-6 text-[#665159]">
                                        {selectedPayment.notes}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-[#eee5d9] pt-5">
                                <div className="rounded-xl border border-[#eadfce]">
                                    <div className="flex items-center justify-between px-4 py-4">
                                        <span className="font-semibold text-[#4A0618]">
                                            Payment Amount
                                        </span>

                                        <span className="font-serif text-xl font-semibold text-[#B08B27]">
                                            {formatCurrency(
                                                selectedPayment.amount
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-[#eee5d9] pt-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        openEditModal(
                                            selectedPayment
                                        );
                                    }}
                                    className="flex items-center gap-2 rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white"
                                >
                                    <Edit3 size={15} />
                                    Edit Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Payment Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#eee5d9] px-6 py-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B08B27]">
                                    Finance
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                    {editingPayment
                                        ? "Edit Payment"
                                        : "Record Payment"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                disabled={saving}
                                className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4] disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5 p-6"
                        >
                            {events.length === 0 ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <div className="flex gap-3">
                                        <AlertCircle
                                            size={19}
                                            className="mt-0.5 text-amber-600"
                                        />

                                        <div>
                                            <p className="text-sm font-semibold text-amber-800">
                                                No events available
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                                A payment must be linked
                                                to an existing event.
                                                Create an event first.
                                            </p>

                                            <Link
                                                href="/admin/events"
                                                className="mt-3 inline-flex rounded-lg bg-[#4A0618] px-4 py-2 text-xs font-semibold text-white"
                                            >
                                                Go to Events
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block">
                                                <span className="mb-2 block text-xs font-medium text-[#5E474E]">
                                                    Event
                                                    <span className="ml-1 text-[#B08B27]">
                                                        *
                                                    </span>
                                                </span>

                                                <div className="relative">
                                                    <select
                                                        required
                                                        value={
                                                            form.event_id
                                                        }
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                event_id:
                                                                    e
                                                                        .target
                                                                        .value,
                                                            })
                                                        }
                                                        className="h-11 w-full appearance-none rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 pr-10 text-sm text-[#4A0618] outline-none focus:border-[#B08B27]"
                                                    >
                                                        <option value="">
                                                            Select event
                                                        </option>

                                                        {events.map(
                                                            (event) => (
                                                                <option
                                                                    key={
                                                                        event.id
                                                                    }
                                                                    value={
                                                                        event.id
                                                                    }
                                                                >
                                                                    {event.event_type}{" "}
                                                                    —{" "}
                                                                    {getCustomerName(
                                                                        event.id
                                                                    )}{" "}
                                                                    —{" "}
                                                                    {formatDate(
                                                                        event.event_date
                                                                    )}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>

                                                    <ChevronDown
                                                        size={16}
                                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E747B]"
                                                    />
                                                </div>
                                            </label>
                                        </div>

                                        <Field
                                            label="Payment Amount"
                                            required
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    amount: value,
                                                })
                                            }
                                            placeholder="0"
                                        />

                                        <SelectField
                                            label="Payment Method"
                                            value={
                                                form.payment_method
                                            }
                                            options={
                                                paymentMethods
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    payment_method:
                                                        value as PaymentMethod,
                                                })
                                            }
                                        />

                                        <Field
                                            label="Payment Date"
                                            required
                                            type="date"
                                            value={
                                                form.payment_date
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    payment_date:
                                                        value,
                                                })
                                            }
                                        />

                                        <Field
                                            label="Reference Number"
                                            value={
                                                form.reference_number
                                            }
                                            onChange={(value) =>
                                                setForm({
                                                    ...form,
                                                    reference_number:
                                                        value,
                                                })
                                            }
                                            placeholder="UPI / bank reference"
                                        />

                                        <div className="sm:col-span-2">
                                            <label className="block">
                                                <span className="mb-2 block text-xs font-medium text-[#5E474E]">
                                                    Notes
                                                </span>

                                                <textarea
                                                    value={form.notes}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            notes: e
                                                                .target
                                                                .value,
                                                        })
                                                    }
                                                    rows={4}
                                                    placeholder="Additional payment notes..."
                                                    className="w-full resize-none rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 py-3 text-sm text-[#4A0618] outline-none transition placeholder:text-[#B3A0A4] focus:border-[#B08B27]"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {form.event_id && (
                                        <div className="rounded-xl border border-[#eadfce] bg-[#FFFCF5] p-4">
                                            <div className="flex items-start gap-3">
                                                <CalendarDays
                                                    size={18}
                                                    className="mt-0.5 text-[#B08B27]"
                                                />

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#927980]">
                                                        Selected Event
                                                    </p>

                                                    <p className="mt-1 font-serif text-lg text-[#4A0618]">
                                                        {getEventName(
                                                            Number(
                                                                form.event_id
                                                            )
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#806B72]">
                                                        {getCustomerName(
                                                            Number(
                                                                form.event_id
                                                            )
                                                        )}
                                                        {" • "}
                                                        {formatDate(
                                                            eventMap.get(
                                                                Number(
                                                                    form.event_id
                                                                )
                                                            )
                                                                ?.event_date
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col-reverse gap-3 border-t border-[#eee5d9] pt-5 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={
                                                closeFormModal
                                            }
                                            disabled={saving}
                                            className="rounded-lg border border-[#e2d5c7] px-5 py-3 text-sm font-medium text-[#4A0618] disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex items-center justify-center gap-2 rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {saving && (
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            )}

                                            {saving
                                                ? "Saving..."
                                                : editingPayment
                                                    ? "Update Payment"
                                                    : "Save Payment"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteModal && deleteTarget && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="border-b border-[#eee5d9] px-6 py-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-500">
                                        Delete Payment
                                    </p>

                                    <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                        Confirm deletion
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    disabled={deleting}
                                    className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4]"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                <div className="flex gap-3">
                                    <XCircle
                                        size={20}
                                        className="mt-0.5 text-red-500"
                                    />

                                    <div className="text-sm">
                                        <p className="font-medium text-red-800">
                                            You are about to delete this
                                            payment.
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-red-700">
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-[#eadfce] bg-[#FCFAF6] p-4">
                                <div className="text-xs text-[#927980]">
                                    Payment
                                </div>

                                <div className="mt-1 font-medium text-[#4A0618]">
                                    PAY-
                                    {String(
                                        deleteTarget.id
                                    ).padStart(4, "0")}
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-[#9A8188]">
                                            Amount
                                        </div>

                                        <div className="mt-1 font-semibold text-[#4A0618]">
                                            {formatCurrency(
                                                deleteTarget.amount
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-[#9A8188]">
                                            Method
                                        </div>

                                        <div className="mt-1 font-medium text-[#4A0618]">
                                            {formatPaymentMethod(
                                                deleteTarget.payment_method
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    disabled={deleting}
                                    className="rounded-lg border border-[#e2d5c7] px-5 py-3 text-sm font-medium text-[#4A0618]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {deleting && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    )}

                                    {deleting
                                        ? "Deleting..."
                                        : "Delete Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-[0_8px_30px_rgba(74,6,24,0.035)]">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                        {title}
                    </p>

                    <h3 className="mt-2 font-serif text-2xl text-[#4A0618]">
                        {value}
                    </h3>

                    <p className="mt-1 text-[11px] text-[#9A8188]">
                        {subtitle}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F1E3] text-[#B08B27]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#eee5d9] bg-[#FCFAF6] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9A8188]">
                {label}
            </div>

            <div className="mt-1 text-sm font-medium text-[#4A0618]">
                {value}
            </div>
        </div>
    );
}

function Field({
    label,
    required,
    type = "text",
    value,
    onChange,
    placeholder,
    min,
    step,
}: {
    label: string;
    required?: boolean;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    min?: string;
    step?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#5E474E]">
                {label}

                {required && (
                    <span className="ml-1 text-[#B08B27]">
                        *
                    </span>
                )}
            </span>

            <input
                required={required}
                type={type}
                min={min}
                step={step}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 text-sm text-[#4A0618] outline-none transition placeholder:text-[#B3A0A4] focus:border-[#B08B27]"
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#5E474E]">
                {label}
            </span>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 pr-10 text-sm text-[#4A0618] outline-none focus:border-[#B08B27]"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {formatPaymentMethod(option)}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E747B]"
                />
            </div>
        </label>
    );
}