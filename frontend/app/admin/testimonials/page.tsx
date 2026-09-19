"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi, API_BASE_URL } from "@/lib/api";
const API_BASE = API_BASE_URL;

type TestimonialItem = {
    id: number;
    customer_name: string;
    event_type: string | null;
    review: string;
    image_url: string | null;
    rating: number;
    is_active: boolean;
    created_at: string;
};

type TestimonialForm = {
    customer_name: string;
    event_type: string;
    review: string;
    image_url: string;
    rating: number;
    is_active: boolean;
};

const emptyForm: TestimonialForm = {
    customer_name: "",
    event_type: "",
    review: "",
    image_url: "",
    rating: 5,
    is_active: true,
};

const eventTypes = [
    "Wedding",
    "Engagement",
    "Birthday",
    "Baby Shower",
    "Anniversary",
    "Corporate Event",
    "College Event",
    "Cultural Event",
    "Private Event",
    "Other",
];

function getImageUrl(imageUrl: string | null) {
    if (!imageUrl) return "";

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `${API_BASE}${imageUrl}`;
    }

    return imageUrl;
}

function formatDate(date: string) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getSafeRating(rating: number | null | undefined) {
    if (!rating || rating < 1) return 5;
    if (rating > 5) return 5;

    return rating;
}

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<
        TestimonialItem[]
    >([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [eventFilter, setEventFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedTestimonial, setSelectedTestimonial] =
        useState<TestimonialItem | null>(null);

    const [form, setForm] =
        useState<TestimonialForm>(emptyForm);

    // =====================================================
    // FETCH TESTIMONIALS
    // =====================================================

    async function fetchTestimonials() {
        try {
            setLoading(true);

            const data = await adminApi.get<any>(
                "/api/testimonials/"
            );

            setTestimonials(
                Array.isArray(data)
                    ? data.map((item: TestimonialItem) => ({
                        ...item,
                        rating: getSafeRating(item.rating),
                    }))
                    : []
            );
        } catch (error) {
            console.error(
                "Testimonials fetch error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to load testimonials."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTestimonials();
    }, []);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredTestimonials = useMemo(() => {
        return testimonials.filter((item) => {
            const searchText = search
                .toLowerCase()
                .trim();

            const matchesSearch =
                !searchText ||
                item.customer_name
                    .toLowerCase()
                    .includes(searchText) ||
                (item.event_type || "")
                    .toLowerCase()
                    .includes(searchText) ||
                item.review
                    .toLowerCase()
                    .includes(searchText);

            const matchesEvent =
                eventFilter === "ALL" ||
                item.event_type === eventFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" &&
                    item.is_active) ||
                (statusFilter === "INACTIVE" &&
                    !item.is_active);

            return (
                matchesSearch &&
                matchesEvent &&
                matchesStatus
            );
        });
    }, [
        testimonials,
        search,
        eventFilter,
        statusFilter,
    ]);

    // =====================================================
    // STATS
    // =====================================================

    const totalTestimonials =
        testimonials.length;

    const activeTestimonials =
        testimonials.filter(
            (item) => item.is_active
        ).length;

    const inactiveTestimonials =
        testimonials.filter(
            (item) => !item.is_active
        ).length;

    const withImages =
        testimonials.filter(
            (item) =>
                item.image_url &&
                item.image_url.trim() !== ""
        ).length;

    // =====================================================
    // FORM
    // =====================================================

    function updateForm<K extends keyof TestimonialForm>(
        field: K,
        value: TestimonialForm[K]
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function resetForm() {
        setForm({
            ...emptyForm,
        });
    }

    // =====================================================
    // ADD
    // =====================================================

    function openAddModal() {
        setSelectedTestimonial(null);
        resetForm();
        setShowAddModal(true);
    }

    // =====================================================
    // EDIT
    // =====================================================

    function openEditModal(
        item: TestimonialItem
    ) {
        setSelectedTestimonial(item);

        setForm({
            customer_name: item.customer_name,
            event_type: item.event_type || "",
            review: item.review,
            image_url: item.image_url || "",
            rating: getSafeRating(item.rating),
            is_active: item.is_active,
        });

        setShowEditModal(true);
    }

    // =====================================================
    // VIEW
    // =====================================================

    function openViewModal(
        item: TestimonialItem
    ) {
        setSelectedTestimonial(item);
        setShowViewModal(true);
    }

    // =====================================================
    // DELETE
    // =====================================================

    function openDeleteModal(
        item: TestimonialItem
    ) {
        setSelectedTestimonial(item);
        setShowDeleteModal(true);
    }

    // =====================================================
    // CREATE
    // =====================================================

    async function createTestimonial() {
        if (!form.customer_name.trim()) {
            alert("Please enter customer name.");
            return;
        }

        if (!form.review.trim()) {
            alert("Please enter customer review.");
            return;
        }

        if (
            form.rating < 1 ||
            form.rating > 5
        ) {
            alert("Rating must be between 1 and 5.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                customer_name:
                    form.customer_name.trim(),

                event_type:
                    form.event_type.trim() || null,

                review:
                    form.review.trim(),

                image_url:
                    form.image_url.trim() || null,

                rating:
                    getSafeRating(form.rating),

                is_active:
                    form.is_active,
            };

            const data = await adminApi.post<any>(
                "/api/testimonials/",
                payload
            );

            if (!data?.testimonial) {
                throw new Error(
                    "Testimonial was created but the server response is invalid."
                );
            }

            const createdTestimonial: TestimonialItem = {
                ...data.testimonial,
                rating: getSafeRating(
                    data.testimonial.rating
                ),
            };

            setTestimonials((previous) => [
                createdTestimonial,
                ...previous,
            ]);

            setShowAddModal(false);
            setSelectedTestimonial(null);
            resetForm();

            alert("Testimonial added successfully.");
        } catch (error) {
            console.error(
                "Create testimonial error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create testimonial."
            );
        } finally {
            setSaving(false);
        }
    }

    // =====================================================
    // UPDATE
    // =====================================================

    async function updateTestimonial() {

        if (!selectedTestimonial) {
            alert("No testimonial selected.");
            return;
        }

        if (!form.customer_name.trim()) {
            alert("Please enter customer name.");
            return;
        }

        if (!form.review.trim()) {
            alert("Please enter customer review.");
            return;
        }

        if (
            form.rating < 1 ||
            form.rating > 5
        ) {
            alert("Rating must be between 1 and 5.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                customer_name:
                    form.customer_name.trim(),

                event_type:
                    form.event_type.trim() || null,

                review:
                    form.review.trim(),

                image_url:
                    form.image_url.trim() || null,

                rating:
                    getSafeRating(form.rating),

                is_active:
                    form.is_active,
            };

            const data = await adminApi.put<any>(
                `/api/testimonials/${selectedTestimonial.id}`,
                payload
            );

            if (!data?.testimonial) {
                throw new Error(
                    "Testimonial was updated but the server response is invalid."
                );
            }
            const updatedTestimonial: TestimonialItem = {
                ...data.testimonial,
                rating: getSafeRating(
                    data.testimonial.rating
                ),
            };

            setTestimonials((previous) =>
                previous.map((item) =>
                    item.id === selectedTestimonial.id
                        ? updatedTestimonial
                        : item
                )
            );

            setShowEditModal(false);
            setSelectedTestimonial(null);
            resetForm();

            alert("Testimonial updated successfully.");
        } catch (error) {
            console.error(
                "Update testimonial error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update testimonial."
            );
        } finally {
            setSaving(false);
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    async function deleteTestimonial() {

        if (!selectedTestimonial) {
            alert("No testimonial selected.");
            return;
        }

        try {
            setSaving(true);

            await adminApi.delete<any>(
                `/api/testimonials/${selectedTestimonial.id}`
            );
            setTestimonials((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== selectedTestimonial.id
                )
            );

            setShowDeleteModal(false);
            setSelectedTestimonial(null);

            alert("Testimonial deleted successfully.");
        } catch (error) {
            console.error(
                "Delete testimonial error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete testimonial."
            );
        } finally {
            setSaving(false);
        }
    }

    // =====================================================
    // TOGGLE STATUS
    // =====================================================

    async function toggleStatus(
        item: TestimonialItem
    ) {
        try {
            const data = await adminApi.put<any>(
                `/api/testimonials/${item.id}`,
                {
                    is_active: !item.is_active,
                }
            );

            if (!data?.testimonial) {
                throw new Error(
                    "Status was updated but the server response is invalid."
                );
            }

            const updatedTestimonial: TestimonialItem = {
                ...data.testimonial,
                rating: getSafeRating(
                    data.testimonial.rating
                ),
            };

            setTestimonials((previous) =>
                previous.map((testimonial) =>
                    testimonial.id === item.id
                        ? updatedTestimonial
                        : testimonial
                )
            );
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update status."
            );
        }
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#39030F]">
            {/* SIDEBAR */}

            <AdminSidebar
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* MAIN */}

            <main className="min-h-screen lg:ml-[270px]">
                {/* HEADER */}

                <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eadfce] bg-[#FBF7F0]/95 px-5 backdrop-blur md:px-8">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A47718]">
                            Content Management
                        </p>

                        <h1 className="mt-1 font-serif text-2xl font-bold text-[#4A0618] md:text-3xl">
                            Testimonials
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={openAddModal}
                            className="hidden rounded-xl bg-[#4A0618] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] md:block"
                        >
                            + Add Testimonial
                        </button>

                        {/* MOBILE MENU */}

                        <button
                            onClick={() =>
                                setMobileMenuOpen(
                                    (previous) => !previous
                                )
                            }
                            className="rounded-xl border border-[#d9c9b4] bg-white px-3 py-2 text-xl text-[#4A0618] shadow-sm lg:hidden"
                        >
                            ☰
                        </button>
                    </div>
                </header>

                {/* CONTENT */}

                <section className="px-5 py-7 md:px-8 md:py-9">
                    {/* MOBILE ADD */}

                    <button
                        onClick={openAddModal}
                        className="mb-5 w-full rounded-xl bg-[#4A0618] px-5 py-3 font-bold text-white shadow-md md:hidden"
                    >
                        + Add Testimonial
                    </button>

                    {/* STATS */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Reviews"
                            value={totalTestimonials}
                            icon="☆"
                        />

                        <StatCard
                            title="Active Reviews"
                            value={activeTestimonials}
                            icon="✓"
                        />

                        <StatCard
                            title="Inactive Reviews"
                            value={inactiveTestimonials}
                            icon="○"
                        />

                        <StatCard
                            title="With Images"
                            value={withImages}
                            icon="♙"
                        />
                    </div>

                    {/* FILTERS */}

                    <div className="mt-7 rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                        <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
                            {/* SEARCH */}

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8775]">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search testimonials..."
                                    className="w-full rounded-xl border border-[#dfd1c0] bg-[#fffdfa] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                />
                            </div>

                            {/* EVENT */}

                            <select
                                value={eventFilter}
                                onChange={(event) =>
                                    setEventFilter(event.target.value)
                                }
                                className="rounded-xl border border-[#dfd1c0] bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                            >
                                <option value="ALL">
                                    All Events
                                </option>

                                {eventTypes.map((eventType) => (
                                    <option
                                        key={eventType}
                                        value={eventType}
                                    >
                                        {eventType}
                                    </option>
                                ))}
                            </select>

                            {/* STATUS */}

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                className="rounded-xl border border-[#dfd1c0] bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                            >
                                <option value="ALL">
                                    All Status
                                </option>

                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="INACTIVE">
                                    Inactive
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* LIST */}

                    <div className="mt-7">
                        {loading ? (
                            <LoadingState />
                        ) : filteredTestimonials.length ===
                            0 ? (
                            <EmptyState
                                onAdd={openAddModal}
                            />
                        ) : (
                            <>
                                {/* DESKTOP TABLE */}

                                <div className="hidden overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[1100px]">
                                            <thead>
                                                <tr className="border-b border-[#eadfce] bg-[#fffaf3] text-left">
                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Customer
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Event
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Review
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Image
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Created
                                                    </th>

                                                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredTestimonials.map(
                                                    (item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="border-b border-[#f0e7da] last:border-b-0 hover:bg-[#fffdfa]"
                                                        >
                                                            {/* CUSTOMER */}

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#f7edd7]">
                                                                        {item.image_url ? (
                                                                            <img
                                                                                src={getImageUrl(
                                                                                    item.image_url
                                                                                )}
                                                                                alt={
                                                                                    item.customer_name
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                                onError={(
                                                                                    event
                                                                                ) => {
                                                                                    event.currentTarget.style.display =
                                                                                        "none";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center font-serif text-lg font-bold text-[#A47718]">
                                                                                {item.customer_name
                                                                                    .charAt(0)
                                                                                    .toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-semibold text-[#4A0618]">
                                                                            {
                                                                                item.customer_name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#917c69]">
                                                                            #{item.id}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* EVENT */}

                                                            <td className="px-5 py-4">
                                                                {item.event_type ? (
                                                                    <span className="rounded-full bg-[#f7edd7] px-3 py-1 text-xs font-semibold text-[#805f10]">
                                                                        {
                                                                            item.event_type
                                                                        }
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm text-[#9a8877]">
                                                                        Not specified
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* REVIEW */}

                                                            <td className="px-5 py-4">
                                                                <div className="max-w-[330px]">
                                                                    <div className="mb-1 flex items-center gap-0.5 text-[#C49A27]">
                                                                        {[1, 2, 3, 4, 5].map(
                                                                            (
                                                                                star
                                                                            ) => (
                                                                                <span
                                                                                    key={
                                                                                        star
                                                                                    }
                                                                                >
                                                                                    {star <=
                                                                                        getSafeRating(
                                                                                            item.rating
                                                                                        )
                                                                                        ? "★"
                                                                                        : "☆"}
                                                                                </span>
                                                                            )
                                                                        )}
                                                                    </div>

                                                                    <p className="truncate text-sm leading-6 text-[#806f61]">
                                                                        {item.review}
                                                                    </p>
                                                                </div>
                                                            </td>

                                                            {/* IMAGE */}

                                                            <td className="px-5 py-4">
                                                                {item.image_url ? (
                                                                    <span className="text-xs font-semibold text-[#4A0618]">
                                                                        Available
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-[#9a8877]">
                                                                        No Image
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* STATUS */}

                                                            <td className="px-5 py-4">
                                                                <button
                                                                    onClick={() =>
                                                                        toggleStatus(
                                                                            item
                                                                        )
                                                                    }
                                                                    className={`rounded-full px-3 py-1 text-xs font-bold ${item.is_active
                                                                        ? "bg-green-100 text-green-700"
                                                                        : "bg-gray-100 text-gray-600"
                                                                        }`}
                                                                >
                                                                    {item.is_active
                                                                        ? "Active"
                                                                        : "Inactive"}
                                                                </button>
                                                            </td>

                                                            {/* DATE */}

                                                            <td className="px-5 py-4 text-sm text-[#806f61]">
                                                                {formatDate(
                                                                    item.created_at
                                                                )}
                                                            </td>

                                                            {/* ACTIONS */}

                                                            <td className="px-5 py-4">
                                                                <div className="flex justify-end gap-2">
                                                                    <ActionButton
                                                                        label="View"
                                                                        onClick={() =>
                                                                            openViewModal(
                                                                                item
                                                                            )
                                                                        }
                                                                    />

                                                                    <ActionButton
                                                                        label="Edit"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                item
                                                                            )
                                                                        }
                                                                    />

                                                                    <ActionButton
                                                                        label="Delete"
                                                                        danger
                                                                        onClick={() =>
                                                                            openDeleteModal(
                                                                                item
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* MOBILE CARDS */}

                                <div className="grid gap-4 lg:hidden">
                                    {filteredTestimonials.map(
                                        (item) => (
                                            <div
                                                key={item.id}
                                                className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm"
                                            >
                                                {/* IMAGE */}

                                                {item.image_url && (
                                                    <div className="aspect-[16/7] overflow-hidden bg-[#f2eadf]">
                                                        <img
                                                            src={getImageUrl(
                                                                item.image_url
                                                            )}
                                                            alt={
                                                                item.customer_name
                                                            }
                                                            className="h-full w-full object-cover"
                                                            onError={(
                                                                event
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="p-5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-serif text-xl font-bold text-[#4A0618]">
                                                                {
                                                                    item.customer_name
                                                                }
                                                            </h3>

                                                            <p className="mt-1 text-sm text-[#A47718]">
                                                                {item.event_type ||
                                                                    "Event"}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    item
                                                                )
                                                            }
                                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${item.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {item.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </button>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-0.5 text-[#C49A27]">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <span
                                                                    key={star}
                                                                >
                                                                    {star <=
                                                                        getSafeRating(
                                                                            item.rating
                                                                        )
                                                                        ? "★"
                                                                        : "☆"}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>

                                                    <p className="mt-3 text-sm leading-7 text-[#806f61]">
                                                        {item.review}
                                                    </p>

                                                    <div className="mt-4 flex items-center justify-between text-xs text-[#9a8877]">
                                                        <span>
                                                            Testimonial #
                                                            {item.id}
                                                        </span>

                                                        <span>
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                                        <button
                                                            onClick={() =>
                                                                openViewModal(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#dfd1c0] px-3 py-2 text-xs font-bold text-[#4A0618]"
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg bg-[#4A0618] px-3 py-2 text-xs font-bold text-white"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            {/* =================================================
              ADD MODAL
            ================================================= */}

            {showAddModal && (
                <Modal
                    title="Add Testimonial"
                    subtitle="Add a customer review for SS UTSAV."
                    onClose={() => {
                        if (!saving) {
                            setShowAddModal(false);
                            resetForm();
                        }
                    }}
                >
                    <TestimonialForm
                        form={form}
                        updateForm={updateForm}
                        saving={saving}
                        onCancel={() => {
                            setShowAddModal(false);
                            resetForm();
                        }}
                        onSubmit={createTestimonial}
                        submitText="Add Testimonial"
                    />
                </Modal>
            )}

            {/* =================================================
              EDIT MODAL
            ================================================= */}

            {showEditModal &&
                selectedTestimonial && (
                    <Modal
                        title="Edit Testimonial"
                        subtitle="Update customer review details."
                        onClose={() => {
                            if (!saving) {
                                setShowEditModal(false);
                                setSelectedTestimonial(null);
                                resetForm();
                            }
                        }}
                    >
                        <TestimonialForm
                            form={form}
                            updateForm={updateForm}
                            saving={saving}
                            onCancel={() => {
                                setShowEditModal(false);
                                setSelectedTestimonial(null);
                                resetForm();
                            }}
                            onSubmit={updateTestimonial}
                            submitText="Save Changes"
                        />
                    </Modal>
                )}

            {/* =================================================
              VIEW MODAL
            ================================================= */}

            {showViewModal &&
                selectedTestimonial && (
                    <Modal
                        title="Testimonial Details"
                        subtitle="Complete customer review information."
                        onClose={() => {
                            setShowViewModal(false);
                            setSelectedTestimonial(null);
                        }}
                    >
                        <div>
                            {/* CUSTOMER IMAGE */}

                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-[#f7edd7] bg-[#f7edd7]">
                                    {selectedTestimonial.image_url ? (
                                        <img
                                            src={getImageUrl(
                                                selectedTestimonial.image_url
                                            )}
                                            alt={
                                                selectedTestimonial.customer_name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-[#A47718]">
                                            {selectedTestimonial.customer_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <h3 className="mt-4 font-serif text-2xl font-bold text-[#4A0618]">
                                    {
                                        selectedTestimonial.customer_name
                                    }
                                </h3>

                                <p className="mt-1 text-sm text-[#A47718]">
                                    {selectedTestimonial.event_type ||
                                        "Event"}
                                </p>

                                <div className="mt-3 flex items-center gap-1 text-lg tracking-widest text-[#C49A27]">
                                    {[1, 2, 3, 4, 5].map(
                                        (star) => (
                                            <span key={star}>
                                                {star <=
                                                    getSafeRating(
                                                        selectedTestimonial.rating
                                                    )
                                                    ? "★"
                                                    : "☆"}
                                            </span>
                                        )
                                    )}
                                </div>

                                <p className="mt-1 text-xs font-semibold text-[#806f61]">
                                    {getSafeRating(
                                        selectedTestimonial.rating
                                    )}
                                    /5
                                </p>
                            </div>

                            {/* REVIEW */}

                            <div className="mt-7 rounded-2xl border border-[#eadfce] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                                    Customer Review
                                </p>

                                <p className="mt-3 text-sm leading-7 text-[#5d4a3d]">
                                    “{selectedTestimonial.review}”
                                </p>
                            </div>

                            {/* DETAILS */}

                            <div className="mt-6 space-y-5">
                                <DetailRow
                                    label="Customer Name"
                                    value={
                                        selectedTestimonial.customer_name
                                    }
                                />

                                <DetailRow
                                    label="Event Type"
                                    value={
                                        selectedTestimonial.event_type ||
                                        "Not specified"
                                    }
                                />

                                <DetailRow
                                    label="Rating"
                                    value={`${getSafeRating(
                                        selectedTestimonial.rating
                                    )}/5`}
                                />

                                <DetailRow
                                    label="Status"
                                    value={
                                        selectedTestimonial.is_active
                                            ? "Active"
                                            : "Inactive"
                                    }
                                />

                                <DetailRow
                                    label="Image"
                                    value={
                                        selectedTestimonial.image_url
                                            ? selectedTestimonial.image_url
                                            : "No image"
                                    }
                                />

                                <DetailRow
                                    label="Created"
                                    value={formatDate(
                                        selectedTestimonial.created_at
                                    )}
                                />
                            </div>
                        </div>
                    </Modal>
                )}

            {/* =================================================
              DELETE MODAL
            ================================================= */}

            {showDeleteModal &&
                selectedTestimonial && (
                    <Modal
                        title="Delete Testimonial"
                        subtitle="This action cannot be undone."
                        onClose={() => {
                            if (!saving) {
                                setShowDeleteModal(false);
                                setSelectedTestimonial(null);
                            }
                        }}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
                                !
                            </div>

                            <h3 className="mt-5 font-serif text-2xl font-bold text-[#4A0618]">
                                Delete this testimonial?
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                                You are about to delete the review from{" "}
                                <strong>
                                    {
                                        selectedTestimonial.customer_name
                                    }
                                </strong>
                                .
                            </p>

                            <div className="mt-7 flex justify-center gap-3">
                                <button
                                    disabled={saving}
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTestimonial(null);
                                    }}
                                    className="rounded-xl border border-[#dfd1c0] bg-white px-5 py-3 text-sm font-bold text-[#4A0618]"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={saving}
                                    onClick={deleteTestimonial}
                                    className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                                >
                                    {saving
                                        ? "Deleting..."
                                        : "Delete Testimonial"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
        </div>
    );
}

// =====================================================
// TESTIMONIAL FORM
// =====================================================

function TestimonialForm({
    form,
    updateForm,
    saving,
    onCancel,
    onSubmit,
    submitText,
}: {
    form: TestimonialForm;
    updateForm: <K extends keyof TestimonialForm>(
        field: K,
        value: TestimonialForm[K]
    ) => void;
    saving: boolean;
    onCancel: () => void;
    onSubmit: () => void;
    submitText: string;
}) {
    const [imageMode, setImageMode] = useState<
        "url" | "upload"
    >(
        form.image_url &&
            form.image_url.startsWith("/uploads/")
            ? "upload"
            : "url"
    );

    const [uploading, setUploading] =
        useState(false);

    async function handleImageUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert(
                "Please select a JPG, JPEG, PNG, WEBP, or GIF image."
            );

            event.target.value = "";
            return;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            alert("Image size must be 10MB or less.");

            event.target.value = "";
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("file", file);
            const data = await adminApi.post<any>(
                "/api/testimonials/upload",
                formData
            );

            if (!data?.image_url) {
                throw new Error(
                    "Image uploaded but server did not return image URL."
                );
            }

            updateForm(
                "image_url",
                data.image_url
            );

            alert("Image uploaded successfully.");
        } catch (error) {
            console.error(
                "Testimonial image upload error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to upload image."
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    return (
        <div className="space-y-6">
            {/* CUSTOMER NAME */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Customer Name *
                </label>

                <input
                    type="text"
                    value={form.customer_name}
                    onChange={(event) =>
                        updateForm(
                            "customer_name",
                            event.target.value
                        )
                    }
                    placeholder="Example: Rahul & Priya"
                    disabled={saving}
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />
            </div>

            {/* EVENT TYPE */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Event Type
                </label>

                <select
                    value={form.event_type}
                    onChange={(event) =>
                        updateForm(
                            "event_type",
                            event.target.value
                        )
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                >
                    <option value="">
                        Select Event Type
                    </option>

                    {eventTypes.map((eventType) => (
                        <option
                            key={eventType}
                            value={eventType}
                        >
                            {eventType}
                        </option>
                    ))}
                </select>
            </div>

            {/* REVIEW */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Customer Review *
                </label>

                <textarea
                    rows={6}
                    value={form.review}
                    onChange={(event) =>
                        updateForm(
                            "review",
                            event.target.value
                        )
                    }
                    placeholder="Write the customer's testimonial..."
                    disabled={saving}
                    className="w-full resize-none rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />

                <div className="mt-2 flex justify-between text-xs text-[#917c69]">
                    <span>
                        Customer feedback shown on the website.
                    </span>

                    <span>
                        {form.review.length} characters
                    </span>
                </div>
            </div>

            {/* RATING */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Rating *
                </label>

                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            disabled={saving}
                            onClick={() =>
                                updateForm(
                                    "rating",
                                    star
                                )
                            }
                            className="transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Give ${star} star${star > 1 ? "s" : ""}`}
                        >
                            <span
                                className={
                                    star <= form.rating
                                        ? "text-3xl text-[#C49A27]"
                                        : "text-3xl text-[#dfd1c0]"
                                }
                            >
                                ★
                            </span>
                        </button>
                    ))}

                    <span className="ml-2 text-sm font-semibold text-[#806f61]">
                        {form.rating}/5
                    </span>
                </div>
            </div>

            {/* IMAGE SOURCE */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Customer Image
                </label>

                {/* SOURCE SELECTOR */}

                <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-[#eadfce] bg-[#fffaf3] p-1">
                    <button
                        type="button"
                        disabled={saving || uploading}
                        onClick={() =>
                            setImageMode("url")
                        }
                        className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${imageMode === "url"
                            ? "bg-[#4A0618] text-white"
                            : "text-[#806f61] hover:bg-white"
                            }`}
                    >
                        Image URL
                    </button>

                    <button
                        type="button"
                        disabled={saving || uploading}
                        onClick={() =>
                            setImageMode("upload")
                        }
                        className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${imageMode === "upload"
                            ? "bg-[#4A0618] text-white"
                            : "text-[#806f61] hover:bg-white"
                            }`}
                    >
                        Upload File
                    </button>
                </div>

                {/* URL */}

                {imageMode === "url" && (
                    <>
                        <input
                            type="url"
                            value={form.image_url}
                            onChange={(event) =>
                                updateForm(
                                    "image_url",
                                    event.target.value
                                )
                            }
                            placeholder="https://example.com/customer.jpg"
                            disabled={saving}
                            className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                        />

                        <p className="mt-2 text-xs text-[#917c69]">
                            Optional. You can use an external image URL.
                        </p>
                    </>
                )}

                {/* UPLOAD */}

                {imageMode === "upload" && (
                    <>
                        <label
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8c5aa] bg-white px-5 py-8 text-center transition ${uploading || saving
                                ? "cursor-not-allowed opacity-60"
                                : "hover:bg-[#fffaf3]"
                                }`}
                        >
                            <div className="text-3xl text-[#A47718]">
                                ↑
                            </div>

                            <p className="mt-3 text-sm font-bold text-[#4A0618]">
                                {uploading
                                    ? "Uploading image..."
                                    : "Choose customer image"}
                            </p>

                            <p className="mt-1 text-xs text-[#917c69]">
                                JPG, JPEG, PNG, WEBP or GIF • Max 10MB
                            </p>

                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                disabled={
                                    uploading ||
                                    saving
                                }
                                onChange={
                                    handleImageUpload
                                }
                                className="hidden"
                            />
                        </label>

                        {form.image_url && (
                            <p className="mt-2 break-all text-xs text-[#917c69]">
                                Uploaded image:{" "}
                                {form.image_url}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* PREVIEW */}

            {form.image_url && (
                <div>
                    <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                        Image Preview
                    </label>

                    <div className="flex justify-center rounded-2xl border border-[#eadfce] bg-white p-6">
                        <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#f7edd7] bg-[#f7edd7]">
                            <img
                                src={getImageUrl(
                                    form.image_url
                                )}
                                alt="Customer preview"
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display =
                                        "none";
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={saving || uploading}
                        onClick={() =>
                            updateForm(
                                "image_url",
                                ""
                            )
                        }
                        className="mt-2 text-xs font-bold text-red-600 hover:underline"
                    >
                        Remove image
                    </button>
                </div>
            )}

            {/* ACTIVE */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#eadfce] bg-white p-4">
                <input
                    type="checkbox"
                    checked={form.is_active}
                    disabled={saving}
                    onChange={(event) =>
                        updateForm(
                            "is_active",
                            event.target.checked
                        )
                    }
                    className="h-4 w-4 accent-[#4A0618]"
                />

                <div>
                    <p className="text-sm font-bold text-[#4A0618]">
                        Active Testimonial
                    </p>

                    <p className="mt-1 text-xs text-[#917c69]">
                        Active testimonials can be displayed on
                        the public website.
                    </p>
                </div>
            </label>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-[#eadfce] pt-5">
                <button
                    type="button"
                    disabled={
                        saving || uploading
                    }
                    onClick={onCancel}
                    className="rounded-xl border border-[#dfd1c0] bg-white px-5 py-3 text-sm font-bold text-[#4A0618]"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={
                        saving ||
                        uploading ||
                        !form.customer_name.trim() ||
                        !form.review.trim()
                    }
                    onClick={onSubmit}
                    className="rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? "Saving..."
                        : uploading
                            ? "Uploading..."
                            : submitText}
                </button>
            </div>
        </div>
    );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: number;
    icon: string;
}) {
    return (
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#917c69]">
                        {title}
                    </p>

                    <p className="mt-2 font-serif text-3xl font-bold text-[#4A0618]">
                        {value}
                    </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8efd9] text-xl text-[#A47718]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
    label,
    onClick,
    danger = false,
}: {
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${danger
                ? "border-red-200 text-red-600 hover:bg-red-50"
                : "border-[#dfd1c0] text-[#4A0618] hover:bg-[#fff8ed]"
                }`}
        >
            {label}
        </button>
    );
}

// =====================================================
// MODAL
// =====================================================

function Modal({
    title,
    subtitle,
    onClose,
    children,
}: {
    title: string;
    subtitle: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f0710]/60 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#eadfce] bg-[#FBF7F0] shadow-2xl">
                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#eadfce] bg-[#FBF7F0] px-6 py-5">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-[#4A0618]">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm text-[#806f61]">
                            {subtitle}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd1c0] bg-white text-lg text-[#4A0618]"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                {label}
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-[#4A0618]">
                {value}
            </p>
        </div>
    );
}

// =====================================================
// LOADING
// =====================================================

function LoadingState() {
    return (
        <div className="rounded-2xl border border-[#eadfce] bg-white p-14 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#4A0618]" />

            <p className="mt-4 text-sm font-semibold text-[#806f61]">
                Loading testimonials...
            </p>
        </div>
    );
}

// =====================================================
// EMPTY
// =====================================================

function EmptyState({
    onAdd,
}: {
    onAdd: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d8c5aa] bg-white p-14 text-center shadow-sm">
            <div className="text-5xl text-[#b89a61]">
                ☆
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-[#4A0618]">
                No testimonials found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                Add your first customer testimonial to build
                trust with future SS UTSAV customers.
            </p>

            <button
                onClick={onAdd}
                className="mt-6 rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white"
            >
                + Add Testimonial
            </button>
        </div>
    );
}