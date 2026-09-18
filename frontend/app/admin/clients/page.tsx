"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    Mail,
    MapPin,
    Menu,
    Pencil,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";

import AdminSidebar from "@/app/components/admin/AdminSidebar";

const API_BASE_URL = "http://127.0.0.1:8000";

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

type CustomerForm = {
    full_name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
};

type NoticeType = "success" | "error";

const emptyForm: CustomerForm = {
    full_name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
};

function getToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return (
        localStorage.getItem("ss_utsav_access_token") ||
        sessionStorage.getItem("ss_utsav_access_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}

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

function formatDate(dateString: string | null | undefined) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return "C";
    }

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function normalizeCustomers(data: any): Customer[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.customers)) {
        return data.customers;
    }

    return [];
}

function normalizeCustomer(data: any): Customer | null {
    if (data?.customer) {
        return data.customer;
    }

    if (data?.id) {
        return data;
    }

    return null;
}

function StatCard({
    icon,
    label,
    value,
    description,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-[#E8DED0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7B6870]">
                        {label}
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#39030F]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-[#8A7A80]">{description}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF3DC] text-[#B28A16]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function ClientsPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [search, setSearch] = useState("");

    const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
    const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
    const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CustomerForm>(emptyForm);

    const [notice, setNotice] = useState<{
        type: NoticeType;
        message: string;
    } | null>(null);

    const [apiError, setApiError] = useState("");

    function showNotice(type: NoticeType, message: string) {
        setNotice({
            type,
            message,
        });

        window.setTimeout(() => {
            setNotice(null);
        }, 3500);
    }

    async function loadCustomers() {
        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        setLoading(true);
        setApiError("");

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(await getApiError(response));
            }

            const data = await response.json();

            setCustomers(normalizeCustomers(data));
        } catch (error: any) {
            setApiError(error?.message || "Unable to load clients.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return customers;
        }

        return customers.filter((customer) => {
            return (
                customer.full_name?.toLowerCase().includes(query) ||
                customer.phone?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.address?.toLowerCase().includes(query) ||
                String(customer.id).includes(query)
            );
        });
    }, [customers, search]);

    const totalClients = customers.length;

    const convertedClients = customers.filter(
        (customer) => customer.lead_id !== null
    ).length;

    const directClients = customers.filter(
        (customer) => customer.lead_id === null
    ).length;

    function openAddModal() {
        setEditCustomer(null);
        setForm(emptyForm);
        setShowForm(true);
    }

    function openEditModal(customer: Customer) {
        setEditCustomer(customer);

        setForm({
            full_name: customer.full_name || "",
            phone: customer.phone || "",
            email: customer.email || "",
            address: customer.address || "",
            notes: customer.notes || "",
        });

        setShowForm(true);
    }

    function closeFormModal() {
        if (saving) {
            return;
        }

        setShowForm(false);
        setEditCustomer(null);
        setForm(emptyForm);
    }

    function handleFormChange(
        field: keyof CustomerForm,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function saveCustomer(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        const fullName = form.full_name.trim();
        const phone = form.phone.trim();

        if (!fullName) {
            showNotice("error", "Full name is required.");
            return;
        }

        if (!phone) {
            showNotice("error", "Phone number is required.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                full_name: fullName,
                phone,
                email: form.email.trim() || null,
                address: form.address.trim() || null,
                notes: form.notes.trim() || null,
            };

            const isEditing = Boolean(editCustomer);

            const url = isEditing
                ? `${API_BASE_URL}/api/customers/${editCustomer!.id}`
                : `${API_BASE_URL}/api/customers/`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(await getApiError(response));
            }

            await response.json();

            await loadCustomers();

            setShowForm(false);
            setEditCustomer(null);
            setForm(emptyForm);

            showNotice(
                "success",
                isEditing
                    ? "Client updated successfully."
                    : "Client created successfully."
            );
        } catch (error: any) {
            showNotice(
                "error",
                error?.message ||
                (editCustomer
                    ? "Unable to update client."
                    : "Unable to create client.")
            );
        } finally {
            setSaving(false);
        }
    }

    async function viewCustomerDetails(customerId: number) {
        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/customers/${customerId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(await getApiError(response));
            }

            const data = await response.json();

            const customer = normalizeCustomer(data);

            if (!customer) {
                throw new Error("Client details were not returned by the server.");
            }

            setViewCustomer(customer);
        } catch (error: any) {
            showNotice(
                "error",
                error?.message || "Unable to load client details."
            );
        }
    }

    async function editCustomerDetails(customerId: number) {
        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/customers/${customerId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                logout();
                return;
            }

            if (!response.ok) {
                throw new Error(await getApiError(response));
            }

            const data = await response.json();

            const customer = normalizeCustomer(data);

            if (!customer) {
                throw new Error("Client details were not returned by the server.");
            }

            openEditModal(customer);
        } catch (error: any) {
            showNotice(
                "error",
                error?.message || "Unable to load client details."
            );
        }
    }

    async function confirmDeleteCustomer() {
        if (!deleteCustomer) {
            return;
        }

        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        const customerId = deleteCustomer.id;
        const customerName = deleteCustomer.full_name;

        setDeleting(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/customers/${customerId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            // ----------------------------------------------------
            // AUTH ERROR
            // ----------------------------------------------------

            if (response.status === 401) {
                logout();
                return;
            }

            // ----------------------------------------------------
            // CLIENT HAS LINKED EVENT
            // ----------------------------------------------------

            if (response.status === 409) {
                const errorMessage = await getApiError(response);

                throw new Error(errorMessage);
            }

            // ----------------------------------------------------
            // OTHER API ERRORS
            // ----------------------------------------------------

            if (!response.ok) {
                const errorMessage = await getApiError(response);

                throw new Error(errorMessage);
            }

            // ----------------------------------------------------
            // SUCCESS RESPONSE
            // ----------------------------------------------------

            const data = await response.json();

            console.log(
                "Client deleted successfully:",
                data
            );

            // ----------------------------------------------------
            // CLOSE DELETE MODAL
            // ----------------------------------------------------

            setDeleteCustomer(null);

            // ----------------------------------------------------
            // REFRESH CLIENT LIST
            // ----------------------------------------------------

            await loadCustomers();

            // ----------------------------------------------------
            // IMPORTANT:
            // If this customer came from a Lead, backend has
            // already restored that Lead to NEW.
            //
            // Response will contain:
            //
            // lead_restored: true
            // restored_lead_id: <id>
            //
            // ----------------------------------------------------

            if (
                data?.lead_restored === true &&
                data?.restored_lead_id
            ) {
                showNotice(
                    "success",
                    `${customerName} deleted successfully. Lead #${data.restored_lead_id} has been restored to NEW.`
                );
            } else {
                showNotice(
                    "success",
                    "Client deleted successfully."
                );
            }

        } catch (error: any) {

            console.error(
                "Failed to delete client:",
                error
            );

            showNotice(
                "error",
                error?.message ||
                "Unable to delete client."
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

            {/* Main Content */}
            <main className="min-h-screen lg:ml-[270px]">
                {/* Header */}
                <header className="sticky top-0 z-30 h-[82px] border-b border-[#E8DED0] bg-[#FBF7F0]/95 backdrop-blur">
                    <div className="flex h-full items-center justify-between px-5 md:px-8">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B28A16]">
                                SS UTSAV ADMIN
                            </p>

                            <h1
                                className="mt-1 text-2xl font-semibold text-[#39030F] md:text-3xl"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                Clients
                            </h1>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E1D4C4] bg-white text-[#39030F] shadow-sm transition hover:border-[#D6A928] hover:text-[#B28A16] lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="px-5 py-7 md:px-8 md:py-9">
                    {/* Top Heading */}
                    <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                        <div>
                            <p className="text-sm font-medium text-[#8A737B]">
                                Customer relationship management
                            </p>

                            <h2
                                className="mt-2 text-3xl font-semibold text-[#39030F] md:text-4xl"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                Manage Your Clients
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7B6870]">
                                Create, view, update and manage customer records connected
                                to your SS UTSAV events.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={loadCustomers}
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCCFC0] bg-white px-4 py-3 text-sm font-semibold text-[#39030F] shadow-sm transition hover:border-[#D6A928] hover:text-[#A47D08] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#4A0618]"
                            >
                                <Plus size={18} />
                                Add Client
                            </button>
                        </div>
                    </div>

                    {/* Notice */}
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

                    {/* Error */}
                    {apiError && !loading && (
                        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertCircle
                                    size={20}
                                    className="mt-0.5 shrink-0 text-red-600"
                                />

                                <div>
                                    <p className="font-semibold text-red-800">
                                        Unable to load clients
                                    </p>

                                    <p className="mt-1 text-sm text-red-700">
                                        {apiError}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={loadCustomers}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                                <RefreshCw size={15} />
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            icon={<Users size={21} />}
                            label="Total Clients"
                            value={totalClients}
                            description="All customer records"
                        />

                        <StatCard
                            icon={<CheckCircle2 size={21} />}
                            label="From Leads"
                            value={convertedClients}
                            description="Converted lead customers"
                        />

                        <StatCard
                            icon={<Plus size={21} />}
                            label="Direct Clients"
                            value={directClients}
                            description="Created directly"
                        />

                        <StatCard
                            icon={<Users size={21} />}
                            label="Displayed"
                            value={filteredCustomers.length}
                            description="Matching current search"
                        />
                    </div>

                    {/* Search / Toolbar */}
                    <div className="mb-5 rounded-2xl border border-[#E8DED0] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-xl">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A898F]"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search by name, phone, email, address or client ID..."
                                    className="h-12 w-full rounded-xl border border-[#E2D7CB] bg-[#FFFCF8] pl-11 pr-4 text-sm text-[#39030F] outline-none transition placeholder:text-[#A4969A] focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                />
                            </div>

                            <div className="text-sm text-[#7B6870]">
                                Showing{" "}
                                <span className="font-semibold text-[#39030F]">
                                    {filteredCustomers.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-semibold text-[#39030F]">
                                    {customers.length}
                                </span>{" "}
                                clients
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading ? (
                        <div className="rounded-2xl border border-[#E8DED0] bg-white p-6 shadow-sm">
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((item) => (
                                    <div
                                        key={item}
                                        className="h-16 animate-pulse rounded-xl bg-[#F3EDE5]"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        /* Empty State */
                        <div className="rounded-2xl border border-dashed border-[#D9CABB] bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF3DC] text-[#B28A16]">
                                <Users size={28} />
                            </div>

                            <h3
                                className="mt-5 text-2xl font-semibold text-[#39030F]"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                {search ? "No clients found" : "No clients yet"}
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7B6870]">
                                {search
                                    ? "Try changing your search terms to find another client."
                                    : "Create your first client to start managing customer records and events."}
                            </p>

                            {!search && (
                                <button
                                    type="button"
                                    onClick={openAddModal}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#4A0618]"
                                >
                                    <Plus size={18} />
                                    Add First Client
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden overflow-hidden rounded-2xl border border-[#E8DED0] bg-white shadow-sm xl:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1050px]">
                                        <thead>
                                            <tr className="border-b border-[#E8DED0] bg-[#FCF8F2]">
                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Client
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Contact
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Address
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Source
                                                </th>

                                                <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Created
                                                </th>

                                                <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.13em] text-[#806E75]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredCustomers.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className="border-b border-[#F0E9E1] last:border-b-0 transition hover:bg-[#FFFCF8]"
                                                >
                                                    {/* Client */}
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#39030F] text-sm font-bold text-[#D6A928]">
                                                                {getInitials(customer.full_name)}
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-[#39030F]">
                                                                    {customer.full_name}
                                                                </p>

                                                                <p className="mt-1 text-xs text-[#94848A]">
                                                                    Client #{customer.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="px-5 py-5">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm text-[#4E3D44]">
                                                                <Phone
                                                                    size={14}
                                                                    className="text-[#B28A16]"
                                                                />
                                                                {customer.phone}
                                                            </div>

                                                            {customer.email && (
                                                                <div className="flex items-center gap-2 text-xs text-[#827278]">
                                                                    <Mail
                                                                        size={13}
                                                                        className="text-[#B28A16]"
                                                                    />
                                                                    <span className="max-w-[210px] truncate">
                                                                        {customer.email}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Address */}
                                                    <td className="px-5 py-5">
                                                        <div className="flex max-w-[230px] items-start gap-2 text-sm text-[#625158]">
                                                            {customer.address ? (
                                                                <>
                                                                    <MapPin
                                                                        size={15}
                                                                        className="mt-0.5 shrink-0 text-[#B28A16]"
                                                                    />
                                                                    <span className="line-clamp-2">
                                                                        {customer.address}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-[#A99B9F]">
                                                                    No address
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Source */}
                                                    <td className="px-5 py-5">
                                                        {customer.lead_id !== null ? (
                                                            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                                                                Lead #{customer.lead_id}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-[#F7F0E2] px-3 py-1.5 text-xs font-semibold text-[#866815]">
                                                                Direct
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Created */}
                                                    <td className="px-5 py-5">
                                                        <span className="text-sm text-[#625158]">
                                                            {formatDate(customer.created_at)}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-5">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    viewCustomerDetails(customer.id)
                                                                }
                                                                title="View client"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DBD0] text-[#5E4A52] transition hover:border-[#D6A928] hover:bg-[#FBF3DC] hover:text-[#9A7510]"
                                                            >
                                                                <Eye size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editCustomerDetails(customer.id)
                                                                }
                                                                title="Edit client"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DBD0] text-[#5E4A52] transition hover:border-[#D6A928] hover:bg-[#FBF3DC] hover:text-[#9A7510]"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteCustomer(customer)
                                                                }
                                                                title="Delete client"
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile / Tablet Cards */}
                            <div className="grid grid-cols-1 gap-4 xl:hidden">
                                {filteredCustomers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        className="rounded-2xl border border-[#E8DED0] bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#39030F] text-sm font-bold text-[#D6A928]">
                                                    {getInitials(customer.full_name)}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-[#39030F]">
                                                        {customer.full_name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#94848A]">
                                                        Client #{customer.id}
                                                    </p>
                                                </div>
                                            </div>

                                            {customer.lead_id !== null ? (
                                                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                                                    Lead
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-[#F7F0E2] px-2.5 py-1 text-[10px] font-semibold text-[#866815]">
                                                    Direct
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-5 space-y-3 border-t border-[#F0E9E1] pt-4">
                                            <div className="flex items-center gap-3 text-sm text-[#625158]">
                                                <Phone
                                                    size={15}
                                                    className="shrink-0 text-[#B28A16]"
                                                />
                                                <span>{customer.phone}</span>
                                            </div>

                                            {customer.email && (
                                                <div className="flex items-center gap-3 text-sm text-[#625158]">
                                                    <Mail
                                                        size={15}
                                                        className="shrink-0 text-[#B28A16]"
                                                    />
                                                    <span className="break-all">
                                                        {customer.email}
                                                    </span>
                                                </div>
                                            )}

                                            {customer.address && (
                                                <div className="flex items-start gap-3 text-sm text-[#625158]">
                                                    <MapPin
                                                        size={15}
                                                        className="mt-0.5 shrink-0 text-[#B28A16]"
                                                    />
                                                    <span>{customer.address}</span>
                                                </div>
                                            )}

                                            <p className="text-xs text-[#94848A]">
                                                Created {formatDate(customer.created_at)}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex gap-2 border-t border-[#F0E9E1] pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    viewCustomerDetails(customer.id)
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E3D8CD] px-3 py-2.5 text-xs font-semibold text-[#4F3E45] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                            >
                                                <Eye size={15} />
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    editCustomerDetails(customer.id)
                                                }
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E3D8CD] px-3 py-2.5 text-xs font-semibold text-[#4F3E45] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setDeleteCustomer(customer)}
                                                className="flex items-center justify-center rounded-lg border border-red-100 px-3 py-2.5 text-red-500 hover:bg-red-50"
                                                aria-label="Delete client"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Add / Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] shadow-2xl">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8DED0] bg-[#FBF7F0] px-6 py-5 md:px-7">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B28A16]">
                                    Client Management
                                </p>

                                <h3
                                    className="mt-1 text-2xl font-semibold text-[#39030F]"
                                    style={{ fontFamily: "Georgia, serif" }}
                                >
                                    {editCustomer ? "Edit Client" : "Add Client"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeFormModal}
                                disabled={saving}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0D4C7] bg-white text-[#6D5A61] hover:border-[#D6A928] hover:text-[#39030F] disabled:opacity-50"
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={saveCustomer} className="p-6 md:p-7">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Full Name */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.full_name}
                                        onChange={(event) =>
                                            handleFormChange(
                                                "full_name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter client's full name"
                                        required
                                        className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Phone *
                                    </label>

                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(event) =>
                                            handleFormChange("phone", event.target.value)
                                        }
                                        placeholder="Enter phone number"
                                        required
                                        className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(event) =>
                                            handleFormChange("email", event.target.value)
                                        }
                                        placeholder="client@example.com"
                                        className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                    />
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(event) =>
                                            handleFormChange(
                                                "address",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter client address"
                                        className="h-12 w-full rounded-xl border border-[#DED2C5] bg-white px-4 text-sm text-[#39030F] outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6F5D64]">
                                        Notes
                                    </label>

                                    <textarea
                                        value={form.notes}
                                        onChange={(event) =>
                                            handleFormChange("notes", event.target.value)
                                        }
                                        placeholder="Add customer notes..."
                                        rows={5}
                                        className="w-full resize-none rounded-xl border border-[#DED2C5] bg-white px-4 py-3 text-sm text-[#39030F] outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/10"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8DED0] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={saving}
                                    className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A] hover:border-[#BFAE9D] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39030F] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#4A0618] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw size={17} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editCustomer ? (
                                                <Pencil size={17} />
                                            ) : (
                                                <Plus size={17} />
                                            )}

                                            {editCustomer ? "Update Client" : "Create Client"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Client Modal */}
            {viewCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#E8DED0] px-6 py-5 md:px-7">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#B28A16]">
                                    Client Details
                                </p>

                                <h3
                                    className="mt-1 text-2xl font-semibold text-[#39030F]"
                                    style={{ fontFamily: "Georgia, serif" }}
                                >
                                    {viewCustomer.full_name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewCustomer(null)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E0D4C7] bg-white text-[#6D5A61] hover:border-[#D6A928] hover:text-[#39030F]"
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Details */}
                        <div className="p-6 md:p-7">
                            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E7DBCE] bg-white p-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39030F] text-lg font-bold text-[#D6A928]">
                                    {getInitials(viewCustomer.full_name)}
                                </div>

                                <div>
                                    <p className="font-semibold text-[#39030F]">
                                        {viewCustomer.full_name}
                                    </p>

                                    <p className="mt-1 text-xs text-[#8C7C82]">
                                        Client #{viewCustomer.id}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Phone
                                    </p>

                                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[#39030F]">
                                        <Phone size={15} className="text-[#B28A16]" />
                                        {viewCustomer.phone}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Email
                                    </p>

                                    <div className="mt-2 flex items-start gap-2 text-sm font-medium text-[#39030F]">
                                        <Mail
                                            size={15}
                                            className="mt-0.5 shrink-0 text-[#B28A16]"
                                        />

                                        <span className="break-all">
                                            {viewCustomer.email || "Not provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4 sm:col-span-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Address
                                    </p>

                                    <div className="mt-2 flex items-start gap-2 text-sm font-medium text-[#39030F]">
                                        <MapPin
                                            size={15}
                                            className="mt-0.5 shrink-0 text-[#B28A16]"
                                        />

                                        <span>
                                            {viewCustomer.address || "Not provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Lead Source
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-[#39030F]">
                                        {viewCustomer.lead_id !== null
                                            ? `Converted from Lead #${viewCustomer.lead_id}`
                                            : "Direct Client"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Created
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-[#39030F]">
                                        {formatDate(viewCustomer.created_at)}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-[#E7DBCE] bg-white p-4 sm:col-span-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#95858B]">
                                        Notes
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#5F4E55]">
                                        {viewCustomer.notes || "No notes added."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setViewCustomer(null);
                                        editCustomerDetails(viewCustomer.id);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#4E3D44] hover:border-[#D6A928] hover:bg-[#FBF3DC]"
                                >
                                    <Pencil size={16} />
                                    Edit Client
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setViewCustomer(null)}
                                    className="rounded-xl bg-[#39030F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4A0618]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteCustomer && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1B0209]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-[#E8DED0] bg-[#FBF7F0] p-6 shadow-2xl md:p-7">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <Trash2 size={25} />
                        </div>

                        <h3
                            className="mt-5 text-2xl font-semibold text-[#39030F]"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            Delete Client?
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#6E5C63]">
                            You are about to delete{" "}
                            <span className="font-semibold text-[#39030F]">
                                {deleteCustomer.full_name}
                            </span>
                            . This action cannot be undone.
                        </p>

                        <div className="mt-4 rounded-xl border border-[#E7DBCE] bg-white p-4">
                            <p className="text-xs text-[#8D7C82]">
                                Client ID
                            </p>

                            <p className="mt-1 font-semibold text-[#39030F]">
                                #{deleteCustomer.id}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteCustomer(null)}
                                disabled={deleting}
                                className="rounded-xl border border-[#DCCFC0] bg-white px-5 py-3 text-sm font-semibold text-[#55434A] hover:border-[#BFAE9D] disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDeleteCustomer}
                                disabled={deleting}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Client
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