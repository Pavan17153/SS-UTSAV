"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

interface Lead {
    id: number;
    full_name: string;
    phone: string;
    email?: string | null;
    event_type: string;
    event_date: string;
    location: string;
    guest_count: number;
    budget_range?: string | null;
    services?: string | null;
    message?: string | null;
    status: string;
    created_at: string;
}

interface StatusUpdateResponse {
    message?: string;
}

interface ConvertResponse {
    message?: string;
    customer_id?: number;
    lead_id?: number;
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {
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

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_OPTIONS = [
    "NEW",
    "CONTACTED",
    "REQUIREMENT_COLLECTED",
    "PROPOSAL_SENT",
    "FOLLOW_UP",
    "LOST",
];

function getStatusStyle(status: string) {
    switch (status) {
        case "NEW":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "CONTACTED":
            return "bg-purple-50 text-purple-700 border-purple-200";

        case "REQUIREMENT_COLLECTED":
            return "bg-indigo-50 text-indigo-700 border-indigo-200";

        case "PROPOSAL_SENT":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "FOLLOW_UP":
            return "bg-orange-50 text-orange-700 border-orange-200";

        case "CONVERTED":
            return "bg-green-50 text-green-700 border-green-200";

        case "LOST":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function formatStatus(status: string) {
    return status
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date: string) {
    if (!date) {
        return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
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
    value: number;
    subtitle: string;
    icon: string;
}) {
    return (
        <div className="group rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                        {title}
                    </p>

                    <p className="mt-3 text-3xl font-semibold text-[#39030F]">
                        {value}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                        {subtitle}
                    </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4A0618] text-xl text-[#D6A928]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   LEADS PAGE
========================================================= */

export default function AdminLeadsPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [leads, setLeads] = useState<Lead[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [updatingLeadId, setUpdatingLeadId] = useState<number | null>(
        null
    );

    const [convertingLeadId, setConvertingLeadId] = useState<number | null>(
        null
    );

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [search, setSearch] = useState("");

    /* =====================================================
       FETCH LEADS
    ===================================================== */

    const fetchLeads = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.get<Lead[]>("/api/leads/");

            setLeads(data);
        } catch (err) {
            console.error("Failed to load leads:", err);

            if (
                err instanceof Error &&
                err.message === "Unauthorized"
            ) {
                logout();
                return;
            }

            setError(
                "Unable to load leads. Please make sure the backend server is running."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchLeads();
    }, []);

    /* =====================================================
       UPDATE STATUS
    ===================================================== */

    const updateLeadStatus = async (
        leadId: number,
        newStatus: string
    ) => {
        try {
            const updatedLead = await adminApi.put<Lead>(
                `/api/leads/${leadId}/status`,
                { status: newStatus }
            );

            setLeads((currentLeads) =>
                currentLeads.map((lead) =>
                    lead.id === leadId
                        ? updatedLead
                        : lead
                )
            );

            setSelectedLead((currentLead) =>
                currentLead?.id === leadId
                    ? updatedLead
                    : currentLead
            );

            setError("");
        } catch (err) {
            console.error(
                "Failed to update lead status:",
                err
            );

            if (
                err instanceof Error &&
                err.message === "Unauthorized"
            ) {
                logout();
                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update lead status."
            );
        }
    };
    /* =====================================================
       CONVERT LEAD
    ===================================================== */

    const convertLead = async (leadId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to convert this lead into a client?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setConvertingLeadId(leadId);

            const data = await adminApi.post<ConvertResponse>(
                `/api/leads/${leadId}/convert`,
                {}
            );

            console.log("Lead converted:", data);

            setLeads((currentLeads) =>
                currentLeads.map((lead) =>
                    lead.id === leadId
                        ? {
                            ...lead,
                            status: "CONVERTED",
                        }
                        : lead
                )
            );

            setSelectedLead((currentLead) =>
                currentLead && currentLead.id === leadId
                    ? {
                        ...currentLead,
                        status: "CONVERTED",
                    }
                    : currentLead
            );
        } catch (err) {
            console.error(
                "Failed to convert lead:",
                err
            );

            if (
                err instanceof Error &&
                err.message === "Unauthorized"
            ) {
                logout();
                return;
            }

            setError(
                "Unable to convert this lead. Please try again."
            );
        } finally {
            setConvertingLeadId(null);
        }
    };
    const deleteLead = async (leadId: number) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this lead?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await adminApi.delete<any>(
                `/api/leads/${leadId}`
            );

            setLeads((currentLeads) =>
                currentLeads.filter(
                    (lead) => lead.id !== leadId
                )
            );

            setSelectedLead((currentLead) =>
                currentLead?.id === leadId
                    ? null
                    : currentLead
            );

            setError("");
        } catch (err: any) {
            console.error(
                "Failed to delete lead:",
                err
            );

            if (err?.message === "Unauthorized") {
                logout();
                return;
            }

            setError(
                err?.message ||
                "Unable to delete this lead. Please try again."
            );
        }
    };
    /* =====================================================
       FILTER LEADS
    ===================================================== */

    const filteredLeads = leads.filter((lead) => {
        const matchesStatus =
            statusFilter === "ALL" ||
            lead.status === statusFilter;

        const searchText = search.trim().toLowerCase();

        if (!searchText) {
            return matchesStatus;
        }

        const matchesSearch =
            lead.full_name
                ?.toLowerCase()
                .includes(searchText) ||
            lead.phone
                ?.toLowerCase()
                .includes(searchText) ||
            lead.email
                ?.toLowerCase()
                .includes(searchText) ||
            lead.event_type
                ?.toLowerCase()
                .includes(searchText) ||
            lead.location
                ?.toLowerCase()
                .includes(searchText);

        return matchesStatus && matchesSearch;
    });

    /* =====================================================
       COUNTS
    ===================================================== */

    const totalLeads = leads.length;

    const newLeads = leads.filter(
        (lead) => lead.status === "NEW"
    ).length;

    const contactedLeads = leads.filter(
        (lead) => lead.status === "CONTACTED"
    ).length;

    const convertedLeads = leads.filter(
        (lead) => lead.status === "CONVERTED"
    ).length;

    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF7F0]">
                <AdminSidebar
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />

                <main className="min-h-screen lg:ml-[270px]">
                    <header className="border-b border-[#eadfce] bg-[#FBF7F0] px-5 py-4 md:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7a1c]">
                                    SS UTSAV ADMIN
                                </p>

                                <h1
                                    className="mt-1 text-2xl font-semibold text-[#39030F] md:text-3xl"
                                    style={{
                                        fontFamily:
                                            "Georgia, serif",
                                    }}
                                >
                                    Leads
                                </h1>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(true)
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6A928]/40 bg-white text-xl text-[#39030F] shadow-sm lg:hidden"
                                aria-label="Open menu"
                            >
                                ☰
                            </button>
                        </div>
                    </header>

                    <section className="px-5 py-7 md:px-8 md:py-9">
                        <div className="mb-8 h-40 animate-pulse rounded-3xl bg-[#4A0618]/80" />

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-36 animate-pulse rounded-2xl bg-white shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="mt-6 h-[500px] animate-pulse rounded-2xl bg-white shadow-sm" />
                    </section>
                </main>
            </div>
        );
    }

    /* =====================================================
       MAIN UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#FBF7F0]">
            {/* =================================================
                SIDEBAR
            ================================================= */}

            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="min-h-screen lg:ml-[270px]">
                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="sticky top-0 z-30 border-b border-[#eadfce] bg-[#FBF7F0]/95 px-5 py-4 backdrop-blur-md md:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7a1c]">
                                SS UTSAV ADMIN
                            </p>

                            <h1
                                className="mt-1 text-2xl font-semibold text-[#39030F] md:text-3xl"
                                style={{
                                    fontFamily:
                                        "Georgia, serif",
                                }}
                            >
                                Leads
                            </h1>
                        </div>

                        {/* ONLY MOBILE HAMBURGER */}

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(true)
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6A928]/40 bg-white text-xl text-[#39030F] shadow-sm transition hover:bg-[#4A0618] hover:text-[#D6A928] lg:hidden"
                            aria-label="Open admin menu"
                        >
                            ☰
                        </button>
                    </div>
                </header>

                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <section className="px-5 py-7 md:px-8 md:py-9">
                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                                    !
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-semibold text-red-800">
                                        Leads Error
                                    </h3>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError("")
                                    }
                                    className="text-sm font-semibold text-red-600 hover:text-red-800"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        STAT CARDS
                    ================================================= */}

                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Leads"
                            value={totalLeads}
                            subtitle="All enquiries"
                            icon="◉"
                        />

                        <StatCard
                            title="New Leads"
                            value={newLeads}
                            subtitle="Needs attention"
                            icon="✦"
                        />

                        <StatCard
                            title="Contacted"
                            value={contactedLeads}
                            subtitle="Follow-up started"
                            icon="☎"
                        />

                        <StatCard
                            title="Converted"
                            value={convertedLeads}
                            subtitle="Converted to clients"
                            icon="✓"
                        />
                    </div>

                    {/* =================================================
                        PIPELINE SUMMARY
                    ================================================= */}

                    <div className="mt-6 rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                    Lead Pipeline
                                </p>

                                <h3
                                    className="mt-1 text-xl font-semibold text-[#39030F]"
                                    style={{
                                        fontFamily:
                                            "Georgia, serif",
                                    }}
                                >
                                    Enquiry Progress
                                </h3>
                            </div>

                            <p className="text-xs text-gray-500">
                                {totalLeads} total leads
                            </p>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {STATUS_OPTIONS.slice(0, 4).map(
                                (status) => {
                                    const count =
                                        leads.filter(
                                            (lead) =>
                                                lead.status ===
                                                status
                                        ).length;

                                    return (
                                        <div
                                            key={status}
                                            className="rounded-xl bg-[#FBF7F0] p-4"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {formatStatus(
                                                        status
                                                    )}
                                                </span>

                                                <span className="font-semibold text-[#39030F]">
                                                    {count}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        LEADS TABLE CARD
                    ================================================= */}

                    <div className="mt-6 overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm">
                        {/* TABLE HEADER */}

                        <div className="border-b border-[#eadfce] p-5 md:p-6">
                            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Enquiries
                                    </p>

                                    <h3
                                        className="mt-1 text-xl font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily:
                                                "Georgia, serif",
                                        }}
                                    >
                                        All Leads
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {/* SEARCH */}

                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder="Search leads..."
                                            className="h-11 w-full rounded-xl border border-[#eadfce] bg-[#FBF7F0] px-4 text-sm text-[#39030F] outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20 sm:w-64"
                                        />
                                    </div>

                                    {/* STATUS FILTER */}

                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(
                                                e.target.value
                                            )
                                        }
                                        className="h-11 rounded-xl border border-[#eadfce] bg-[#FBF7F0] px-4 text-sm text-[#39030F] outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                    >
                                        <option value="ALL">
                                            All Statuses
                                        </option>

                                        {STATUS_OPTIONS.map(
                                            (status) => (
                                                <option
                                                    key={
                                                        status
                                                    }
                                                    value={
                                                        status
                                                    }
                                                >
                                                    {formatStatus(
                                                        status
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* =================================================
                            EMPTY STATE
                        ================================================= */}

                        {filteredLeads.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF7F0] text-2xl text-[#D6A928]">
                                    ◉
                                </div>

                                <h4
                                    className="mt-5 text-xl font-semibold text-[#39030F]"
                                    style={{
                                        fontFamily:
                                            "Georgia, serif",
                                    }}
                                >
                                    No leads found
                                </h4>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    {search ||
                                        statusFilter !== "ALL"
                                        ? "Try changing your search or filter."
                                        : "New enquiries from your website will appear here."}
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
                                            <tr className="border-b border-[#eadfce] bg-[#FBF7F0]/70">
                                                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Lead
                                                </th>

                                                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Event
                                                </th>

                                                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Date
                                                </th>

                                                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Guests
                                                </th>

                                                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Status
                                                </th>

                                                <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredLeads.map(
                                                (lead) => (
                                                    <tr
                                                        key={
                                                            lead.id
                                                        }
                                                        className="border-b border-[#f0e9df] transition hover:bg-[#FBF7F0]/60"
                                                    >
                                                        {/* LEAD */}

                                                        <td className="px-5 py-5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedLead(
                                                                        lead
                                                                    )
                                                                }
                                                                className="text-left"
                                                            >
                                                                <p className="font-semibold text-[#39030F] hover:text-[#8b6b16]">
                                                                    {
                                                                        lead.full_name
                                                                    }
                                                                </p>

                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {
                                                                        lead.phone
                                                                    }
                                                                </p>

                                                                {lead.email && (
                                                                    <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-400">
                                                                        {
                                                                            lead.email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </button>
                                                        </td>

                                                        {/* EVENT */}

                                                        <td className="px-5 py-5">
                                                            <p className="font-medium text-[#39030F]">
                                                                {
                                                                    lead.event_type
                                                                }
                                                            </p>

                                                            <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                                                                {
                                                                    lead.location
                                                                }
                                                            </p>
                                                        </td>

                                                        {/* DATE */}

                                                        <td className="px-5 py-5">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {formatDate(
                                                                    lead.event_date
                                                                )}
                                                            </p>
                                                        </td>

                                                        {/* GUESTS */}

                                                        <td className="px-5 py-5">
                                                            <p className="text-sm font-medium text-gray-700">
                                                                {
                                                                    lead.guest_count
                                                                }
                                                            </p>
                                                        </td>

                                                        {/* STATUS */}

                                                        <td className="px-5 py-5">
                                                            <select
                                                                value={
                                                                    lead.status
                                                                }
                                                                disabled={
                                                                    updatingLeadId ===
                                                                    lead.id
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateLeadStatus(
                                                                        lead.id,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                className={`rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition ${getStatusStyle(
                                                                    lead.status
                                                                )}`}
                                                            >
                                                                {STATUS_OPTIONS.map(
                                                                    (
                                                                        status
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                status
                                                                            }
                                                                            value={
                                                                                status
                                                                            }
                                                                        >
                                                                            {formatStatus(
                                                                                status
                                                                            )}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </td>

                                                        {/* ACTIONS */}

                                                        <td className="px-5 py-5">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelectedLead(
                                                                            lead
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-[#eadfce] px-3 py-2 text-xs font-semibold text-[#39030F] transition hover:border-[#D6A928] hover:bg-[#FBF7F0]"
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deleteLead(lead.id)}
                                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                                {lead.status !==
                                                                    "CONVERTED" &&
                                                                    lead.status !==
                                                                    "LOST" && (
                                                                        <button
                                                                            type="button"
                                                                            disabled={
                                                                                convertingLeadId ===
                                                                                lead.id
                                                                            }
                                                                            onClick={() =>
                                                                                convertLead(
                                                                                    lead.id
                                                                                )
                                                                            }
                                                                            className="rounded-lg bg-[#4A0618] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#39030F] disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                            {convertingLeadId ===
                                                                                lead.id
                                                                                ? "Converting..."
                                                                                : "Convert"}
                                                                        </button>
                                                                    )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* =================================================
                                    MOBILE / TABLET CARDS
                                ================================================= */}

                                <div className="divide-y divide-[#f0e9df] lg:hidden">
                                    {filteredLeads.map(
                                        (lead) => (
                                            <div
                                                key={
                                                    lead.id
                                                }
                                                className="p-5 md:p-6"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedLead(
                                                                    lead
                                                                )
                                                            }
                                                            className="text-left"
                                                        >
                                                            <p className="font-semibold text-[#39030F]">
                                                                {
                                                                    lead.full_name
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {
                                                                    lead.phone
                                                                }
                                                            </p>
                                                        </button>
                                                    </div>

                                                    <span
                                                        className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            lead.status
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="mt-5 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                                            Event
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                                            {
                                                                lead.event_type
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                                            Date
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {formatDate(
                                                                lead.event_date
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                                            Guests
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-gray-700">
                                                            {
                                                                lead.guest_count
                                                            }
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                                            Location
                                                        </p>

                                                        <p className="mt-1 truncate text-sm font-medium text-gray-700">
                                                            {
                                                                lead.location
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5">
                                                    <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                                        Update Status
                                                    </label>

                                                    <select
                                                        value={
                                                            lead.status
                                                        }
                                                        disabled={
                                                            updatingLeadId ===
                                                            lead.id
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateLeadStatus(
                                                                lead.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none ${getStatusStyle(
                                                            lead.status
                                                        )}`}
                                                    >
                                                        {STATUS_OPTIONS.map(
                                                            (
                                                                status
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {formatStatus(
                                                                        status
                                                                    )}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="mt-4 flex gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedLead(
                                                                lead
                                                            )
                                                        }
                                                        className="flex-1 rounded-xl border border-[#eadfce] px-4 py-3 text-sm font-semibold text-[#39030F] transition hover:border-[#D6A928] hover:bg-[#FBF7F0]"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteLead(lead.id)}
                                                        className="flex-1 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                    {lead.status !==
                                                        "CONVERTED" &&
                                                        lead.status !==
                                                        "LOST" && (
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    convertingLeadId ===
                                                                    lead.id
                                                                }
                                                                onClick={() =>
                                                                    convertLead(
                                                                        lead.id
                                                                    )
                                                                }
                                                                className="flex-1 rounded-xl bg-[#4A0618] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#39030F] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {convertingLeadId ===
                                                                    lead.id
                                                                    ? "Converting..."
                                                                    : "Convert"}
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}

                        {/* =================================================
                            TABLE FOOTER
                        ================================================= */}

                        {filteredLeads.length > 0 && (
                            <div className="border-t border-[#eadfce] bg-[#FBF7F0]/50 px-5 py-4 md:px-6">
                                <p className="text-xs text-gray-500">
                                    Showing{" "}
                                    <span className="font-semibold text-[#39030F]">
                                        {filteredLeads.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-[#39030F]">
                                        {leads.length}
                                    </span>{" "}
                                    leads
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* =========================================================
                LEAD DETAILS MODAL
            ========================================================= */}

            {selectedLead && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() =>
                        setSelectedLead(null)
                    }
                >
                    <div
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >
                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 border-b border-[#eadfce] bg-white px-6 py-5 md:px-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Lead Details
                                    </p>

                                    <h2
                                        className="mt-1 text-2xl font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily:
                                                "Georgia, serif",
                                        }}
                                    >
                                        {
                                            selectedLead.full_name
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedLead(
                                            null
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FBF7F0] text-lg text-[#39030F] transition hover:bg-[#4A0618] hover:text-white"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* MODAL CONTENT */}

                        <div className="space-y-6 p-6 md:p-7">
                            {/* STATUS */}

                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FBF7F0] p-4">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                                        Current Status
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[#39030F]">
                                        {formatStatus(
                                            selectedLead.status
                                        )}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                        selectedLead.status
                                    )}`}
                                >
                                    {formatStatus(
                                        selectedLead.status
                                    )}
                                </span>
                            </div>

                            {/* CONTACT INFORMATION */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                    Contact Information
                                </p>

                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Phone
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {
                                                selectedLead.phone
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Email
                                        </p>

                                        <p className="mt-1 break-all text-sm font-medium text-[#39030F]">
                                            {selectedLead.email ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* EVENT INFORMATION */}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                    Event Information
                                </p>

                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Event Type
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {
                                                selectedLead.event_type
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Event Date
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {formatDate(
                                                selectedLead.event_date
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Location
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {
                                                selectedLead.location
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] p-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Guest Count
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {
                                                selectedLead.guest_count
                                            }
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-[#eadfce] p-4 sm:col-span-2">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                                            Budget Range
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-[#39030F]">
                                            {
                                                selectedLead.budget_range ||
                                                "-"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SERVICES */}

                            {selectedLead.services && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Required Services
                                    </p>

                                    <div className="mt-3 rounded-xl bg-[#FBF7F0] p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {
                                                selectedLead.services
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* MESSAGE */}

                            {selectedLead.message && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Client Message
                                    </p>

                                    <div className="mt-3 rounded-xl bg-[#FBF7F0] p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {
                                                selectedLead.message
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ACTIONS */}

                            <div className="border-t border-[#eadfce] pt-5">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedLead(
                                                null
                                            )
                                        }
                                        className="flex-1 rounded-xl border border-[#eadfce] px-4 py-3 text-sm font-semibold text-[#39030F] transition hover:border-[#D6A928] hover:bg-[#FBF7F0]"
                                    >
                                        Close
                                    </button>

                                    {selectedLead.status !==
                                        "CONVERTED" &&
                                        selectedLead.status !==
                                        "LOST" && (
                                            <button
                                                type="button"
                                                disabled={
                                                    convertingLeadId ===
                                                    selectedLead.id
                                                }
                                                onClick={() =>
                                                    convertLead(
                                                        selectedLead.id
                                                    )
                                                }
                                                className="flex-1 rounded-xl bg-[#4A0618] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#39030F] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {convertingLeadId ===
                                                    selectedLead.id
                                                    ? "Converting..."
                                                    : "Convert to Client"}
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}