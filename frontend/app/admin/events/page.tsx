"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    ChevronDown,
    Clock,
    Edit3,
    Eye,
    MapPin,
    Menu,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type EventStatus =
    | "PLANNING"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

type Event = {
    id: number;
    customer_id: number;
    event_type: string;
    event_date: string;
    location: string;
    venue: string | null;
    guest_count: number;
    budget: number | string | null;
    status: EventStatus;
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

type EventForm = {
    customer_id: string;
    event_type: string;
    event_date: string;
    location: string;
    venue: string;
    guest_count: string;
    budget: string;
    status: EventStatus;
    notes: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const statusOptions: EventStatus[] = [
    "PLANNING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
];

const eventTypes = [
    "Wedding",
    "Birthday",
    "Engagement",
    "Baby Shower",
    "Corporate",
    "College Event",
    "Community",
    "Brand Launch",
    "Other",
];

/* =========================================================
   AUTH
========================================================= */

function logout() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("ss_utsav_access_token");
    localStorage.removeItem("ss_utsav_admin");
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");

    sessionStorage.removeItem("ss_utsav_access_token");
    sessionStorage.removeItem("ss_utsav_admin");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");

    window.location.href = "/admin/login";
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString: string) {
    if (!dateString) {
        return "—";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(
    value: number | string | null | undefined
) {
    const amount = Number(value || 0);

    if (!value && value !== 0) {
        return "Not specified";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function statusLabel(status: EventStatus) {
    switch (status) {
        case "PLANNING":
            return "Planning";

        case "CONFIRMED":
            return "Confirmed";

        case "IN_PROGRESS":
            return "In Progress";

        case "COMPLETED":
            return "Completed";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status;
    }
}

function statusClasses(status: EventStatus) {
    switch (status) {
        case "PLANNING":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "CONFIRMED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "IN_PROGRESS":
            return "bg-purple-50 text-purple-700 border-purple-200";

        case "COMPLETED":
            return "bg-green-50 text-green-700 border-green-200";

        case "CANCELLED":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
}

function eventDisplayId(id: number) {
    return `EVT-${String(id).padStart(3, "0")}`;
}

function emptyForm(): EventForm {
    return {
        customer_id: "",
        event_type: "Wedding",
        event_date: "",
        location: "",
        venue: "",
        guest_count: "",
        budget: "",
        status: "PLANNING",
        notes: "",
    };
}

/* =========================================================
   EVENTS PAGE
========================================================= */

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedEvent, setSelectedEvent] =
        useState<Event | null>(null);

    const [editingEvent, setEditingEvent] =
        useState<Event | null>(null);

    const [deletingEvent, setDeletingEvent] =
        useState<Event | null>(null);

    const [showAddEvent, setShowAddEvent] =
        useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [form, setForm] =
        useState<EventForm>(emptyForm());

    /* =====================================================
       FETCH EVENTS
    ===================================================== */

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await adminApi.get<any>(
                "/api/events/"
            );

            const eventData = Array.isArray(data)
                ? data
                : data.events || data.data || [];

            setEvents(eventData);
        } catch (err) {
            console.error(
                "Failed to fetch events:",
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
                    : "Unable to load events."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    /* =====================================================
       FETCH CUSTOMERS
    ===================================================== */

    const fetchCustomers = useCallback(async () => {

        try {
            const data = await adminApi.get<any>(
                "/api/customers/"
            );

            const customerData = Array.isArray(data)
                ? data
                : data.customers || data.data || [];

            setCustomers(customerData);
        } catch (err) {
            console.error(
                "Failed to fetch customers:",
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
                    : "Unable to load customers."
            );
        }
    }, []);

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        fetchEvents();
        fetchCustomers();
    }, [fetchEvents, fetchCustomers]);

    /* =====================================================
       CUSTOMER NAME
    ===================================================== */

    const getCustomerName = useCallback(
        (customerId: number) => {
            const customer = customers.find(
                (item) => item.id === customerId
            );

            return (
                customer?.full_name ||
                `Customer #${customerId}`
            );
        },
        [customers]
    );

    /* =====================================================
       FILTER EVENTS
    ===================================================== */

    const filteredEvents = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return events.filter((event) => {
            const customerName =
                getCustomerName(
                    event.customer_id
                ).toLowerCase();

            const matchesSearch =
                !query ||
                event.event_type
                    .toLowerCase()
                    .includes(query) ||
                event.location
                    .toLowerCase()
                    .includes(query) ||
                (event.venue || "")
                    .toLowerCase()
                    .includes(query) ||
                customerName.includes(query) ||
                eventDisplayId(event.id)
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                event.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        events,
        search,
        statusFilter,
        getCustomerName,
    ]);

    /* =====================================================
       STATS
    ===================================================== */

    const totalEvents = events.length;

    const confirmedEvents = events.filter(
        (event) =>
            event.status === "CONFIRMED"
    ).length;

    const planningEvents = events.filter(
        (event) =>
            event.status === "PLANNING"
    ).length;

    const completedEvents = events.filter(
        (event) =>
            event.status === "COMPLETED"
    ).length;

    /* =====================================================
       CREATE EVENT
    ===================================================== */

    const handleCreateEvent = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!form.customer_id) {
            setError(
                "Please select a customer."
            );
            return;
        }

        if (!form.event_date) {
            setError(
                "Event date is required."
            );
            return;
        }

        if (!form.location.trim()) {
            setError(
                "Location is required."
            );
            return;
        }

        const guestCount = Number(
            form.guest_count
        );

        if (
            !form.guest_count ||
            Number.isNaN(guestCount) ||
            guestCount <= 0
        ) {
            setError(
                "Guest count must be greater than 0."
            );
            return;
        }

        const budget =
            form.budget.trim() === ""
                ? null
                : Number(form.budget);

        if (
            budget !== null &&
            (Number.isNaN(budget) ||
                budget < 0)
        ) {
            setError(
                "Budget must be a valid non-negative number."
            );
            return;
        }

        try {
            setSaving(true);

            const data = await adminApi.post<any>(
                "/api/events/",
                {
                    customer_id:
                        Number(form.customer_id),
                    event_type:
                        form.event_type.trim(),
                    event_date:
                        form.event_date,
                    location:
                        form.location.trim(),
                    venue:
                        form.venue.trim() ||
                        null,
                    guest_count:
                        guestCount,
                    budget,
                    status:
                        form.status,
                    notes:
                        form.notes.trim() ||
                        null,
                }
            );

            console.log(
                "Event created successfully:",
                data
            );

            setShowAddEvent(false);
            setForm(emptyForm());

            setSuccess(
                "Event created successfully."
            );

            await fetchEvents();

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error(
                "Create event error:",
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
                    : "Unable to create event."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       OPEN EDIT
    ===================================================== */

    const openEditEvent = (
        event: Event
    ) => {
        setSelectedEvent(null);

        setForm({
            customer_id: String(
                event.customer_id
            ),
            event_type:
                event.event_type,
            event_date:
                event.event_date,
            location:
                event.location,
            venue:
                event.venue || "",
            guest_count:
                String(event.guest_count),
            budget:
                event.budget === null ||
                    event.budget === undefined
                    ? ""
                    : String(event.budget),
            status:
                event.status,
            notes:
                event.notes || "",
        });

        setEditingEvent(event);
        setError("");
        setSuccess("");
    };

    /* =====================================================
       UPDATE EVENT
    ===================================================== */

    const handleUpdateEvent = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!editingEvent) {
            return;
        }

        setError("");
        setSuccess("");


        if (!form.customer_id) {
            setError(
                "Please select a customer."
            );
            return;
        }

        if (!form.event_date) {
            setError(
                "Event date is required."
            );
            return;
        }

        if (!form.location.trim()) {
            setError(
                "Location is required."
            );
            return;
        }

        const guestCount = Number(
            form.guest_count
        );

        if (
            !form.guest_count ||
            Number.isNaN(guestCount) ||
            guestCount <= 0
        ) {
            setError(
                "Guest count must be greater than 0."
            );
            return;
        }

        const budget =
            form.budget.trim() === ""
                ? null
                : Number(form.budget);

        if (
            budget !== null &&
            (Number.isNaN(budget) ||
                budget < 0)
        ) {
            setError(
                "Budget must be a valid non-negative number."
            );
            return;
        }

        try {
            setSaving(true);

            const data = await adminApi.put<any>(
                `/api/events/${editingEvent.id}`,
                {
                    customer_id:
                        Number(form.customer_id),
                    event_type:
                        form.event_type.trim(),
                    event_date:
                        form.event_date,
                    location:
                        form.location.trim(),
                    venue:
                        form.venue.trim() ||
                        null,
                    guest_count:
                        guestCount,
                    budget,
                    status:
                        form.status,
                    notes:
                        form.notes.trim() ||
                        null,
                }
            );

            console.log(
                "Event updated successfully:",
                data
            );

            setEditingEvent(null);
            setForm(emptyForm());

            setSuccess(
                "Event updated successfully."
            );

            await fetchEvents();

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error(
                "Update event error:",
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
                    : "Unable to update event."
            );
        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       DELETE EVENT
    ===================================================== */

    const handleDeleteEvent = async () => {
        if (!deletingEvent) {
            return;
        }

        setError("");
        setSuccess("");


        try {
            setDeleting(true);

            const data = await adminApi.delete<any>(
                `/api/events/${deletingEvent.id}`
            );

            console.log(
                "Event deleted successfully:",
                data
            );

            setDeletingEvent(null);

            if (
                selectedEvent?.id ===
                deletingEvent.id
            ) {
                setSelectedEvent(null);
            }

            setSuccess(
                "Event deleted successfully."
            );

            await fetchEvents();

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        } catch (err) {
            console.error(
                "Delete event error:",
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
                    : "Unable to delete event."
            );
        } finally {
            setDeleting(false);
        }
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = async () => {
        setError("");
        setSuccess("");

        await Promise.all([
            fetchEvents(),
            fetchCustomers(),
        ]);
    };

    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#35030F]">
            {/* SIDEBAR */}

            <AdminSidebar
                mobileMenuOpen={
                    mobileMenuOpen
                }
                setMobileMenuOpen={
                    setMobileMenuOpen
                }
            />

            {/* MAIN */}

            <main className="min-h-screen lg:ml-[270px]">
                {/* =================================================
                       TOP HEADER
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
                                Events
                            </h1>
                        </div>

                        {/* ONLY MOBILE MENU */}

                        <button
                            type="button"
                            onClick={() =>
                                setMobileMenuOpen(
                                    true
                                )
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D6A928]/40 bg-white text-xl text-[#39030F] shadow-sm transition hover:bg-[#4A0618] hover:text-[#D6A928] lg:hidden"
                            aria-label="Open admin menu"
                        >
                            <Menu size={21} />
                        </button>
                    </div>
                </header>

                {/* =================================================
                       CONTENT
                    ================================================= */}

                <section className="px-5 py-7 md:px-8 md:py-9">
                    {/* PAGE HEADING */}

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B08A1A]">
                                Event Operations
                            </p>

                            <h2
                                className="text-4xl font-semibold text-[#39030F] md:text-5xl"
                                style={{
                                    fontFamily:
                                        "Georgia, serif",
                                }}
                            >
                                Manage Events
                            </h2>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75655C]">
                                Create, update and track
                                every SS UTSAV event
                                from one place.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={
                                    handleRefresh
                                }
                                className="rounded-xl border border-[#D8CBBB] bg-white px-5 py-3.5 text-sm font-semibold text-[#39030F] transition hover:border-[#B08A1A] hover:bg-[#FCFAF7]"
                            >
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setSuccess("");
                                    setForm(
                                        emptyForm()
                                    );
                                    setShowAddEvent(
                                        true
                                    );
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#4A0618] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#39030F]"
                            >
                                <Plus size={18} />
                                Add Event
                            </button>
                        </div>
                    </div>

                    {/* SUCCESS */}

                    {success && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                            {success}
                        </div>
                    )}

                    {/* ERROR */}

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                                        !
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-red-800">
                                            Event Error
                                        </h3>

                                        <p className="mt-1 text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError("")
                                    }
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                           STATS
                        ================================================= */}

                    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Events"
                            value={
                                totalEvents
                            }
                            subtitle="All events"
                            icon={
                                <CalendarDays
                                    size={20}
                                />
                            }
                        />

                        <StatCard
                            title="Confirmed"
                            value={
                                confirmedEvents
                            }
                            subtitle="Confirmed events"
                            icon={
                                <CalendarDays
                                    size={20}
                                />
                            }
                        />

                        <StatCard
                            title="Planning"
                            value={
                                planningEvents
                            }
                            subtitle="Currently planning"
                            icon={
                                <Clock size={20} />
                            }
                        />

                        <StatCard
                            title="Completed"
                            value={
                                completedEvents
                            }
                            subtitle="Successfully completed"
                            icon={
                                <CalendarDays
                                    size={20}
                                />
                            }
                        />
                    </div>

                    {/* =================================================
                           SEARCH
                        ================================================= */}

                    <div className="mt-8 rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:max-w-lg">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9B8B82]"
                                />

                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search event, client, venue, location..."
                                    className="w-full rounded-xl border border-[#E4D9CD] bg-[#FCFAF7] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#B08A1A]"
                                />
                            </div>

                            <div className="relative w-full lg:w-60">
                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target
                                                .value
                                        )
                                    }
                                    className="w-full appearance-none rounded-xl border border-[#E4D9CD] bg-[#FCFAF7] px-4 py-3 pr-10 text-sm outline-none focus:border-[#B08A1A]"
                                >
                                    <option value="ALL">
                                        All Statuses
                                    </option>

                                    {statusOptions.map(
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
                                                {statusLabel(
                                                    status
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>

                                <ChevronDown
                                    size={17}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7A70]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                           DESKTOP TABLE
                        ================================================= */}

                    <div className="mt-6 hidden overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm xl:block">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1150px]">
                                <thead className="border-b border-[#eadfce] bg-[#FCFAF7]">
                                    <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-[#8A7A70]">
                                        <th className="px-5 py-4">
                                            Event
                                        </th>

                                        <th className="px-5 py-4">
                                            Client
                                        </th>

                                        <th className="px-5 py-4">
                                            Date
                                        </th>

                                        <th className="px-5 py-4">
                                            Guests
                                        </th>

                                        <th className="px-5 py-4">
                                            Venue
                                        </th>

                                        <th className="px-5 py-4">
                                            Budget
                                        </th>

                                        <th className="px-5 py-4">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <LoadingRows />
                                    ) : (
                                        filteredEvents.map(
                                            (
                                                event
                                            ) => (
                                                <tr
                                                    key={
                                                        event.id
                                                    }
                                                    className="border-b border-[#F0E8DE] last:border-0 hover:bg-[#FFFCF8]"
                                                >
                                                    <td className="px-5 py-5">
                                                        <p className="font-semibold text-[#39030F]">
                                                            {
                                                                event.event_type
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-[#9B8B82]">
                                                            {eventDisplayId(
                                                                event.id
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="text-sm font-medium">
                                                            {getCustomerName(
                                                                event.customer_id
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <p className="text-sm font-medium">
                                                            {formatDate(
                                                                event.event_date
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-5 text-sm">
                                                        {
                                                            event.guest_count
                                                        }
                                                    </td>

                                                    <td className="max-w-[220px] px-5 py-5">
                                                        <p className="truncate text-sm text-[#665850]">
                                                            {event.venue ||
                                                                event.location}
                                                        </p>

                                                        {event.venue &&
                                                            event.location && (
                                                                <p className="mt-1 truncate text-xs text-[#9B8B82]">
                                                                    {
                                                                        event.location
                                                                    }
                                                                </p>
                                                            )}
                                                    </td>

                                                    <td className="px-5 py-5 text-sm font-medium">
                                                        {formatCurrency(
                                                            event.budget
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <span
                                                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                                                                event.status
                                                            )}`}
                                                        >
                                                            {statusLabel(
                                                                event.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedEvent(
                                                                        event
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4D9CD] px-3 py-2 text-xs font-semibold transition hover:border-[#B08A1A] hover:text-[#8A6A0C]"
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
                                                                    openEditEvent(
                                                                        event
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4D9CD] px-3 py-2 text-xs font-semibold transition hover:border-[#B08A1A] hover:text-[#8A6A0C]"
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
                                                                    setDeletingEvent(
                                                                        event
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =================================================
                           MOBILE / TABLET CARDS
                        ================================================= */}

                    <div className="mt-6 grid gap-4 xl:hidden">
                        {loading ? (
                            <LoadingCards />
                        ) : (
                            filteredEvents.map(
                                (
                                    event
                                ) => (
                                    <div
                                        key={
                                            event.id
                                        }
                                        className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-serif text-xl font-semibold text-[#39030F]">
                                                    {
                                                        event.event_type
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-[#9B8B82]">
                                                    {eventDisplayId(
                                                        event.id
                                                    )}
                                                </p>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${statusClasses(
                                                    event.status
                                                )}`}
                                            >
                                                {statusLabel(
                                                    event.status
                                                )}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <InfoItem
                                                icon={
                                                    <Users
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                label="Client"
                                                value={getCustomerName(
                                                    event.customer_id
                                                )}
                                            />

                                            <InfoItem
                                                icon={
                                                    <CalendarDays
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                label="Date"
                                                value={formatDate(
                                                    event.event_date
                                                )}
                                            />

                                            <InfoItem
                                                icon={
                                                    <Users
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                label="Guests"
                                                value={`${event.guest_count} guests`}
                                            />

                                            <InfoItem
                                                icon={
                                                    <MapPin
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                label="Location"
                                                value={
                                                    event.location
                                                }
                                            />

                                            <InfoItem
                                                icon={
                                                    <MapPin
                                                        size={
                                                            16
                                                        }
                                                    />
                                                }
                                                label="Venue"
                                                value={
                                                    event.venue ||
                                                    "Not specified"
                                                }
                                            />

                                            <InfoItem
                                                icon={
                                                    <span className="text-sm">
                                                        ₹
                                                    </span>
                                                }
                                                label="Budget"
                                                value={formatCurrency(
                                                    event.budget
                                                )}
                                            />
                                        </div>

                                        <div className="mt-5 grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedEvent(
                                                        event
                                                    )
                                                }
                                                className="flex items-center justify-center gap-1 rounded-xl bg-[#4A0618] py-3 text-xs font-semibold text-white"
                                            >
                                                <Eye
                                                    size={
                                                        15
                                                    }
                                                />
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditEvent(
                                                        event
                                                    )
                                                }
                                                className="flex items-center justify-center gap-1 rounded-xl border border-[#DED2C6] py-3 text-xs font-semibold text-[#39030F]"
                                            >
                                                <Edit3
                                                    size={
                                                        15
                                                    }
                                                />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeletingEvent(
                                                        event
                                                    )
                                                }
                                                className="flex items-center justify-center gap-1 rounded-xl border border-red-200 py-3 text-xs font-semibold text-red-600"
                                            >
                                                <Trash2
                                                    size={
                                                        15
                                                    }
                                                />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>

                    {/* EMPTY */}

                    {!loading &&
                        filteredEvents.length ===
                        0 && (
                            <div className="mt-6 rounded-2xl border border-dashed border-[#D9CABC] bg-white p-12 text-center">
                                <CalendarDays
                                    className="mx-auto text-[#B08A1A]"
                                    size={35}
                                />

                                <h3
                                    className="mt-4 text-2xl font-semibold text-[#39030F]"
                                    style={{
                                        fontFamily:
                                            "Georgia, serif",
                                    }}
                                >
                                    No events found
                                </h3>

                                <p className="mt-2 text-sm text-[#817168]">
                                    Try changing your
                                    search or status
                                    filter.
                                </p>

                                {events.length ===
                                    0 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddEvent(
                                                    true
                                                )
                                            }
                                            className="mt-5 rounded-xl bg-[#4A0618] px-5 py-3 text-sm font-semibold text-white"
                                        >
                                            Create First Event
                                        </button>
                                    )}
                            </div>
                        )}
                </section>
            </main>

            {/* =====================================================
                   VIEW MODAL
                ===================================================== */}

            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    customerName={getCustomerName(
                        selectedEvent.customer_id
                    )}
                    onClose={() =>
                        setSelectedEvent(null)
                    }
                    onEdit={() =>
                        openEditEvent(
                            selectedEvent
                        )
                    }
                    onDelete={() => {
                        setSelectedEvent(null);
                        setDeletingEvent(
                            selectedEvent
                        );
                    }}
                />
            )}

            {/* =====================================================
                   ADD MODAL
                ===================================================== */}

            {showAddEvent && (
                <EventFormModal
                    title="Add New Event"
                    subtitle="Create an event for an existing SS UTSAV customer."
                    customers={customers}
                    form={form}
                    setForm={setForm}
                    saving={saving}
                    onClose={() => {
                        setShowAddEvent(false);
                        setForm(emptyForm());
                    }}
                    onSubmit={
                        handleCreateEvent
                    }
                />
            )}

            {/* =====================================================
                   EDIT MODAL
                ===================================================== */}

            {editingEvent && (
                <EventFormModal
                    title="Edit Event"
                    subtitle={`Update ${eventDisplayId(
                        editingEvent.id
                    )}`}
                    customers={customers}
                    form={form}
                    setForm={setForm}
                    saving={saving}
                    onClose={() => {
                        setEditingEvent(null);
                        setForm(emptyForm());
                    }}
                    onSubmit={
                        handleUpdateEvent
                    }
                />
            )}

            {/* =====================================================
                   DELETE MODAL
                ===================================================== */}

            {deletingEvent && (
                <DeleteEventModal
                    event={deletingEvent}
                    deleting={deleting}
                    onClose={() =>
                        setDeletingEvent(
                            null
                        )
                    }
                    onDelete={
                        handleDeleteEvent
                    }
                />
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
    value: number | string;
    subtitle: string;
    icon: React.ReactNode;
}) {
    return (
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

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4A0618] text-[#D6A928]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3 rounded-xl bg-[#FCFAF7] p-3">
            <div className="mt-0.5 shrink-0 text-[#A37B12]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-medium text-[#39030F]">
                    {value}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   EVENT DETAILS MODAL
========================================================= */

function EventDetailsModal({
    event,
    customerName,
    onClose,
    onEdit,
    onDelete,
}: {
    event: Event;
    customerName: string;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1D050B]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}

                <div className="flex items-start justify-between border-b border-[#E7DDCF] p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A37B12]">
                            Event Details
                        </p>

                        <h2
                            className="mt-2 text-3xl font-semibold text-[#39030F]"
                            style={{
                                fontFamily:
                                    "Georgia, serif",
                            }}
                        >
                            {
                                event.event_type
                            }
                        </h2>

                        <p className="mt-1 text-sm text-[#8A7A70]">
                            {eventDisplayId(
                                event.id
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-[#75655C] transition hover:bg-[#F6F0E9]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Details */}

                <div className="grid gap-4 p-6 sm:grid-cols-2">
                    <Detail
                        label="Client"
                        value={
                            customerName
                        }
                    />

                    <Detail
                        label="Event Type"
                        value={
                            event.event_type
                        }
                    />

                    <Detail
                        label="Event Date"
                        value={formatDate(
                            event.event_date
                        )}
                    />

                    <Detail
                        label="Guest Count"
                        value={`${event.guest_count} guests`}
                    />

                    <Detail
                        label="Location"
                        value={
                            event.location
                        }
                    />

                    <Detail
                        label="Venue"
                        value={
                            event.venue ||
                            "Not specified"
                        }
                    />

                    <Detail
                        label="Budget"
                        value={formatCurrency(
                            event.budget
                        )}
                    />

                    <Detail
                        label="Status"
                        value={statusLabel(
                            event.status
                        )}
                        status={
                            event.status
                        }
                    />

                    <div className="sm:col-span-2">
                        <Detail
                            label="Notes"
                            value={
                                event.notes ||
                                "No notes added."
                            }
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Detail
                            label="Created At"
                            value={
                                event.created_at
                                    ? new Date(
                                        event.created_at
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                    : "—"
                            }
                        />
                    </div>
                </div>

                {/* Footer */}

                <div className="flex flex-col gap-3 border-t border-[#E7DDCF] bg-[#FCFAF7] p-6 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                        <Trash2
                            size={16}
                        />
                        Delete
                    </button>

                    <button
                        type="button"
                        onClick={onEdit}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#DED2C6] px-5 py-3 text-sm font-semibold text-[#39030F] transition hover:bg-white"
                    >
                        <Edit3
                            size={16}
                        />
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#39030F]"
                    >
                        Close
                    </button>
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
    status,
}: {
    label: string;
    value: string;
    status?: EventStatus;
}) {
    return (
        <div className="rounded-xl border border-[#E9DFD4] bg-[#FFFCF8] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B8B82]">
                {label}
            </p>

            {status ? (
                <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClasses(
                        status
                    )}`}
                >
                    {value}
                </span>
            ) : (
                <p className="mt-2 break-words text-sm font-semibold text-[#39030F]">
                    {value}
                </p>
            )}
        </div>
    );
}

/* =========================================================
   EVENT FORM MODAL
========================================================= */

function EventFormModal({
    title,
    subtitle,
    customers,
    form,
    setForm,
    saving,
    onClose,
    onSubmit,
}: {
    title: string;
    subtitle: string;
    customers: Customer[];
    form: EventForm;
    setForm: React.Dispatch<
        React.SetStateAction<EventForm>
    >;
    saving: boolean;
    onClose: () => void;
    onSubmit: (
        e: React.FormEvent<HTMLFormElement>
    ) => void;
}) {
    const selectedCustomer = customers.find(
        (customer) =>
            String(customer.id) ===
            form.customer_id
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1D050B]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}

                <div className="flex items-center justify-between border-b border-[#E7DDCF] p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A37B12]">
                            Event Management
                        </p>

                        <h2
                            className="mt-1 text-3xl font-semibold text-[#39030F]"
                            style={{
                                fontFamily:
                                    "Georgia, serif",
                            }}
                        >
                            {title}
                        </h2>

                        <p className="mt-2 text-sm text-[#8A7A70]">
                            {subtitle}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-full p-2 transition hover:bg-[#F6F0E9] disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}

                <form
                    onSubmit={onSubmit}
                    className="space-y-5 p-6"
                >
                    {/* Customer */}

                    <SelectField
                        label="Customer *"
                        value={
                            form.customer_id
                        }
                        placeholder="Select customer"
                        onChange={(value) =>
                            setForm(
                                (
                                    current
                                ) => ({
                                    ...current,
                                    customer_id:
                                        value,
                                })
                            )
                        }
                        options={customers.map(
                            (
                                customer
                            ) => ({
                                value: String(
                                    customer.id
                                ),
                                label: `${customer.full_name} — ${customer.phone}`,
                            })
                        )}
                    />

                    {selectedCustomer && (
                        <div className="mt-3 rounded-xl border border-[#E9DFD4] bg-[#FFFCF8] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B8B82]">
                                Selected Client Details
                            </p>

                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                                        Name
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[#39030F]">
                                        {
                                            selectedCustomer.full_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                                        Phone
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[#39030F]">
                                        {selectedCustomer.phone ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                                        Email
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[#39030F]">
                                        {selectedCustomer.email ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                                        Address
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[#39030F]">
                                        {selectedCustomer.address ||
                                            "Not provided"}
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#9B8B82]">
                                        Client Notes
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-[#39030F]">
                                        {selectedCustomer.notes ||
                                            "No notes"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {customers.length ===
                        0 && (
                            <p className="-mt-3 text-xs text-red-600">
                                No customers are
                                available. Create a
                                customer first from
                                the Clients page.
                            </p>
                        )}

                    {/* Event Type / Status */}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField
                            label="Event Type *"
                            value={
                                form.event_type
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        event_type:
                                            value,
                                    })
                                )
                            }
                            options={eventTypes.map(
                                (
                                    type
                                ) => ({
                                    value: type,
                                    label: type,
                                })
                            )}
                        />

                        <SelectField
                            label="Status"
                            value={
                                form.status
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        status:
                                            value as EventStatus,
                                    })
                                )
                            }
                            options={statusOptions.map(
                                (
                                    status
                                ) => ({
                                    value: status,
                                    label: statusLabel(
                                        status
                                    ),
                                })
                            )}
                        />
                    </div>

                    {/* Date */}

                    <InputField
                        label="Event Date *"
                        type="date"
                        value={
                            form.event_date
                        }
                        onChange={(value) =>
                            setForm(
                                (
                                    current
                                ) => ({
                                    ...current,
                                    event_date:
                                        value,
                                })
                            )
                        }
                    />

                    {/* Location / Venue */}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <InputField
                            label="Location *"
                            value={
                                form.location
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        location:
                                            value,
                                    })
                                )
                            }
                            placeholder="Bengaluru"
                        />

                        <InputField
                            label="Venue"
                            value={
                                form.venue
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        venue:
                                            value,
                                    })
                                )
                            }
                            placeholder="Venue name"
                        />
                    </div>

                    {/* Guest / Budget */}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <InputField
                            label="Guest Count *"
                            type="number"
                            min="1"
                            value={
                                form.guest_count
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        guest_count:
                                            value,
                                    })
                                )
                            }
                            placeholder="150"
                        />

                        <InputField
                            label="Budget"
                            type="number"
                            min="0"
                            value={
                                form.budget
                            }
                            onChange={(value) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        budget:
                                            value,
                                    })
                                )
                            }
                            placeholder="250000"
                        />
                    </div>

                    {/* Notes */}

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#75655C]">
                            Notes
                        </label>

                        <textarea
                            value={
                                form.notes
                            }
                            onChange={(e) =>
                                setForm(
                                    (
                                        current
                                    ) => ({
                                        ...current,
                                        notes:
                                            e
                                                .target
                                                .value,
                                    })
                                )
                            }
                            rows={4}
                            placeholder="Additional event requirements..."
                            className="w-full resize-none rounded-xl border border-[#E4D9CD] bg-[#FCFAF7] px-4 py-3 text-sm outline-none transition focus:border-[#B08A1A]"
                        />
                    </div>

                    {/* Buttons */}

                    <div className="flex flex-col-reverse gap-3 border-t border-[#E7DDCF] pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-[#DED2C6] px-5 py-3 text-sm font-semibold transition hover:bg-[#FCFAF7] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                customers.length ===
                                0
                            }
                            className="rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#39030F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : title ===
                                    "Edit Event"
                                    ? "Save Changes"
                                    : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    min,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    placeholder?: string;
    type?: string;
    min?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#75655C]">
                {label}
            </label>

            <input
                type={type}
                min={min}
                value={value}
                onChange={(e) =>
                    onChange(
                        e.target.value
                    )
                }
                placeholder={placeholder}
                className="w-full rounded-xl border border-[#E4D9CD] bg-[#FCFAF7] px-4 py-3 text-sm outline-none transition focus:border-[#B08A1A]"
            />
        </div>
    );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (
        value: string
    ) => void;
    options: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-[#75655C]">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) =>
                        onChange(
                            e.target.value
                        )
                    }
                    className="w-full appearance-none rounded-xl border border-[#E4D9CD] bg-[#FCFAF7] px-4 py-3 pr-10 text-sm outline-none focus:border-[#B08A1A]"
                >
                    {placeholder && (
                        <option value="">
                            {placeholder}
                        </option>
                    )}

                    {options.map(
                        (
                            option
                        ) => (
                            <option
                                key={
                                    option.value
                                }
                                value={
                                    option.value
                                }
                            >
                                {
                                    option.label
                                }
                            </option>
                        )
                    )}
                </select>

                <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8A7A70]"
                />
            </div>
        </div>
    );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function DeleteEventModal({
    event,
    deleting,
    onClose,
    onDelete,
}: {
    event: Event;
    deleting: boolean;
    onClose: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#1D050B]/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <Trash2
                            size={22}
                        />
                    </div>

                    <h2
                        className="mt-5 text-2xl font-semibold text-[#39030F]"
                        style={{
                            fontFamily:
                                "Georgia, serif",
                        }}
                    >
                        Delete Event?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#75655C]">
                        You are about to delete{" "}
                        <span className="font-semibold text-[#39030F]">
                            {
                                event.event_type
                            }
                        </span>{" "}
                        (
                        {eventDisplayId(
                            event.id
                        )}
                        ).
                    </p>

                    <p className="mt-3 text-xs leading-5 text-[#9B8B82]">
                        If this event is linked to a
                        quotation or payment, the
                        backend will prevent deletion.
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-[#E7DDCF] bg-[#FCFAF7] p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="rounded-xl border border-[#DED2C6] px-5 py-3 text-sm font-semibold text-[#39030F] transition hover:bg-white disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={deleting}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Trash2
                            size={16}
                        />

                        {deleting
                            ? "Deleting..."
                            : "Delete Event"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   LOADING ROWS
========================================================= */

function LoadingRows() {
    return (
        <>
            {Array.from({
                length: 5,
            }).map((_, index) => (
                <tr
                    key={index}
                    className="border-b border-[#F0E8DE]"
                >
                    {Array.from({
                        length: 8,
                    }).map(
                        (
                            _,
                            cellIndex
                        ) => (
                            <td
                                key={
                                    cellIndex
                                }
                                className="px-5 py-6"
                            >
                                <div className="h-4 animate-pulse rounded bg-[#F2ECE5]" />
                            </td>
                        )
                    )}
                </tr>
            ))}
        </>
    );
}

/* =========================================================
   LOADING CARDS
========================================================= */

function LoadingCards() {
    return (
        <>
            {Array.from({
                length: 3,
            }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-[#E7DDCF] bg-white p-5 shadow-sm"
                >
                    <div className="h-6 w-1/2 animate-pulse rounded bg-[#F2ECE5]" />

                    <div className="mt-5 space-y-3">
                        <div className="h-12 animate-pulse rounded-xl bg-[#F8F3ED]" />

                        <div className="h-12 animate-pulse rounded-xl bg-[#F8F3ED]" />

                        <div className="h-12 animate-pulse rounded-xl bg-[#F8F3ED]" />
                    </div>
                </div>
            ))}
        </>
    );
}