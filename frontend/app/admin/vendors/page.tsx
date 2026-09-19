"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    CheckCircle2,
    ChevronDown,
    Edit3,
    Eye,
    Mail,
    MapPin,
    Menu,
    Phone,
    Plus,
    Search,
    Trash2,
    Users,
    Wallet,
    X,
    XCircle,
    RefreshCw,
} from "lucide-react";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";
/* =========================================================
   TYPES
========================================================= */

type Vendor = {
    id: number;
    name: string;
    category: string;
    contact_person: string | null;
    phone: string;
    email: string | null;
    address: string | null;
    service_description: string | null;
    pricing: number | string | null;
    is_available: boolean;
    is_active: boolean;
    created_at: string;
};

type VendorForm = {
    name: string;
    category: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    service_description: string;
    pricing: string;
    is_available: boolean;
    is_active: boolean;
};
const categories = [
    "All",
    "Decorators",
    "Photographers",
    "Caterers",
    "Venues",
    "DJs & Artists",
    "Makeup & Mehendi",
    "Sound & Lighting",
    "Rentals",
];

const formCategories = [
    "Decorators",
    "Photographers",
    "Caterers",
    "Venues",
    "DJs & Artists",
    "Makeup & Mehendi",
    "Sound & Lighting",
    "Rentals",
];


/* =========================================================
   API HELPERS
========================================================= */

