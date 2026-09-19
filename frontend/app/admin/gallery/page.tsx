"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi, API_BASE_URL } from "@/lib/api";

type GalleryItem = {
    id: number;
    title: string;
    category: string;
    description: string | null;
    image_url: string;
    is_active: boolean;
    created_at: string;
};

type GalleryForm = {
    title: string;
    category: string;
    description: string;
    image_url: string;
    is_active: boolean;
};

const emptyForm: GalleryForm = {
    title: "",
    category: "",
    description: "",
    image_url: "",
    is_active: true,
};

const categories = [
    "Weddings",
    "Birthdays",
    "Engagements",
    "Baby Showers",
    "Corporate",
    "College Events",
    "Cultural Events",
    "Private Events",
    "Other",
];

function clearAuthAndRedirect() {
    if (typeof window === "undefined") return;

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

function getImageUrl(imageUrl: string) {
    if (!imageUrl) return "";

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `${API_BASE_URL}${imageUrl}`;
    }

    return imageUrl;
}

function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function GalleryAdminPage() {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedGallery, setSelectedGallery] =
        useState<GalleryItem | null>(null);

    const [form, setForm] = useState<GalleryForm>(emptyForm);

    const [imageSource, setImageSource] = useState<"url" | "file">("url");

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // --------------------------------------------------
    // FETCH GALLERY
    // --------------------------------------------------

    async function fetchGallery() {
        try {
            setLoading(true);

            const data = await adminApi.get<any>("/api/gallery/");

            setGallery(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Gallery fetch error:", error);

            if (
                error instanceof Error &&
                error.message === "Unauthorized"
            ) {
                clearAuthAndRedirect();
                return;
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchGallery();
    }, []);

    // --------------------------------------------------
    // FILTER
    // --------------------------------------------------

    const filteredGallery = useMemo(() => {
        return gallery.filter((item) => {
            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                item.title.toLowerCase().includes(searchText) ||
                item.category.toLowerCase().includes(searchText) ||
                (item.description || "")
                    .toLowerCase()
                    .includes(searchText);

            const matchesCategory =
                categoryFilter === "ALL" ||
                item.category === categoryFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && item.is_active) ||
                (statusFilter === "INACTIVE" && !item.is_active);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [gallery, search, categoryFilter, statusFilter]);

    // --------------------------------------------------
    // STATS
    // --------------------------------------------------

    const totalImages = gallery.length;

    const activeImages = gallery.filter(
        (item) => item.is_active
    ).length;

    const inactiveImages = gallery.filter(
        (item) => !item.is_active
    ).length;

    const totalCategories = new Set(
        gallery.map((item) => item.category)
    ).size;

    // --------------------------------------------------
    // FORM CHANGE
    // --------------------------------------------------

    function updateForm<K extends keyof GalleryForm>(
        field: K,
        value: GalleryForm[K]
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    // --------------------------------------------------
    // RESET
    // --------------------------------------------------

    function resetForm() {
        setForm(emptyForm);
        setImageSource("url");
        setUploadError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    // --------------------------------------------------
    // OPEN ADD
    // --------------------------------------------------

    function openAddModal() {
        resetForm();
        setShowAddModal(true);
    }

    // --------------------------------------------------
    // OPEN EDIT
    // --------------------------------------------------

    function openEditModal(item: GalleryItem) {
        setSelectedGallery(item);

        setForm({
            title: item.title,
            category: item.category,
            description: item.description || "",
            image_url: item.image_url,
            is_active: item.is_active,
        });

        setImageSource(
            item.image_url.startsWith("/uploads/")
                ? "file"
                : "url"
        );

        setUploadError("");
        setShowEditModal(true);
    }

    // --------------------------------------------------
    // VIEW
    // --------------------------------------------------

    function openViewModal(item: GalleryItem) {
        setSelectedGallery(item);
        setShowViewModal(true);
    }

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    function openDeleteModal(item: GalleryItem) {
        setSelectedGallery(item);
        setShowDeleteModal(true);
    }

    // --------------------------------------------------
    // FILE UPLOAD
    // --------------------------------------------------

    async function handleFileUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        setUploadError("");

        // Frontend size validation
        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setUploadError(
                "Image size must be less than 10 MB."
            );

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            setUploadError(
                "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
            );

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        try {
            setUploadingImage(true);

            const formData = new FormData();

            formData.append("file", file);

            const data = await adminApi.post<any>(
                "/api/gallery/upload",
                formData
            );

            updateForm("image_url", data.image_url);
        } catch (error) {
            console.error("Image upload error:", error);

            if (
                error instanceof Error &&
                error.message === "Unauthorized"
            ) {
                clearAuthAndRedirect();
                return;
            }

            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Image upload failed."
            );
        } finally {
            setUploadingImage(false);
        }
    }

    // --------------------------------------------------
    // CREATE GALLERY
    // --------------------------------------------------

    async function createGallery() {
        if (!form.title.trim()) {
            alert("Please enter image title.");
            return;
        }

        if (!form.category.trim()) {
            alert("Please select a category.");
            return;
        }

        if (!form.image_url.trim()) {
            alert(
                "Please provide an image URL or upload an image."
            );
            return;
        }

        try {
            setSaving(true);

            const data = await adminApi.post<any>(
                "/api/gallery/",
                {
                    title: form.title.trim(),
                    category: form.category.trim(),
                    description:
                        form.description.trim() || null,
                    image_url: form.image_url.trim(),
                    is_active: form.is_active,
                }
            );

            setGallery((previous) => [data, ...previous]);

            setShowAddModal(false);

            resetForm();
        } catch (error) {
            console.error("Create gallery error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create gallery image."
            );
        } finally {
            setSaving(false);
        }
    }

    // --------------------------------------------------
    // UPDATE GALLERY
    // --------------------------------------------------

    async function updateGallery() {
        if (!selectedGallery) return;

        if (!form.title.trim()) {
            alert("Please enter image title.");
            return;
        }

        if (!form.category.trim()) {
            alert("Please select a category.");
            return;
        }

        if (!form.image_url.trim()) {
            alert(
                "Please provide an image URL or upload an image."
            );
            return;
        }

        try {
            setSaving(true);

            const data = await adminApi.put<any>(
                `/api/gallery/${selectedGallery.id}`,
                {
                    title: form.title.trim(),
                    category: form.category.trim(),
                    description:
                        form.description.trim() || null,
                    image_url: form.image_url.trim(),
                    is_active: form.is_active,
                }
            );

            setGallery((previous) =>
                previous.map((item) =>
                    item.id === selectedGallery.id
                        ? data
                        : item
                )
            );

            setShowEditModal(false);
            setSelectedGallery(null);
            resetForm();
        } catch (error) {
            console.error("Update gallery error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update gallery image."
            );
        } finally {
            setSaving(false);
        }
    }

    // --------------------------------------------------
    // DELETE GALLERY
    // --------------------------------------------------

    async function deleteGallery() {
        if (!selectedGallery) return;

        try {
            setSaving(true);

            await adminApi.delete<any>(
                `/api/gallery/${selectedGallery.id}`
            );

            setGallery((previous) =>
                previous.filter(
                    (item) => item.id !== selectedGallery.id
                )
            );

            setShowDeleteModal(false);
            setSelectedGallery(null);
        } catch (error) {
            console.error("Delete gallery error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete gallery image."
            );
        } finally {
            setSaving(false);
        }
    }

    // --------------------------------------------------
    // TOGGLE STATUS
    // --------------------------------------------------

    async function toggleStatus(item: GalleryItem) {
        try {
            const data = await adminApi.put<any>(
                `/api/gallery/${item.id}`,
                {
                    is_active: !item.is_active,
                }
            );

            setGallery((previous) =>
                previous.map((galleryItem) =>
                    galleryItem.id === item.id
                        ? data
                        : galleryItem
                )
            );
        } catch (error) {
            console.error("Status update error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update status."
            );
        }
    }

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

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
                            Gallery
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={openAddModal}
                            className="hidden rounded-xl bg-[#4A0618] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] md:block"
                        >
                            + Add Image
                        </button>

                        {/* MOBILE HAMBURGER */}

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
                        + Add Gallery Image
                    </button>

                    {/* STATS */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Images"
                            value={totalImages}
                            icon="▧"
                        />

                        <StatCard
                            title="Active Images"
                            value={activeImages}
                            icon="✓"
                        />

                        <StatCard
                            title="Inactive Images"
                            value={inactiveImages}
                            icon="○"
                        />

                        <StatCard
                            title="Categories"
                            value={totalCategories}
                            icon="◇"
                        />
                    </div>

                    {/* FILTER BAR */}

                    <div className="mt-7 rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                        <div className="grid gap-3 md:grid-cols-[1fr_200px_180px]">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b8775]">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search gallery..."
                                    className="w-full rounded-xl border border-[#dfd1c0] bg-[#fffdfa] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(event) =>
                                    setCategoryFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-[#dfd1c0] bg-[#fffdfa] px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                            >
                                <option value="ALL">
                                    All Categories
                                </option>

                                {categories.map((category) => (
                                    <option
                                        key={category}
                                        value={category}
                                    >
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
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

                    {/* GALLERY */}

                    <div className="mt-7">
                        {loading ? (
                            <LoadingState />
                        ) : filteredGallery.length === 0 ? (
                            <EmptyState onAdd={openAddModal} />
                        ) : (
                            <>
                                {/* DESKTOP TABLE */}

                                <div className="hidden overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[1000px]">
                                            <thead>
                                                <tr className="border-b border-[#eadfce] bg-[#fffaf3] text-left">
                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Image
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Title
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Category
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Source
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
                                                {filteredGallery.map(
                                                    (item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="border-b border-[#f0e7da] last:border-b-0 hover:bg-[#fffdfa]"
                                                        >
                                                            {/* IMAGE */}

                                                            <td className="px-5 py-4">
                                                                <div className="h-16 w-24 overflow-hidden rounded-xl bg-[#f2eadf]">
                                                                    <img
                                                                        src={getImageUrl(
                                                                            item.image_url
                                                                        )}
                                                                        alt={
                                                                            item.title
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
                                                            </td>

                                                            {/* TITLE */}

                                                            <td className="px-5 py-4">
                                                                <p className="font-semibold text-[#4A0618]">
                                                                    {
                                                                        item.title
                                                                    }
                                                                </p>

                                                                {item.description && (
                                                                    <p className="mt-1 max-w-[250px] truncate text-xs text-[#8c7968]">
                                                                        {
                                                                            item.description
                                                                        }
                                                                    </p>
                                                                )}
                                                            </td>

                                                            {/* CATEGORY */}

                                                            <td className="px-5 py-4">
                                                                <span className="rounded-full bg-[#f7edd7] px-3 py-1 text-xs font-semibold text-[#805f10]">
                                                                    {
                                                                        item.category
                                                                    }
                                                                </span>
                                                            </td>

                                                            {/* SOURCE */}

                                                            <td className="px-5 py-4">
                                                                {item.image_url.startsWith(
                                                                    "/uploads/"
                                                                ) ? (
                                                                    <span className="text-xs font-semibold text-[#4A0618]">
                                                                        Uploaded
                                                                        File
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs font-semibold text-[#806a58]">
                                                                        URL
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
                                    {filteredGallery.map((item) => (
                                        <div
                                            key={item.id}
                                            className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm"
                                        >
                                            <div className="aspect-[16/9] overflow-hidden bg-[#f2eadf]">
                                                <img
                                                    src={getImageUrl(
                                                        item.image_url
                                                    )}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="font-serif text-xl font-bold text-[#4A0618]">
                                                            {item.title}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-[#806f61]">
                                                            {
                                                                item.category
                                                            }
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

                                                {item.description && (
                                                    <p className="mt-3 text-sm leading-6 text-[#806f61]">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-center justify-between text-xs text-[#9a8877]">
                                                    <span>
                                                        {item.image_url.startsWith(
                                                            "/uploads/"
                                                        )
                                                            ? "Uploaded File"
                                                            : "URL"}
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
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            {/* ADD MODAL */}

            {showAddModal && (
                <Modal
                    title="Add Gallery Image"
                    subtitle="Add an existing image URL or upload a new image."
                    onClose={() => {
                        if (!saving && !uploadingImage) {
                            setShowAddModal(false);
                            resetForm();
                        }
                    }}
                >
                    <GalleryFormComponent
                        form={form}
                        updateForm={updateForm}
                        imageSource={imageSource}
                        setImageSource={setImageSource}
                        fileInputRef={fileInputRef}
                        handleFileUpload={handleFileUpload}
                        uploadingImage={uploadingImage}
                        uploadError={uploadError}
                        saving={saving}
                        onCancel={() => {
                            setShowAddModal(false);
                            resetForm();
                        }}
                        onSubmit={createGallery}
                        submitText="Add Image"
                    />
                </Modal>
            )}

            {/* EDIT MODAL */}

            {showEditModal && selectedGallery && (
                <Modal
                    title="Edit Gallery Image"
                    subtitle="Update image information or replace the image."
                    onClose={() => {
                        if (!saving && !uploadingImage) {
                            setShowEditModal(false);
                            setSelectedGallery(null);
                            resetForm();
                        }
                    }}
                >
                    <GalleryFormComponent
                        form={form}
                        updateForm={updateForm}
                        imageSource={imageSource}
                        setImageSource={setImageSource}
                        fileInputRef={fileInputRef}
                        handleFileUpload={handleFileUpload}
                        uploadingImage={uploadingImage}
                        uploadError={uploadError}
                        saving={saving}
                        onCancel={() => {
                            setShowEditModal(false);
                            setSelectedGallery(null);
                            resetForm();
                        }}
                        onSubmit={updateGallery}
                        submitText="Save Changes"
                    />
                </Modal>
            )}

            {/* VIEW MODAL */}

            {showViewModal && selectedGallery && (
                <Modal
                    title="Gallery Preview"
                    subtitle="Gallery image details"
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedGallery(null);
                    }}
                >
                    <div>
                        <div className="overflow-hidden rounded-2xl bg-[#f2eadf]">
                            <img
                                src={getImageUrl(
                                    selectedGallery.image_url
                                )}
                                alt={selectedGallery.title}
                                className="max-h-[430px] w-full object-cover"
                            />
                        </div>

                        <div className="mt-5 space-y-4">
                            <DetailRow
                                label="Title"
                                value={selectedGallery.title}
                            />

                            <DetailRow
                                label="Category"
                                value={selectedGallery.category}
                            />

                            <DetailRow
                                label="Status"
                                value={
                                    selectedGallery.is_active
                                        ? "Active"
                                        : "Inactive"
                                }
                            />

                            <DetailRow
                                label="Source"
                                value={
                                    selectedGallery.image_url.startsWith(
                                        "/uploads/"
                                    )
                                        ? "Uploaded File"
                                        : "External URL"
                                }
                            />

                            <DetailRow
                                label="Image URL"
                                value={selectedGallery.image_url}
                            />

                            <DetailRow
                                label="Created"
                                value={formatDate(
                                    selectedGallery.created_at
                                )}
                            />

                            {selectedGallery.description && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                                        Description
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-[#5d4a3d]">
                                        {
                                            selectedGallery.description
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* DELETE MODAL */}

            {showDeleteModal && selectedGallery && (
                <Modal
                    title="Delete Gallery Image"
                    subtitle="This action cannot be undone."
                    onClose={() => {
                        if (!saving) {
                            setShowDeleteModal(false);
                            setSelectedGallery(null);
                        }
                    }}
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
                            !
                        </div>

                        <h3 className="mt-5 font-serif text-2xl font-bold text-[#4A0618]">
                            Delete this image?
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                            You are about to delete{" "}
                            <strong>
                                {selectedGallery.title}
                            </strong>
                            . This will remove the gallery record.
                        </p>

                        <div className="mt-7 flex justify-center gap-3">
                            <button
                                disabled={saving}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedGallery(null);
                                }}
                                className="rounded-xl border border-[#dfd1c0] px-5 py-3 text-sm font-bold text-[#4A0618]"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={saving}
                                onClick={deleteGallery}
                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white"
                            >
                                {saving
                                    ? "Deleting..."
                                    : "Delete Image"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ======================================================
// STAT CARD
// ======================================================

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

// ======================================================
// ACTION BUTTON
// ======================================================

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

// ======================================================
// MODAL
// ======================================================

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
                {/* HEADER */}

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

                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ======================================================
// GALLERY FORM
// ======================================================

function GalleryFormComponent({
    form,
    updateForm,
    imageSource,
    setImageSource,
    fileInputRef,
    handleFileUpload,
    uploadingImage,
    uploadError,
    saving,
    onCancel,
    onSubmit,
    submitText,
}: {
    form: GalleryForm;
    updateForm: <K extends keyof GalleryForm>(
        field: K,
        value: GalleryForm[K]
    ) => void;
    imageSource: "url" | "file";
    setImageSource: (value: "url" | "file") => void;
    fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
    handleFileUpload: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
    uploadingImage: boolean;
    uploadError: string;
    saving: boolean;
    onCancel: () => void;
    onSubmit: () => void;
    submitText: string;
}) {
    return (
        <div className="space-y-6">
            {/* TITLE */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Image Title *
                </label>

                <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                        updateForm(
                            "title",
                            event.target.value
                        )
                    }
                    placeholder="Example: Elegant Wedding Decoration"
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />
            </div>

            {/* CATEGORY */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Category *
                </label>

                <select
                    value={form.category}
                    onChange={(event) =>
                        updateForm(
                            "category",
                            event.target.value
                        )
                    }
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928]"
                >
                    <option value="">
                        Select Category
                    </option>

                    {categories.map((category) => (
                        <option
                            key={category}
                            value={category}
                        >
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* IMAGE SOURCE */}

            <div>
                <label className="mb-3 block text-sm font-bold text-[#4A0618]">
                    Image Source *
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f4ecdf] p-1">
                    <button
                        type="button"
                        onClick={() =>
                            setImageSource("url")
                        }
                        className={`rounded-lg px-4 py-3 text-sm font-bold transition ${imageSource === "url"
                            ? "bg-white text-[#4A0618] shadow-sm"
                            : "text-[#806f61]"
                            }`}
                    >
                        🔗 Image URL
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setImageSource("file")
                        }
                        className={`rounded-lg px-4 py-3 text-sm font-bold transition ${imageSource === "file"
                            ? "bg-white text-[#4A0618] shadow-sm"
                            : "text-[#806f61]"
                            }`}
                    >
                        📁 Upload File
                    </button>
                </div>
            </div>

            {/* URL */}

            {imageSource === "url" && (
                <div>
                    <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                        Image URL
                    </label>

                    <input
                        type="url"
                        value={form.image_url}
                        onChange={(event) =>
                            updateForm(
                                "image_url",
                                event.target.value
                            )
                        }
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                    />

                    <p className="mt-2 text-xs text-[#917c69]">
                        You can keep using your existing
                        external/Unsplash image URLs.
                    </p>
                </div>
            )}

            {/* FILE */}

            {imageSource === "file" && (
                <div>
                    <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                        Upload Image
                    </label>

                    <div
                        onClick={() =>
                            !uploadingImage &&
                            fileInputRef.current?.click()
                        }
                        className="cursor-pointer rounded-2xl border-2 border-dashed border-[#d8c5aa] bg-white p-7 text-center transition hover:border-[#D6A928] hover:bg-[#fffaf2]"
                    >
                        <div className="text-4xl">
                            📁
                        </div>

                        <p className="mt-3 font-bold text-[#4A0618]">
                            {uploadingImage
                                ? "Uploading image..."
                                : "Click to choose an image"}
                        </p>

                        <p className="mt-1 text-xs text-[#917c69]">
                            JPG, JPEG, PNG, WEBP or GIF ·
                            Maximum 10 MB
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {uploadError && (
                        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                            {uploadError}
                        </p>
                    )}

                    {form.image_url && (
                        <p className="mt-2 break-all text-xs text-green-700">
                            Uploaded:{" "}
                            {form.image_url}
                        </p>
                    )}
                </div>
            )}

            {/* PREVIEW */}

            {form.image_url && (
                <div>
                    <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                        Preview
                    </label>

                    <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white">
                        <img
                            src={getImageUrl(
                                form.image_url
                            )}
                            alt="Gallery preview"
                            className="max-h-[320px] w-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* DESCRIPTION */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Description
                </label>

                <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                        updateForm(
                            "description",
                            event.target.value
                        )
                    }
                    placeholder="Short description of this event image..."
                    className="w-full resize-none rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />
            </div>

            {/* ACTIVE */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#eadfce] bg-white p-4">
                <input
                    type="checkbox"
                    checked={form.is_active}
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
                        Active Image
                    </p>

                    <p className="text-xs text-[#917c69]">
                        Active images will be available
                        for the public gallery later.
                    </p>
                </div>
            </label>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-[#eadfce] pt-5">
                <button
                    type="button"
                    disabled={
                        saving || uploadingImage
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
                        uploadingImage ||
                        !form.title.trim() ||
                        !form.category.trim() ||
                        !form.image_url.trim()
                    }
                    onClick={onSubmit}
                    className="rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? "Saving..."
                        : submitText}
                </button>
            </div>
        </div>
    );
}

// ======================================================
// DETAIL ROW
// ======================================================

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

// ======================================================
// LOADING
// ======================================================

function LoadingState() {
    return (
        <div className="rounded-2xl border border-[#eadfce] bg-white p-14 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#4A0618]" />

            <p className="mt-4 text-sm font-semibold text-[#806f61]">
                Loading gallery...
            </p>
        </div>
    );
}

// ======================================================
// EMPTY
// ======================================================

function EmptyState({
    onAdd,
}: {
    onAdd: () => void;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d8c5aa] bg-white p-14 text-center shadow-sm">
            <div className="text-5xl">
                ▧
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-[#4A0618]">
                No gallery images found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                Add an image using an external URL or
                upload an image directly from your
                computer.
            </p>

            <button
                onClick={onAdd}
                className="mt-6 rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white"
            >
                + Add Image
            </button>
        </div>
    );
}