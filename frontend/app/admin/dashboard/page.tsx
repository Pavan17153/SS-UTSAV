"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/app/components/admin/AdminSidebar";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

interface DashboardData {
    leads: {
        total: number;
        new: number;
        converted: number;
    };

    customers: {
        total: number;
    };

    events: {
        total: number;
        upcoming: number;
        planning: number;
        confirmed: number;
        in_progress: number;
        completed: number;
        cancelled: number;
    };

    quotations: {
        total: number;
        draft: number;
        sent: number;
        accepted: number;
        rejected: number;
        total_value: number;
    };

    payments: {
        total_received: number;
    };

    vendors: {
        total: number;
        active: number;
        available: number;
    };

    content: {
        active_gallery: number;
        active_packages: number;
        active_testimonials: number;
    };
}

/* -------------------------------------------------------
   TOKEN
------------------------------------------------------- */

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

/* -------------------------------------------------------
   LOGOUT
------------------------------------------------------- */

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

/* -------------------------------------------------------
   CURRENCY
------------------------------------------------------- */

function formatCurrency(value: number | string | null | undefined) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

function StatCard({
    title,
    value,
    subtitle,
    icon,
    href,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    href?: string;
}) {
    const card = (
        <div className="group rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                        {title}
                    </p>

                    <p className="mt-3 truncate text-3xl font-semibold text-[#39030F]">
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

            {href && (
                <div className="mt-4 border-t border-gray-100 pt-3 text-xs font-semibold text-[#8b6b16] opacity-0 transition-all duration-300 group-hover:opacity-100">
                    View details →
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {card}
            </Link>
        );
    }

    return card;
}

/* -------------------------------------------------------
   EVENT STATUS
------------------------------------------------------- */

function EventStatusRow({
    label,
    value,
    total,
}: {
    label: string;
    value: number;
    total: number;
}) {
    const percentage =
        total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                    {label}
                </span>

                <span className="text-sm font-semibold text-[#39030F]">
                    {value}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#f1eadf]">
                <div
                    className="h-full rounded-full bg-[#D6A928] transition-all duration-700"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------
   DASHBOARD PAGE
------------------------------------------------------- */

export default function AdminDashboard() {
    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [dashboard, setDashboard] =
        useState<DashboardData | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    /* -----------------------------------------------------
       FETCH DASHBOARD
    ----------------------------------------------------- */

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = getToken();

            if (!token) {
                window.location.href = "/admin/login";
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/api/dashboard/summary`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },

                        cache: "no-store",
                    }
                );

                /* -----------------------------------------------
                   TOKEN EXPIRED / INVALID
                ------------------------------------------------ */

                if (response.status === 401) {
                    logout();
                    return;
                }

                /* -----------------------------------------------
                   OTHER API ERROR
                ------------------------------------------------ */

                if (!response.ok) {
                    const errorText = await response.text();

                    console.error(
                        "Dashboard API error:",
                        response.status,
                        errorText
                    );

                    throw new Error(
                        `Dashboard API returned ${response.status}`
                    );
                }

                /* -----------------------------------------------
                   RESPONSE
                ------------------------------------------------ */

                const data: DashboardData =
                    await response.json();

                console.log("Dashboard data:", data);

                setDashboard(data);
            } catch (err) {
                console.error(
                    "Failed to load dashboard:",
                    err
                );

                setError(
                    "Unable to load dashboard data. Please make sure the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    /* -----------------------------------------------------
       LOADING SCREEN
    ----------------------------------------------------- */

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
                                        fontFamily: "Georgia, serif",
                                    }}
                                >
                                    Dashboard
                                </h1>
                            </div>

                            {/* ONLY MOBILE MENU BUTTON */}
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

                    <section className="px-5 py-8 md:px-8">
                        <div className="mb-8 h-48 animate-pulse rounded-3xl bg-[#4A0618]/80" />

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-36 animate-pulse rounded-2xl bg-white shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="mt-6 grid gap-6 xl:grid-cols-3">
                            <div className="h-80 animate-pulse rounded-2xl bg-white xl:col-span-2" />

                            <div className="h-80 animate-pulse rounded-2xl bg-white" />
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    /* -----------------------------------------------------
       MAIN UI
    ----------------------------------------------------- */

    return (
        <div className="min-h-screen bg-[#FBF7F0]">
            {/* SIDEBAR */}

            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* MAIN CONTENT */}

            <main className="min-h-screen lg:ml-[270px]">
                {/* ------------------------------------------------
            TOP HEADER
        ------------------------------------------------ */}

                <header className="sticky top-0 z-30 border-b border-[#eadfce] bg-[#FBF7F0]/95 px-5 py-4 backdrop-blur-md md:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7a1c]">
                                SS UTSAV ADMIN
                            </p>

                            <h1
                                className="mt-1 text-2xl font-semibold text-[#39030F] md:text-3xl"
                                style={{
                                    fontFamily: "Georgia, serif",
                                }}
                            >
                                Dashboard
                            </h1>
                        </div>

                        {/* ONLY ONE HAMBURGER */}

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

                {/* ------------------------------------------------
            CONTENT
        ------------------------------------------------ */}

                <section className="px-5 py-7 md:px-8 md:py-9">
                    {/* ------------------------------------------------
              ERROR
          ------------------------------------------------ */}

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    !
                                </div>

                                <div>
                                    <h3 className="font-semibold text-red-800">
                                        Dashboard Error
                                    </h3>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ------------------------------------------------
              WELCOME BANNER
          ------------------------------------------------ */}

                    {/* ------------------------------------------------
              MAIN STAT CARDS
          ------------------------------------------------ */}

                    {dashboard && (
                        <>
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    title="Total Leads"
                                    value={dashboard.leads.total}
                                    subtitle={`${dashboard.leads.new} new leads`}
                                    icon="◉"
                                    href="/admin/leads"
                                />

                                <StatCard
                                    title="Clients"
                                    value={dashboard.customers.total}
                                    subtitle="Registered clients"
                                    icon="♙"
                                    href="/admin/clients"
                                />

                                <StatCard
                                    title="Events"
                                    value={dashboard.events.total}
                                    subtitle={`${dashboard.events.upcoming} upcoming`}
                                    icon="◆"
                                    href="/admin/events"
                                />

                                <StatCard
                                    title="Payments"
                                    value={formatCurrency(
                                        dashboard.payments.total_received
                                    )}
                                    subtitle="Total received"
                                    icon="₹"
                                    href="/admin/payments"
                                />
                            </div>

                            {/* ------------------------------------------------
                  EVENT + LEAD OVERVIEW
              ------------------------------------------------ */}

                            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                                {/* EVENT OVERVIEW */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm xl:col-span-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                                Event Management
                                            </p>

                                            <h3
                                                className="mt-1 text-xl font-semibold text-[#39030F]"
                                                style={{
                                                    fontFamily: "Georgia, serif",
                                                }}
                                            >
                                                Event Overview
                                            </h3>
                                        </div>

                                        <Link
                                            href="/admin/events"
                                            className="text-xs font-semibold text-[#8b6b16] transition hover:text-[#39030F]"
                                        >
                                            View all →
                                        </Link>
                                    </div>

                                    <div className="mt-7 space-y-5">
                                        <EventStatusRow
                                            label="Planning"
                                            value={
                                                dashboard.events.planning
                                            }
                                            total={
                                                dashboard.events.total
                                            }
                                        />

                                        <EventStatusRow
                                            label="Confirmed"
                                            value={
                                                dashboard.events.confirmed
                                            }
                                            total={
                                                dashboard.events.total
                                            }
                                        />

                                        <EventStatusRow
                                            label="In Progress"
                                            value={
                                                dashboard.events.in_progress
                                            }
                                            total={
                                                dashboard.events.total
                                            }
                                        />

                                        <EventStatusRow
                                            label="Completed"
                                            value={
                                                dashboard.events.completed
                                            }
                                            total={
                                                dashboard.events.total
                                            }
                                        />

                                        <EventStatusRow
                                            label="Cancelled"
                                            value={
                                                dashboard.events.cancelled
                                            }
                                            total={
                                                dashboard.events.total
                                            }
                                        />
                                    </div>
                                </div>

                                {/* LEAD OVERVIEW */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-6 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Lead Pipeline
                                    </p>

                                    <h3
                                        className="mt-1 text-xl font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily: "Georgia, serif",
                                        }}
                                    >
                                        Lead Overview
                                    </h3>

                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center justify-between rounded-xl bg-[#FBF7F0] p-4">
                                            <span className="text-sm text-gray-600">
                                                Total Leads
                                            </span>

                                            <span className="font-semibold text-[#39030F]">
                                                {dashboard.leads.total}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-[#FBF7F0] p-4">
                                            <span className="text-sm text-gray-600">
                                                New Leads
                                            </span>

                                            <span className="font-semibold text-[#39030F]">
                                                {dashboard.leads.new}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-[#FBF7F0] p-4">
                                            <span className="text-sm text-gray-600">
                                                Converted
                                            </span>

                                            <span className="font-semibold text-[#39030F]">
                                                {dashboard.leads.converted}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/admin/leads"
                                        className="mt-5 block rounded-xl bg-[#4A0618] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#39030F]"
                                    >
                                        Manage Leads
                                    </Link>
                                </div>
                            </div>

                            {/* ------------------------------------------------
                  BUSINESS SUMMARY
              ------------------------------------------------ */}

                            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                {/* QUOTATIONS */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                                            Quotations
                                        </p>

                                        <span className="text-lg text-[#D6A928]">
                                            ▤
                                        </span>
                                    </div>

                                    <p className="mt-3 text-2xl font-semibold text-[#39030F]">
                                        {dashboard.quotations.total}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {dashboard.quotations.accepted}{" "}
                                        accepted
                                    </p>
                                </div>

                                {/* QUOTATION VALUE */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                                            Quotation Value
                                        </p>

                                        <span className="text-lg text-[#D6A928]">
                                            ₹
                                        </span>
                                    </div>

                                    <p className="mt-3 truncate text-2xl font-semibold text-[#39030F]">
                                        {formatCurrency(
                                            dashboard.quotations
                                                .total_value
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Total quotation value
                                    </p>
                                </div>

                                {/* VENDORS */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                                            Vendors
                                        </p>

                                        <span className="text-lg text-[#D6A928]">
                                            ◇
                                        </span>
                                    </div>

                                    <p className="mt-3 text-2xl font-semibold text-[#39030F]">
                                        {dashboard.vendors.total}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {dashboard.vendors.available}{" "}
                                        available
                                    </p>
                                </div>

                                {/* CONTENT */}

                                <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                                            Website Content
                                        </p>

                                        <span className="text-lg text-[#D6A928]">
                                            ✦
                                        </span>
                                    </div>

                                    <p className="mt-3 text-2xl font-semibold text-[#39030F]">
                                        {dashboard.content
                                            .active_gallery +
                                            dashboard.content
                                                .active_packages +
                                            dashboard.content
                                                .active_testimonials}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Active content items
                                    </p>
                                </div>
                            </div>

                            {/* ------------------------------------------------
                  QUICK ACCESS
              ------------------------------------------------ */}

                            <div className="mt-8">
                                <div className="mb-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9b7a1c]">
                                        Quick Access
                                    </p>

                                    <h3
                                        className="mt-1 text-xl font-semibold text-[#39030F]"
                                        style={{
                                            fontFamily: "Georgia, serif",
                                        }}
                                    >
                                        Manage SS UTSAV
                                    </h3>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <Link
                                        href="/admin/leads"
                                        className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D6A928] hover:shadow-lg"
                                    >
                                        <span className="text-xl text-[#D6A928]">
                                            ◉
                                        </span>

                                        <h4 className="mt-3 font-semibold text-[#39030F]">
                                            Manage Leads
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Track enquiries and conversions
                                        </p>
                                    </Link>

                                    <Link
                                        href="/admin/clients"
                                        className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D6A928] hover:shadow-lg"
                                    >
                                        <span className="text-xl text-[#D6A928]">
                                            ♙
                                        </span>

                                        <h4 className="mt-3 font-semibold text-[#39030F]">
                                            Manage Clients
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-500">
                                            View and manage client records
                                        </p>
                                    </Link>

                                    <Link
                                        href="/admin/events"
                                        className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D6A928] hover:shadow-lg"
                                    >
                                        <span className="text-xl text-[#D6A928]">
                                            ◆
                                        </span>

                                        <h4 className="mt-3 font-semibold text-[#39030F]">
                                            Manage Events
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Plan and track celebrations
                                        </p>
                                    </Link>

                                    <Link
                                        href="/admin/settings"
                                        className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D6A928] hover:shadow-lg"
                                    >
                                        <span className="text-xl text-[#D6A928]">
                                            ⚙
                                        </span>

                                        <h4 className="mt-3 font-semibold text-[#39030F]">
                                            Settings
                                        </h4>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Manage business settings
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}