async function parseApiError(response: Response): Promise<string> {
    try {
        const data = await response.json();

        if (typeof data?.detail === "string") {
            return data.detail;
        }

        if (Array.isArray(data?.detail)) {
            return data.detail
                .map((item: any) => {
                    if (typeof item === "string") {
                        return item;
                    }

                    return item?.msg || "Validation error";
                })
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

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function extractVendors(data: any): Vendor[] {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.vendors)) {
        return data.vendors;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    return [];
}

function extractVendor(data: any): Vendor {
    return data?.vendor ?? data;
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatCurrency(value: number | string | null) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(value: string) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* =========================================================
   UI HELPERS
========================================================= */

function categoryClasses(category: string) {
    const categoryColors: Record<string, string> = {
        Decorators: "bg-[#F8F0E4] text-[#8A631C]",
        Photographers: "bg-[#F3EAF0] text-[#7B3E62]",
        Caterers: "bg-[#EEF4E9] text-[#53713F]",
        Venues: "bg-[#EDEFF7] text-[#4D5885]",
        "DJs & Artists": "bg-[#F4EAF7] text-[#70457C]",
        "Makeup & Mehendi": "bg-[#F8ECEA] text-[#934E47]",
        "Sound & Lighting": "bg-[#E9F2F4] text-[#426A72]",
        Rentals: "bg-[#F1EEE8] text-[#685E4D]",
    };

    return (
        categoryColors[category] ||
        "bg-[#F3EEE8] text-[#685E4D]"
    );
}

function activeStatusClasses(isActive: boolean) {
    return isActive
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-100 text-slate-600";
}

function availabilityClasses(isAvailable: boolean) {
    return isAvailable
        ? "bg-[#EEF6ED] text-[#547548]"
        : "bg-[#F4EEEE] text-[#8A5555]";
}

/* =========================================================
   DEFAULT FORM
========================================================= */

function getEmptyForm(): VendorForm {
    return {
        name: "",
        category: "Decorators",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        service_description: "",
        pricing: "",
        is_available: true,
        is_active: true,
    };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedVendor, setSelectedVendor] =
        useState<Vendor | null>(null);

    const [editingVendor, setEditingVendor] =
        useState<Vendor | null>(null);

    const [deleteTarget, setDeleteTarget] =
        useState<Vendor | null>(null);

    const [showForm, setShowForm] = useState(false);

    const [form, setForm] = useState<VendorForm>(
        getEmptyForm()
    );

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* =====================================================
       LOAD VENDORS
    ===================================================== */

    async function loadVendors(showRefresh = false) {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await adminApi.get<any>("/api/vendors/");

            const vendorList = extractVendors(data);

            setVendors(vendorList);
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to load vendors."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadVendors();
    }, []);

    /* =====================================================
       STATS
    ===================================================== */

    const stats = useMemo(() => {
        const total = vendors.length;

        const active = vendors.filter(
            (vendor) => vendor.is_active
        ).length;

        const available = vendors.filter(
            (vendor) =>
                vendor.is_active &&
                vendor.is_available
        ).length;

        const categoryCount = new Set(
            vendors.map((vendor) => vendor.category)
        ).size;

        return {
            total,
            active,
            available,
            categoryCount,
        };
    }, [vendors]);

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredVendors = useMemo(() => {
        const query = search
            .toLowerCase()
            .trim();

        return vendors.filter((vendor) => {
            const matchesSearch =
                !query ||
                String(vendor.id)
                    .toLowerCase()
                    .includes(query) ||
                vendor.name
                    .toLowerCase()
                    .includes(query) ||
                vendor.category
                    .toLowerCase()
                    .includes(query) ||
                (vendor.contact_person || "")
                    .toLowerCase()
                    .includes(query) ||
                vendor.phone
                    .toLowerCase()
                    .includes(query) ||
                (vendor.email || "")
                    .toLowerCase()
                    .includes(query) ||
                (vendor.address || "")
                    .toLowerCase()
                    .includes(query);

            const matchesCategory =
                categoryFilter === "All" ||
                vendor.category === categoryFilter;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        vendors,
        search,
        categoryFilter,
    ]);

    /* =====================================================
       FORM
    ===================================================== */

    function resetForm() {
        setForm(getEmptyForm());
    }

    function openAddVendor() {
        setSelectedVendor(null);
        setEditingVendor(null);
        resetForm();
        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function openEditVendor(vendor: Vendor) {
        setEditingVendor(vendor);
        setSelectedVendor(null);

        setForm({
            name: vendor.name,
            category: vendor.category,
            contact_person:
                vendor.contact_person || "",
            phone: vendor.phone,
            email: vendor.email || "",
            address: vendor.address || "",
            service_description:
                vendor.service_description || "",
            pricing:
                vendor.pricing !== null &&
                    vendor.pricing !== undefined
                    ? String(vendor.pricing)
                    : "",
            is_available:
                vendor.is_available,
            is_active:
                vendor.is_active,
        });

        setShowForm(true);
        setError("");
        setSuccess("");
    }

    function closeForm() {
        setShowForm(false);
        setEditingVendor(null);
        resetForm();
    }

    /* =====================================================
       CREATE / UPDATE
    ===================================================== */

    async function handleSaveVendor(
        e: React.FormEvent
    ) {
        e.preventDefault();

        setError("");
        setSuccess("");

        const name = form.name.trim();
        const category = form.category.trim();
        const phone = form.phone.trim();

        if (!name) {
            setError(
                "Vendor / company name is required."
            );
            return;
        }

        if (!category) {
            setError("Category is required.");
            return;
        }

        if (!phone) {
            setError("Phone number is required.");
            return;
        }

        let pricing: number | null = null;

        if (form.pricing.trim() !== "") {
            pricing = Number(form.pricing);

            if (
                Number.isNaN(pricing) ||
                pricing < 0
            ) {
                setError(
                    "Pricing must be a valid number greater than or equal to 0."
                );
                return;
            }
        }

        const payload = {
            name,
            category,
            contact_person:
                form.contact_person.trim() || null,
            phone,
            email:
                form.email.trim() || null,
            address:
                form.address.trim() || null,
            service_description:
                form.service_description.trim() ||
                null,
            pricing,
            is_available:
                form.is_available,
            is_active:
                form.is_active,
        };

        try {
            setSaving(true);

            if (editingVendor) {
                const data = await adminApi.put<any>(
                    `/api/vendors/${editingVendor.id}`,
                    payload
                );

                const updatedVendor =
                    extractVendor(data);

                setVendors((current) =>
                    current.map((vendor) =>
                        vendor.id ===
                            editingVendor.id
                            ? updatedVendor
                            : vendor
                    )
                );

                setSuccess(
                    "Vendor updated successfully."
                );
            } else {
                const data = await adminApi.post<any>(
                    "/api/vendors/",
                    payload
                );

                const createdVendor =
                    extractVendor(data);

                setVendors((current) => [
                    createdVendor,
                    ...current,
                ]);

                setSuccess(
                    "Vendor added successfully."
                );
            }

            closeForm();
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to save vendor."
            );
        } finally {
            setSaving(false);
        }
    }

    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    async function openVendorDetails(
        vendor: Vendor
    ) {
        try {
            setError("");

            const data = await adminApi.get<any>(
                `/api/vendors/${vendor.id}`
            );

            const fullVendor =
                extractVendor(data);

            setSelectedVendor(fullVendor);
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to load vendor details."
            );
        }
    }

    /* =====================================================
       DELETE
    ===================================================== */

    async function handleDeleteVendor() {
        if (!deleteTarget) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await adminApi.delete<any>(
                `/api/vendors/${deleteTarget.id}`
            );

            setVendors((current) =>
                current.filter(
                    (vendor) =>
                        vendor.id !==
                        deleteTarget.id
                )
            );

            setDeleteTarget(null);

            setSuccess(
                "Vendor deleted successfully."
            );
        } catch (err: any) {
            setError(
                err?.message ||
                "Unable to delete vendor."
            );
        } finally {
            setDeleting(false);
        }
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#35030F]">
            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* =================================================
                MAIN
            ================================================= */}

            <main className="min-h-screen lg:ml-[270px]">
                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eadfce] bg-white px-5 md:px-8">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9A7B82]">
                            Operations
                        </p>

                        <h1 className="font-serif text-2xl text-[#4A0618]">
                            Vendor Management
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Menu */}
                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#eadfce] bg-[#FCFAF6] text-[#4A0618] lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Desktop Admin */}
                        <div className="hidden items-center gap-3 lg:flex">
                            <div className="h-8 w-px bg-[#eadfce]" />

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
                </header>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="px-5 py-7 md:px-8 md:py-9">
                    {/* =================================================
                        ALERTS
                    ================================================= */}

                    {error && (
                        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <div>
                                <strong className="font-semibold">
                                    Error:
                                </strong>{" "}
                                {error}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                className="shrink-0"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            <div>
                                {success}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSuccess("")
                                }
                                className="shrink-0"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        PAGE HEADING
                    ================================================= */}

                    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B08B27]">
                                Vendor Network
                            </p>

                            <h2 className="font-serif text-3xl text-[#4A0618] sm:text-4xl">
                                Vendors
                            </h2>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#765E65]">
                                Manage decorators,
                                photographers,
                                caterers, venues,
                                entertainment partners,
                                and other vendors
                                supporting SS UTSAV
                                events.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    loadVendors(true)
                                }
                                disabled={refreshing}
                                className="flex items-center justify-center gap-2 rounded-lg border border-[#dfd1c2] bg-white px-4 py-3 text-sm font-medium text-[#4A0618] transition hover:bg-[#FCFAF6] disabled:cursor-not-allowed disabled:opacity-60"
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
                                onClick={
                                    openAddVendor
                                }
                                className="flex items-center justify-center gap-2 rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#35030F]"
                            >
                                <Plus size={17} />
                                Add Vendor
                            </button>
                        </div>
                    </div>

                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Vendors"
                            value={String(
                                stats.total
                            )}
                            subtitle="Registered vendor partners"
                            icon={
                                <Users size={21} />
                            }
                        />

                        <StatCard
                            title="Active Vendors"
                            value={String(
                                stats.active
                            )}
                            subtitle="Active vendor records"
                            icon={
                                <CheckCircle2
                                    size={21}
                                />
                            }
                        />

                        <StatCard
                            title="Available Vendors"
                            value={String(
                                stats.available
                            )}
                            subtitle="Currently available"
                            icon={
                                <CheckCircle2
                                    size={21}
                                />
                            }
                        />

                        <StatCard
                            title="Categories"
                            value={String(
                                stats.categoryCount
                            )}
                            subtitle="Service categories"
                            icon={
                                <Building2
                                    size={21}
                                />
                            }
                        />
                    </div>

                    {/* =================================================
                        VENDOR DIRECTORY
                    ================================================= */}

                    <section className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-[0_8px_35px_rgba(74,6,24,0.04)]">
                        {/* Toolbar */}

                        <div className="border-b border-[#eee5d9] p-5 sm:p-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <h3 className="font-serif text-xl text-[#4A0618]">
                                        Vendor Directory
                                    </h3>

                                    <p className="mt-1 text-xs text-[#927980]">
                                        Maintain the
                                        SS UTSAV vendor
                                        network.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {/* Search */}

                                    <div className="relative">
                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A38A90]"
                                        />

                                        <input
                                            value={
                                                search
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setSearch(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Search vendors..."
                                            className="h-10 w-full rounded-lg border border-[#e7dbcd] bg-[#FCFAF6] pl-10 pr-4 text-sm outline-none transition focus:border-[#B08B27] sm:w-[260px]"
                                        />
                                    </div>

                                    {/* Category */}

                                    <div className="relative">
                                        <select
                                            value={
                                                categoryFilter
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setCategoryFilter(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-10 w-full appearance-none rounded-lg border border-[#e7dbcd] bg-[#FCFAF6] pl-4 pr-10 text-sm outline-none focus:border-[#B08B27] sm:w-[190px]"
                                        >
                                            {categories.map(
                                                (
                                                    category
                                                ) => (
                                                    <option
                                                        key={
                                                            category
                                                        }
                                                        value={
                                                            category
                                                        }
                                                    >
                                                        {
                                                            category
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <ChevronDown
                                            size={
                                                16
                                            }
                                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8E747B]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            LOADING
                        ================================================= */}

                        {loading ? (
                            <div className="px-6 py-20 text-center">
                                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#eadfce] border-t-[#4A0618]" />

                                <p className="mt-4 text-sm text-[#927980]">
                                    Loading vendors...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* =================================================
                                    DESKTOP TABLE
                                ================================================= */}

                                <div className="hidden overflow-x-auto lg:block">
                                    <table className="w-full min-w-[1100px]">
                                        <thead>
                                            <tr className="border-b border-[#eee5d9] bg-[#FCFAF6] text-left">
                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Vendor
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Category
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Contact
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Address
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Pricing
                                                </th>

                                                <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Status
                                                </th>

                                                <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947980]">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredVendors.map(
                                                (
                                                    vendor
                                                ) => (
                                                    <tr
                                                        key={
                                                            vendor.id
                                                        }
                                                        className="border-b border-[#f0e8de] transition hover:bg-[#FCFAF6]"
                                                    >
                                                        {/* Vendor */}

                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F0E4] font-serif text-lg font-semibold text-[#4A0618]">
                                                                    {vendor.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <div>
                                                                    <div className="font-medium text-[#4A0618]">
                                                                        {
                                                                            vendor.name
                                                                        }
                                                                    </div>

                                                                    <div className="mt-1 text-[11px] text-[#9A8188]">
                                                                        VEN-
                                                                        {
                                                                            vendor.id
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Category */}

                                                        <td className="px-6 py-5">
                                                            <span
                                                                className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${categoryClasses(
                                                                    vendor.category
                                                                )}`}
                                                            >
                                                                {
                                                                    vendor.category
                                                                }
                                                            </span>
                                                        </td>

                                                        {/* Contact */}

                                                        <td className="px-6 py-5">
                                                            <div className="text-sm font-medium text-[#4A0618]">
                                                                {vendor.contact_person ||
                                                                    "—"}
                                                            </div>

                                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8D757C]">
                                                                <Phone
                                                                    size={
                                                                        12
                                                                    }
                                                                />

                                                                {
                                                                    vendor.phone
                                                                }
                                                            </div>

                                                            {vendor.email && (
                                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[#8D757C]">
                                                                    <Mail
                                                                        size={
                                                                            12
                                                                        }
                                                                    />

                                                                    {
                                                                        vendor.email
                                                                    }
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Address */}

                                                        <td className="px-6 py-5">
                                                            <div className="flex max-w-[220px] items-start gap-2 text-sm text-[#665159]">
                                                                <MapPin
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="mt-0.5 shrink-0 text-[#B08B27]"
                                                                />

                                                                <span>
                                                                    {vendor.address ||
                                                                        "—"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Pricing */}

                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-2 text-sm font-medium text-[#4A0618]">
                                                                <Wallet
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-[#B08B27]"
                                                                />

                                                                {vendor.pricing !==
                                                                    null &&
                                                                    vendor.pricing !==
                                                                    undefined
                                                                    ? formatCurrency(
                                                                        vendor.pricing
                                                                    )
                                                                    : "Custom quotation"}
                                                            </div>
                                                        </td>

                                                        {/* Status */}

                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col items-start gap-2">
                                                                <span
                                                                    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold ${activeStatusClasses(
                                                                        vendor.is_active
                                                                    )}`}
                                                                >
                                                                    {vendor.is_active
                                                                        ? "Active"
                                                                        : "Inactive"}
                                                                </span>

                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${availabilityClasses(
                                                                        vendor.is_available
                                                                    )}`}
                                                                >
                                                                    {vendor.is_available
                                                                        ? "Available"
                                                                        : "Unavailable"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Actions */}

                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openVendorDetails(
                                                                            vendor
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-2 rounded-lg border border-[#e6dacd] px-3 py-2 text-xs font-medium text-[#4A0618] hover:border-[#B08B27] hover:bg-[#FCFAF6]"
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
                                                                        openEditVendor(
                                                                            vendor
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center rounded-lg border border-[#e6dacd] p-2 text-[#4A0618] hover:border-[#B08B27] hover:bg-[#FCFAF6]"
                                                                    aria-label="Edit vendor"
                                                                >
                                                                    <Edit3
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDeleteTarget(
                                                                            vendor
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center justify-center rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                                                                    aria-label="Delete vendor"
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
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* =================================================
                                    MOBILE CARDS
                                ================================================= */}

                                <div className="divide-y divide-[#eee5d9] lg:hidden">
                                    {filteredVendors.map(
                                        (
                                            vendor
                                        ) => (
                                            <div
                                                key={
                                                    vendor.id
                                                }
                                                className="p-5"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F0E4] font-serif text-lg font-semibold text-[#4A0618]">
                                                            {vendor.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <div className="font-medium text-[#4A0618]">
                                                                {
                                                                    vendor.name
                                                                }
                                                            </div>

                                                            <div className="mt-1 text-[11px] text-[#9A8188]">
                                                                VEN-
                                                                {
                                                                    vendor.id
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-2.5 py-1 text-[9px] font-semibold ${activeStatusClasses(
                                                            vendor.is_active
                                                        )}`}
                                                    >
                                                        {vendor.is_active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </div>

                                                <div className="mt-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${categoryClasses(
                                                            vendor.category
                                                        )}`}
                                                    >
                                                        {
                                                            vendor.category
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-4 space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-[#665159]">
                                                        <Users
                                                            size={
                                                                14
                                                            }
                                                            className="text-[#B08B27]"
                                                        />

                                                        {vendor.contact_person ||
                                                            "No contact person"}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[#665159]">
                                                        <Phone
                                                            size={
                                                                14
                                                            }
                                                            className="text-[#B08B27]"
                                                        />

                                                        {
                                                            vendor.phone
                                                        }
                                                    </div>

                                                    {vendor.email && (
                                                        <div className="flex items-center gap-2 text-[#665159]">
                                                            <Mail
                                                                size={
                                                                    14
                                                                }
                                                                className="text-[#B08B27]"
                                                            />

                                                            {
                                                                vendor.email
                                                            }
                                                        </div>
                                                    )}

                                                    <div className="flex items-start gap-2 text-[#665159]">
                                                        <MapPin
                                                            size={
                                                                14
                                                            }
                                                            className="mt-0.5 text-[#B08B27]"
                                                        />

                                                        <span>
                                                            {vendor.address ||
                                                                "No address"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3">
                                                    <div className="rounded-lg bg-[#FCFAF6] p-3">
                                                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#9A8188]">
                                                            <Wallet
                                                                size={
                                                                    11
                                                                }
                                                            />

                                                            Pricing
                                                        </div>

                                                        <div className="mt-1 text-sm font-semibold text-[#4A0618]">
                                                            {vendor.pricing !==
                                                                null &&
                                                                vendor.pricing !==
                                                                undefined
                                                                ? formatCurrency(
                                                                    vendor.pricing
                                                                )
                                                                : "Custom"}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg bg-[#FCFAF6] p-3">
                                                        <div className="text-[10px] uppercase tracking-wider text-[#9A8188]">
                                                            Availability
                                                        </div>

                                                        <div className="mt-1 text-sm font-semibold text-[#4A0618]">
                                                            {vendor.is_available
                                                                ? "Available"
                                                                : "Unavailable"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openVendorDetails(
                                                                vendor
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e5d8ca] py-2.5 text-xs font-medium text-[#4A0618]"
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
                                                            openEditVendor(
                                                                vendor
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-1.5 rounded-lg border border-[#e5d8ca] py-2.5 text-xs font-medium text-[#4A0618]"
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
                                                            setDeleteTarget(
                                                                vendor
                                                            )
                                                        }
                                                        className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2.5 text-xs font-medium text-red-600"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* =================================================
                                    EMPTY STATE
                                ================================================= */}

                                {filteredVendors.length ===
                                    0 && (
                                        <div className="px-6 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F0E4] text-[#B08B27]">
                                                <Search
                                                    size={
                                                        20
                                                    }
                                                />
                                            </div>

                                            <h4 className="mt-4 font-serif text-lg text-[#4A0618]">
                                                No vendors
                                                found
                                            </h4>

                                            <p className="mt-1 text-sm text-[#927980]">
                                                Try changing
                                                your search
                                                or category
                                                filter.
                                            </p>
                                        </div>
                                    )}

                                {/* =================================================
                                    FOOTER
                                ================================================= */}

                                <div className="border-t border-[#eee5d9] px-5 py-4 text-xs text-[#927980] sm:px-6">
                                    Showing{" "}
                                    {
                                        filteredVendors.length
                                    }{" "}
                                    of{" "}
                                    {vendors.length}{" "}
                                    vendors
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* =========================================================
                VIEW DETAILS MODAL
            ========================================================= */}

            {selectedVendor && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-[#eee5d9] px-6 py-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B08B27]">
                                    Vendor Details
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                    {
                                        selectedVendor.name
                                    }
                                </h3>

                                <p className="mt-1 text-xs text-[#927980]">
                                    VEN-
                                    {
                                        selectedVendor.id
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedVendor(
                                        null
                                    )
                                }
                                className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            {/* Summary */}

                            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#FCFAF6] p-5 sm:flex-row sm:items-center">
                                <div>
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${categoryClasses(
                                            selectedVendor.category
                                        )}`}
                                    >
                                        {
                                            selectedVendor.category
                                        }
                                    </span>

                                    <div className="mt-3 flex items-start gap-2 text-sm text-[#665159]">
                                        <MapPin
                                            size={
                                                14
                                            }
                                            className="mt-0.5 shrink-0 text-[#B08B27]"
                                        />

                                        <span>
                                            {selectedVendor.address ||
                                                "No address provided"}
                                        </span>
                                    </div>
                                </div>

                                <div className="sm:text-right">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${activeStatusClasses(
                                            selectedVendor.is_active
                                        )}`}
                                    >
                                        {selectedVendor.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>

                                    <div
                                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${availabilityClasses(
                                            selectedVendor.is_available
                                        )}`}
                                    >
                                        {selectedVendor.is_available
                                            ? "Available"
                                            : "Unavailable"}
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}

                            <div>
                                <h4 className="mb-3 font-serif text-lg text-[#4A0618]">
                                    Contact Information
                                </h4>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Detail
                                        label="Contact Person"
                                        value={
                                            selectedVendor.contact_person ||
                                            "—"
                                        }
                                        icon={
                                            <Users
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <Detail
                                        label="Phone"
                                        value={
                                            selectedVendor.phone
                                        }
                                        icon={
                                            <Phone
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <Detail
                                        label="Email"
                                        value={
                                            selectedVendor.email ||
                                            "—"
                                        }
                                        icon={
                                            <Mail
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <Detail
                                        label="Pricing"
                                        value={
                                            selectedVendor.pricing !==
                                                null &&
                                                selectedVendor.pricing !==
                                                undefined
                                                ? formatCurrency(
                                                    selectedVendor.pricing
                                                )
                                                : "Custom quotation"
                                        }
                                        icon={
                                            <Wallet
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* Address */}

                            <div>
                                <h4 className="mb-3 font-serif text-lg text-[#4A0618]">
                                    Address
                                </h4>

                                <div className="rounded-xl border border-[#eee5d9] bg-[#FCFAF6] p-4">
                                    <div className="flex items-start gap-2 text-sm leading-6 text-[#665159]">
                                        <MapPin
                                            size={
                                                16
                                            }
                                            className="mt-1 shrink-0 text-[#B08B27]"
                                        />

                                        <span>
                                            {selectedVendor.address ||
                                                "No address provided."}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service */}

                            <div>
                                <h4 className="mb-3 font-serif text-lg text-[#4A0618]">
                                    Service Description
                                </h4>

                                <div className="rounded-xl border border-[#eadfce] bg-[#FFFCF5] p-4 text-sm leading-6 text-[#665159]">
                                    {selectedVendor.service_description ||
                                        "No service description added."}
                                </div>
                            </div>

                            {/* Created */}

                            <div>
                                <h4 className="mb-3 font-serif text-lg text-[#4A0618]">
                                    Record Information
                                </h4>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Detail
                                        label="Vendor ID"
                                        value={`VEN-${selectedVendor.id}`}
                                        icon={
                                            <Building2
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <Detail
                                        label="Created"
                                        value={formatDate(
                                            selectedVendor.created_at
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Actions */}

                            <div className="flex flex-col gap-3 border-t border-[#eee5d9] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        openEditVendor(
                                            selectedVendor
                                        )
                                    }
                                    className="flex items-center justify-center gap-2 rounded-lg border border-[#dfd1c2] px-5 py-3 text-sm font-medium text-[#4A0618] hover:bg-[#FCFAF6]"
                                >
                                    <Edit3
                                        size={15}
                                    />
                                    Edit Vendor
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedVendor(
                                            null
                                        )
                                    }
                                    className="rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white hover:bg-[#35030F]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================
                ADD / EDIT MODAL
            ========================================================= */}

            {showForm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        {/* Header */}

                        <div className="flex items-center justify-between border-b border-[#eee5d9] px-6 py-5">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B08B27]">
                                    Vendor Network
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                    {editingVendor
                                        ? "Edit Vendor"
                                        : "Add Vendor"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeForm
                                }
                                className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4]"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={
                                handleSaveVendor
                            }
                            className="space-y-6 p-6"
                        >
                            {/* =================================================
                                BASIC INFORMATION
                            ================================================= */}

                            <div>
                                <div className="mb-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08B27]">
                                        01
                                    </p>

                                    <h4 className="font-serif text-lg text-[#4A0618]">
                                        Basic Information
                                    </h4>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Vendor / Company Name"
                                        required
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    name: value,
                                                }
                                            )
                                        }
                                        placeholder="Royal Bloom Decor"
                                    />

                                    <SelectField
                                        label="Category"
                                        value={
                                            form.category
                                        }
                                        options={
                                            formCategories
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    category:
                                                        value,
                                                }
                                            )
                                        }
                                    />

                                    <Field
                                        label="Contact Person"
                                        value={
                                            form.contact_person
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    contact_person:
                                                        value,
                                                }
                                            )
                                        }
                                        placeholder="Contact person"
                                    />

                                    <Field
                                        label="Phone"
                                        required
                                        type="tel"
                                        value={
                                            form.phone
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    phone: value,
                                                }
                                            )
                                        }
                                        placeholder="+91 98765 43210"
                                    />

                                    <Field
                                        label="Email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    email: value,
                                                }
                                            )
                                        }
                                        placeholder="vendor@example.com"
                                    />

                                    <Field
                                        label="Address"
                                        value={
                                            form.address
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    address:
                                                        value,
                                                }
                                            )
                                        }
                                        placeholder="Whitefield, Bengaluru"
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                SERVICE INFORMATION
                            ================================================= */}

                            <div className="border-t border-[#eee5d9] pt-6">
                                <div className="mb-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08B27]">
                                        02
                                    </p>

                                    <h4 className="font-serif text-lg text-[#4A0618]">
                                        Service Information
                                    </h4>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Pricing"
                                        type="number"
                                        value={
                                            form.pricing
                                        }
                                        onChange={(
                                            value
                                        ) =>
                                            setForm(
                                                {
                                                    ...form,
                                                    pricing:
                                                        value,
                                                }
                                            )
                                        }
                                        placeholder="50000"
                                    />

                                    <div className="rounded-xl border border-[#eadfce] bg-[#FCFAF6] p-4">
                                        <div className="text-xs font-medium text-[#5E474E]">
                                            Pricing Preview
                                        </div>

                                        <div className="mt-2 font-serif text-xl text-[#4A0618]">
                                            {form.pricing
                                                ? formatCurrency(
                                                    form.pricing
                                                )
                                                : "Custom quotation"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block">
                                        <span className="mb-2 block text-xs font-medium text-[#5E474E]">
                                            Service
                                            Description
                                        </span>

                                        <textarea
                                            value={
                                                form.service_description
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        service_description:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            rows={
                                                4
                                            }
                                            placeholder="Describe the services offered by this vendor..."
                                            className="w-full resize-none rounded-xl border border-[#e4d8ca] bg-[#FCFAF6] px-4 py-3 text-sm text-[#4A0618] outline-none placeholder:text-[#B3A0A4] focus:border-[#B08B27]"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* =================================================
                                STATUS
                            ================================================= */}

                            <div className="border-t border-[#eee5d9] pt-6">
                                <div className="mb-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B08B27]">
                                        03
                                    </p>

                                    <h4 className="font-serif text-lg text-[#4A0618]">
                                        Vendor Status
                                    </h4>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eadfce] bg-[#FCFAF6] p-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.is_active
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        is_active:
                                                            e
                                                                .target
                                                                .checked,
                                                    }
                                                )
                                            }
                                            className="mt-0.5 h-4 w-4 accent-[#4A0618]"
                                        />

                                        <div>
                                            <div className="text-sm font-medium text-[#4A0618]">
                                                Active
                                                vendor
                                            </div>

                                            <div className="mt-1 text-xs leading-5 text-[#927980]">
                                                Active
                                                vendors
                                                remain in
                                                the SS UTSAV
                                                vendor
                                                network.
                                            </div>
                                        </div>
                                    </label>

                                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eadfce] bg-[#FCFAF6] p-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                form.is_available
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        is_available:
                                                            e
                                                                .target
                                                                .checked,
                                                    }
                                                )
                                            }
                                            className="mt-0.5 h-4 w-4 accent-[#4A0618]"
                                        />

                                        <div>
                                            <div className="text-sm font-medium text-[#4A0618]">
                                                Currently
                                                Available
                                            </div>

                                            <div className="mt-1 text-xs leading-5 text-[#927980]">
                                                Indicates
                                                whether this
                                                vendor is
                                                currently
                                                available
                                                for new
                                                events.
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* =================================================
                                BUTTONS
                            ================================================= */}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#eee5d9] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-lg border border-[#e2d5c7] px-5 py-3 text-sm font-medium text-[#4A0618] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center justify-center gap-2 rounded-lg bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white hover:bg-[#35030F] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={
                                                    16
                                                }
                                                className="animate-spin"
                                            />

                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={
                                                    16
                                                }
                                            />

                                            {editingVendor
                                                ? "Save Changes"
                                                : "Add Vendor"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================
                DELETE CONFIRMATION
            ========================================================= */}

            {deleteTarget && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#21020b]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="border-b border-[#eee5d9] px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-red-500">
                                        Delete Vendor
                                    </p>

                                    <h3 className="mt-1 font-serif text-2xl text-[#4A0618]">
                                        Confirm
                                        Deletion
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteTarget(
                                            null
                                        )
                                    }
                                    className="rounded-full p-2 text-[#806B72] hover:bg-[#F7F0E4]"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                        <Trash2
                                            size={
                                                18
                                            }
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-red-800">
                                            Delete{" "}
                                            {
                                                deleteTarget.name
                                            }
                                            ?
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-red-700">
                                            This action
                                            will permanently
                                            remove this
                                            vendor from the
                                            database.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDeleteTarget(
                                            null
                                        )
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="rounded-lg border border-[#e2d5c7] px-5 py-3 text-sm font-medium text-[#4A0618]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleDeleteVendor
                                    }
                                    disabled={
                                        deleting
                                    }
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deleting ? (
                                        <>
                                            <RefreshCw
                                                size={
                                                    16
                                                }
                                                className="animate-spin"
                                            />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                            Delete Vendor
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

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

/* =========================================================
   DETAIL
========================================================= */

function Detail({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[#eee5d9] bg-[#FCFAF6] p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9A8188]">
                {icon}
                {label}
            </div>

            <div className="mt-2 break-words text-sm font-medium text-[#4A0618]">
                {value}
            </div>
        </div>
    );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function Field({
    label,
    required,
    type = "text",
    value,
    onChange,
    placeholder,
}: {
    label: string;
    required?: boolean;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
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
                min={
                    type === "number"
                        ? "0"
                        : undefined
                }
                step={
                    type === "number"
                        ? "0.01"
                        : undefined
                }
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder={placeholder}
                className="h-11 w-full rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 text-sm text-[#4A0618] outline-none transition placeholder:text-[#B3A0A4] focus:border-[#B08B27]"
            />
        </label>
    );
}

/* =========================================================
   SELECT FIELD
========================================================= */

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
                        onChange(
                            e.target.value
                        )
                    }
                    className="h-11 w-full appearance-none rounded-lg border border-[#e4d8ca] bg-[#FCFAF6] px-3 pr-10 text-sm text-[#4A0618] outline-none focus:border-[#B08B27]"
                >
                    {options.map(
                        (option) => (
                            <option
                                key={
                                    option
                                }
                                value={
                                    option
                                }
                            >
                                {option}
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
    );
}