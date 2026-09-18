"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";

const API_BASE = "http://127.0.0.1:8000";

type PackageItem = {
    id: number;
    name: string;
    description: string | null;
    starting_price: number | string | null;
    services: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
};

type PackageForm = {
    name: string;
    description: string;
    starting_price: string;
    services: string;
    image_url: string;
    is_active: boolean;
};

function createEmptyForm(): PackageForm {
    return {
        name: "",
        description: "",
        starting_price: "",
        services: "",
        image_url: "",
        is_active: true,
    };
}

function getToken(): string | null {
    if (typeof window === "undefined") return null;

    return (
        localStorage.getItem("ss_utsav_access_token") ||
        sessionStorage.getItem("ss_utsav_access_token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token")
    );
}

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

function formatPrice(price: number | string | null) {
    if (price === null || price === undefined || price === "") {
        return "Not specified";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
        return String(price);
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
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

export default function PackagesAdminPage() {
    const [packages, setPackages] = useState<PackageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [selectedPackage, setSelectedPackage] =
        useState<PackageItem | null>(null);

    const [form, setForm] = useState<PackageForm>(
        createEmptyForm()
    );

    // ==================================================
    // FETCH PACKAGES
    // ==================================================

    async function fetchPackages() {
        const token = getToken();

        if (!token) {
            clearAuthAndRedirect();
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/packages/`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "Failed to load packages."
                );
            }

            setPackages(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Packages fetch error:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to load packages."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPackages();
    }, []);

    // ==================================================
    // FILTER
    // ==================================================

    const filteredPackages = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return packages.filter((item) => {
            const packageName = item.name || "";
            const packageDescription = item.description || "";
            const packageServices = item.services || "";

            const matchesSearch =
                !searchText ||
                packageName
                    .toLowerCase()
                    .includes(searchText) ||
                packageDescription
                    .toLowerCase()
                    .includes(searchText) ||
                packageServices
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" &&
                    item.is_active) ||
                (statusFilter === "INACTIVE" &&
                    !item.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [packages, search, statusFilter]);

    // ==================================================
    // STATS
    // ==================================================

    const totalPackages = packages.length;

    const activePackages = packages.filter(
        (item) => item.is_active
    ).length;

    const inactivePackages = packages.filter(
        (item) => !item.is_active
    ).length;

    const packagesWithPrice = packages.filter(
        (item) =>
            item.starting_price !== null &&
            item.starting_price !== undefined &&
            item.starting_price !== ""
    ).length;

    // ==================================================
    // FORM
    // ==================================================

    function updateForm<K extends keyof PackageForm>(
        field: K,
        value: PackageForm[K]
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function resetForm() {
        /*
         * Create a completely new object every time.
         * This avoids stale form state/reference problems.
         */
        setForm(createEmptyForm());
    }

    // ==================================================
    // ADD
    // ==================================================

    function openAddModal() {
        setSelectedPackage(null);
        resetForm();
        setShowEditModal(false);
        setShowViewModal(false);
        setShowDeleteModal(false);
        setShowAddModal(true);
    }

    // ==================================================
    // EDIT
    // ==================================================

    function openEditModal(item: PackageItem) {
        setSelectedPackage(item);

        setForm({
            name: item.name || "",
            description: item.description || "",
            starting_price:
                item.starting_price === null ||
                    item.starting_price === undefined
                    ? ""
                    : String(item.starting_price),
            services: item.services || "",
            image_url: item.image_url || "",
            is_active: Boolean(item.is_active),
        });

        setShowAddModal(false);
        setShowViewModal(false);
        setShowDeleteModal(false);
        setShowEditModal(true);
    }

    // ==================================================
    // VIEW
    // ==================================================

    function openViewModal(item: PackageItem) {
        setSelectedPackage(item);

        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowViewModal(true);
    }

    // ==================================================
    // DELETE
    // ==================================================

    function openDeleteModal(item: PackageItem) {
        setSelectedPackage(item);

        setShowAddModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setShowDeleteModal(true);
    }

    // ==================================================
    // CREATE
    // ==================================================

    async function createPackage() {
        const token = getToken();

        if (!token) {
            clearAuthAndRedirect();
            return;
        }

        const packageName = form?.name?.trim() || "";
        const startingPrice =
            form?.starting_price?.trim() || "";

        if (!packageName) {
            alert("Please enter package name.");
            return;
        }

        if (
            startingPrice !== "" &&
            Number(startingPrice) < 0
        ) {
            alert("Starting price cannot be negative.");
            return;
        }

        if (
            startingPrice !== "" &&
            Number.isNaN(Number(startingPrice))
        ) {
            alert("Please enter a valid starting price.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: packageName,
                description:
                    form?.description?.trim() || null,
                starting_price:
                    startingPrice === ""
                        ? null
                        : Number(startingPrice),
                services:
                    form?.services?.trim() || null,
                image_url:
                    form?.image_url?.trim() || null,
                is_active: Boolean(form?.is_active),
            };

            const response = await fetch(
                `${API_BASE}/api/packages/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to create package."
                );
            }

            /*
             * Backend returns:
             *
             * {
             *   message: "...",
             *   package: {...}
             * }
             */

            const createdPackage =
                data?.package;

            if (!createdPackage) {
                throw new Error(
                    "Package was created, but the server returned an invalid package response."
                );
            }

            setPackages((previous) => [
                createdPackage,
                ...previous,
            ]);

            setShowAddModal(false);
            setSelectedPackage(null);
            resetForm();
        } catch (error) {
            console.error(
                "Create package error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to create package."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==================================================
    // UPDATE
    // ==================================================

    async function updatePackage() {
        const token = getToken();

        if (!token) {
            clearAuthAndRedirect();
            return;
        }

        if (!selectedPackage) {
            alert("No package selected.");
            return;
        }

        const packageName = form?.name?.trim() || "";
        const startingPrice =
            form?.starting_price?.trim() || "";

        if (!packageName) {
            alert("Please enter package name.");
            return;
        }

        if (
            startingPrice !== "" &&
            Number(startingPrice) < 0
        ) {
            alert("Starting price cannot be negative.");
            return;
        }

        if (
            startingPrice !== "" &&
            Number.isNaN(Number(startingPrice))
        ) {
            alert("Please enter a valid starting price.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name: packageName,
                description:
                    form?.description?.trim() || null,
                starting_price:
                    startingPrice === ""
                        ? null
                        : Number(startingPrice),
                services:
                    form?.services?.trim() || null,
                image_url:
                    form?.image_url?.trim() || null,
                is_active: Boolean(form?.is_active),
            };

            const response = await fetch(
                `${API_BASE}/api/packages/${selectedPackage.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (response.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to update package."
                );
            }

            /*
             * Backend returns:
             *
             * {
             *   message: "...",
             *   package: {...}
             * }
             */

            const updatedPackage =
                data?.package;

            if (!updatedPackage) {
                throw new Error(
                    "Package was updated, but the server returned an invalid package response."
                );
            }

            setPackages((previous) =>
                previous.map((item) =>
                    item.id === selectedPackage.id
                        ? updatedPackage
                        : item
                )
            );

            setShowEditModal(false);
            setSelectedPackage(null);
            resetForm();
        } catch (error) {
            console.error(
                "Update package error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to update package."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==================================================
    // DELETE
    // ==================================================

    async function deletePackage() {
        const token = getToken();

        if (!token) {
            clearAuthAndRedirect();
            return;
        }

        if (!selectedPackage) {
            console.error(
                "No package selected for deletion."
            );
            return;
        }

        try {
            setSaving(true);

            console.log(
                "Deleting package:",
                selectedPackage.id,
                selectedPackage.name
            );

            const response = await fetch(
                `${API_BASE}/api/packages/${selectedPackage.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(
                "Delete response status:",
                response.status
            );

            let data: any = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            console.log(
                "Delete response:",
                data
            );

            if (response.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to delete package."
                );
            }

            setPackages((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== selectedPackage.id
                )
            );

            setShowDeleteModal(false);
            setSelectedPackage(null);
        } catch (error) {
            console.error(
                "Delete package error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to delete package."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==================================================
    // TOGGLE STATUS
    // ==================================================

    async function toggleStatus(item: PackageItem) {
        const token = getToken();

        if (!token) {
            clearAuthAndRedirect();
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_BASE}/api/packages/${item.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        is_active: !item.is_active,
                    }),
                }
            );

            if (response.status === 401) {
                clearAuthAndRedirect();
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to update package status."
                );
            }

            /*
             * Backend returns:
             *
             * {
             *   message: "...",
             *   package: {...}
             * }
             */

            const updatedPackage =
                data?.package;

            if (!updatedPackage) {
                throw new Error(
                    "Package status was updated, but the server returned an invalid package response."
                );
            }

            setPackages((previous) =>
                previous.map((packageItem) =>
                    packageItem.id === item.id
                        ? updatedPackage
                        : packageItem
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
                    : "Failed to update package status."
            );
        } finally {
            setSaving(false);
        }
    }

    // ==================================================
    // PAGE
    // ==================================================

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
                            Packages
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* DESKTOP ADD */}

                        <button
                            type="button"
                            onClick={openAddModal}
                            disabled={saving}
                            className="hidden rounded-xl bg-[#4A0618] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] disabled:cursor-not-allowed disabled:opacity-50 md:block"
                        >
                            + Add Package
                        </button>

                        {/* MOBILE MENU */}

                        <button
                            type="button"
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
                        type="button"
                        onClick={openAddModal}
                        disabled={saving}
                        className="mb-5 w-full rounded-xl bg-[#4A0618] px-5 py-3 font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 md:hidden"
                    >
                        + Add Package
                    </button>

                    {/* STATS */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            title="Total Packages"
                            value={totalPackages}
                            icon="▱"
                        />

                        <StatCard
                            title="Active Packages"
                            value={activePackages}
                            icon="✓"
                        />

                        <StatCard
                            title="Inactive Packages"
                            value={inactivePackages}
                            icon="○"
                        />

                        <StatCard
                            title="With Pricing"
                            value={packagesWithPrice}
                            icon="₹"
                        />
                    </div>

                    {/* FILTERS */}

                    <div className="mt-7 rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm">
                        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
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
                                    placeholder="Search packages..."
                                    className="w-full rounded-xl border border-[#dfd1c0] bg-[#fffdfa] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                                />
                            </div>

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

                    {/* PACKAGE LIST */}

                    <div className="mt-7">
                        {loading ? (
                            <LoadingState />
                        ) : filteredPackages.length === 0 ? (
                            <EmptyState
                                onAdd={openAddModal}
                            />
                        ) : (
                            <>
                                {/* DESKTOP */}

                                <div className="hidden overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm lg:block">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[1100px]">
                                            <thead>
                                                <tr className="border-b border-[#eadfce] bg-[#fffaf3] text-left">
                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Package
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Description
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Starting Price
                                                    </th>

                                                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#806a58]">
                                                        Services
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
                                                {filteredPackages.map(
                                                    (item) => (
                                                        <tr
                                                            key={
                                                                item.id
                                                            }
                                                            className="border-b border-[#f0e7da] last:border-b-0 hover:bg-[#fffdfa]"
                                                        >
                                                            {/* PACKAGE */}

                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2eadf]">
                                                                        {item.image_url ? (
                                                                            <img
                                                                                src={getImageUrl(
                                                                                    item.image_url
                                                                                )}
                                                                                alt={
                                                                                    item.name
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-xl text-[#b89a61]">
                                                                                ▱
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-semibold text-[#4A0618]">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </p>

                                                                        <p className="mt-1 text-xs text-[#917c69]">
                                                                            Package #
                                                                            {
                                                                                item.id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* DESCRIPTION */}

                                                            <td className="px-5 py-4">
                                                                <p className="max-w-[230px] truncate text-sm text-[#806f61]">
                                                                    {item.description ||
                                                                        "No description"}
                                                                </p>
                                                            </td>

                                                            {/* PRICE */}

                                                            <td className="px-5 py-4">
                                                                <span className="font-semibold text-[#4A0618]">
                                                                    {formatPrice(
                                                                        item.starting_price
                                                                    )}
                                                                </span>
                                                            </td>

                                                            {/* SERVICES */}

                                                            <td className="px-5 py-4">
                                                                <p className="max-w-[220px] truncate text-sm text-[#806f61]">
                                                                    {item.services ||
                                                                        "No services listed"}
                                                                </p>
                                                            </td>

                                                            {/* STATUS */}

                                                            <td className="px-5 py-4">
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    onClick={() =>
                                                                        toggleStatus(
                                                                            item
                                                                        )
                                                                    }
                                                                    className={`rounded-full px-3 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${item.is_active
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

                                {/* MOBILE */}

                                <div className="grid gap-4 lg:hidden">
                                    {filteredPackages.map(
                                        (item) => (
                                            <div
                                                key={
                                                    item.id
                                                }
                                                className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm"
                                            >
                                                {/* IMAGE */}

                                                <div className="aspect-[16/8] overflow-hidden bg-[#f2eadf]">
                                                    {item.image_url ? (
                                                        <img
                                                            src={getImageUrl(
                                                                item.image_url
                                                            )}
                                                            alt={
                                                                item.name
                                                            }
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-5xl text-[#b89a61]">
                                                            ▱
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-serif text-xl font-bold text-[#4A0618]">
                                                                {
                                                                    item.name
                                                                }
                                                            </h3>

                                                            <p className="mt-1 text-sm font-semibold text-[#A47718]">
                                                                {formatPrice(
                                                                    item.starting_price
                                                                )}
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                saving
                                                            }
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    item
                                                                )
                                                            }
                                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${item.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {item.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </button>
                                                    </div>

                                                    <p className="mt-4 text-sm leading-6 text-[#806f61]">
                                                        {item.description ||
                                                            "No description available."}
                                                    </p>

                                                    {item.services && (
                                                        <div className="mt-4 rounded-xl bg-[#fff8ed] p-4">
                                                            <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                                                                Services
                                                            </p>

                                                            <p className="mt-1 text-sm leading-6 text-[#5d4a3d]">
                                                                {
                                                                    item.services
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="mt-4 flex items-center justify-between text-xs text-[#9a8877]">
                                                        <span>
                                                            Package #
                                                            {
                                                                item.id
                                                            }
                                                        </span>

                                                        <span>
                                                            {formatDate(
                                                                item.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-5 grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
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
                                                            type="button"
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
                                                            type="button"
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

            {/* ==================================================
              ADD MODAL
            ================================================== */}

            {showAddModal && (
                <Modal
                    title="Add Package"
                    subtitle="Create a new event package."
                    onClose={() => {
                        if (!saving) {
                            setShowAddModal(false);
                            setSelectedPackage(null);
                            resetForm();
                        }
                    }}
                >
                    <PackageForm
                        form={form}
                        updateForm={updateForm}
                        saving={saving}
                        onCancel={() => {
                            if (!saving) {
                                setShowAddModal(false);
                                setSelectedPackage(null);
                                resetForm();
                            }
                        }}
                        onSubmit={createPackage}
                        submitText="Add Package"
                    />
                </Modal>
            )}

            {/* ==================================================
              EDIT MODAL
            ================================================== */}

            {showEditModal && selectedPackage && (
                <Modal
                    title="Edit Package"
                    subtitle="Update package details."
                    onClose={() => {
                        if (!saving) {
                            setShowEditModal(false);
                            setSelectedPackage(null);
                            resetForm();
                        }
                    }}
                >
                    <PackageForm
                        form={form}
                        updateForm={updateForm}
                        saving={saving}
                        onCancel={() => {
                            if (!saving) {
                                setShowEditModal(false);
                                setSelectedPackage(null);
                                resetForm();
                            }
                        }}
                        onSubmit={updatePackage}
                        submitText="Save Changes"
                    />
                </Modal>
            )}

            {/* ==================================================
              VIEW MODAL
            ================================================== */}

            {showViewModal && selectedPackage && (
                <Modal
                    title="Package Details"
                    subtitle="Complete package information."
                    onClose={() => {
                        setShowViewModal(false);
                        setSelectedPackage(null);
                    }}
                >
                    <div>
                        {/* IMAGE */}

                        <div className="overflow-hidden rounded-2xl bg-[#f2eadf]">
                            {selectedPackage.image_url ? (
                                <img
                                    src={getImageUrl(
                                        selectedPackage.image_url
                                    )}
                                    alt={
                                        selectedPackage.name
                                    }
                                    className="max-h-[350px] w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-[250px] items-center justify-center text-6xl text-[#b89a61]">
                                    ▱
                                </div>
                            )}
                        </div>

                        <div className="mt-6 space-y-5">
                            <DetailRow
                                label="Package Name"
                                value={
                                    selectedPackage.name
                                }
                            />

                            <DetailRow
                                label="Starting Price"
                                value={formatPrice(
                                    selectedPackage.starting_price
                                )}
                            />

                            <DetailRow
                                label="Status"
                                value={
                                    selectedPackage.is_active
                                        ? "Active"
                                        : "Inactive"
                                }
                            />

                            <DetailRow
                                label="Created"
                                value={formatDate(
                                    selectedPackage.created_at
                                )}
                            />

                            {selectedPackage.description && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                                        Description
                                    </p>

                                    <p className="mt-2 text-sm leading-7 text-[#5d4a3d]">
                                        {
                                            selectedPackage.description
                                        }
                                    </p>
                                </div>
                            )}

                            {selectedPackage.services && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#9a8877]">
                                        Services Included
                                    </p>

                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#5d4a3d]">
                                        {
                                            selectedPackage.services
                                        }
                                    </p>
                                </div>
                            )}

                            {selectedPackage.image_url && (
                                <DetailRow
                                    label="Image URL"
                                    value={
                                        selectedPackage.image_url
                                    }
                                />
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {/* ==================================================
              DELETE MODAL
            ================================================== */}

            {showDeleteModal && selectedPackage && (
                <Modal
                    title="Delete Package"
                    subtitle="This action cannot be undone."
                    onClose={() => {
                        if (!saving) {
                            setShowDeleteModal(false);
                            setSelectedPackage(null);
                        }
                    }}
                >
                    <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-600">
                            !
                        </div>

                        <h3 className="mt-5 font-serif text-2xl font-bold text-[#4A0618]">
                            Delete this package?
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                            You are about to delete{" "}
                            <strong>
                                {selectedPackage.name}
                            </strong>
                            . This action cannot be undone.
                        </p>

                        <div className="mt-7 flex justify-center gap-3">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPackage(null);
                                }}
                                className="rounded-xl border border-[#dfd1c0] bg-white px-5 py-3 text-sm font-bold text-[#4A0618] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={deletePackage}
                                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Deleting..."
                                    : "Delete Package"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ======================================================
// PACKAGE FORM
// ======================================================

function PackageForm({
    form,
    updateForm,
    saving,
    onCancel,
    onSubmit,
    submitText,
}: {
    form: PackageForm;
    updateForm: <K extends keyof PackageForm>(
        field: K,
        value: PackageForm[K]
    ) => void;
    saving: boolean;
    onCancel: () => void;
    onSubmit: () => void;
    submitText: string;
}) {
    /*
     * Defensive values.
     *
     * These make the form safe even if an incomplete
     * object is ever passed during React rendering.
     */

    const safeName = form?.name ?? "";
    const safeStartingPrice =
        form?.starting_price ?? "";
    const safeDescription =
        form?.description ?? "";
    const safeServices =
        form?.services ?? "";
    const safeImageUrl =
        form?.image_url ?? "";
    const safeIsActive =
        Boolean(form?.is_active);

    return (
        <div className="space-y-6">
            {/* NAME */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Package Name *
                </label>

                <input
                    type="text"
                    value={safeName}
                    onChange={(event) =>
                        updateForm(
                            "name",
                            event.target.value
                        )
                    }
                    placeholder="Example: Royal Wedding Package"
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />
            </div>

            {/* STARTING PRICE */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Starting Price
                </label>

                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#806f61]">
                        ₹
                    </span>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={safeStartingPrice}
                        onChange={(event) =>
                            updateForm(
                                "starting_price",
                                event.target.value
                            )
                        }
                        placeholder="50000"
                        className="w-full rounded-xl border border-[#dfd1c0] bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                    />
                </div>

                <p className="mt-2 text-xs text-[#917c69]">
                    Enter the starting price in Indian Rupees.
                </p>
            </div>

            {/* DESCRIPTION */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Description
                </label>

                <textarea
                    rows={4}
                    value={safeDescription}
                    onChange={(event) =>
                        updateForm(
                            "description",
                            event.target.value
                        )
                    }
                    placeholder="Describe what this package is suitable for..."
                    className="w-full resize-none rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />
            </div>

            {/* SERVICES */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Services Included
                </label>

                <textarea
                    rows={5}
                    value={safeServices}
                    onChange={(event) =>
                        updateForm(
                            "services",
                            event.target.value
                        )
                    }
                    placeholder={`Decoration
Photography
Catering
DJ & Music
Event Coordination`}
                    className="w-full resize-none rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />

                <p className="mt-2 text-xs text-[#917c69]">
                    You can enter services separated by commas or
                    on separate lines.
                </p>
            </div>

            {/* IMAGE URL */}

            <div>
                <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                    Image URL
                </label>

                <input
                    type="url"
                    value={safeImageUrl}
                    onChange={(event) =>
                        updateForm(
                            "image_url",
                            event.target.value
                        )
                    }
                    placeholder="https://example.com/package-image.jpg"
                    className="w-full rounded-xl border border-[#dfd1c0] bg-white px-4 py-3 text-sm outline-none focus:border-[#D6A928] focus:ring-2 focus:ring-[#D6A928]/20"
                />

                <p className="mt-2 text-xs text-[#917c69]">
                    You can use an external image URL. Image upload
                    storage can be connected later in the same way as
                    Gallery.
                </p>
            </div>

            {/* IMAGE PREVIEW */}

            {safeImageUrl && (
                <div>
                    <label className="mb-2 block text-sm font-bold text-[#4A0618]">
                        Image Preview
                    </label>

                    <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white">
                        <img
                            src={getImageUrl(
                                safeImageUrl
                            )}
                            alt="Package preview"
                            className="max-h-[300px] w-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* ACTIVE */}

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#eadfce] bg-white p-4">
                <input
                    type="checkbox"
                    checked={safeIsActive}
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
                        Active Package
                    </p>

                    <p className="mt-1 text-xs text-[#917c69]">
                        Active packages can be displayed on the public
                        website later.
                    </p>
                </div>
            </label>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-[#eadfce] pt-5">
                <button
                    type="button"
                    disabled={saving}
                    onClick={onCancel}
                    className="rounded-xl border border-[#dfd1c0] bg-white px-5 py-3 text-sm font-bold text-[#4A0618] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={
                        saving ||
                        !safeName.trim()
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
            type="button"
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
                        type="button"
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
                Loading packages...
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
            <div className="text-5xl text-[#b89a61]">
                ▱
            </div>

            <h3 className="mt-4 font-serif text-2xl font-bold text-[#4A0618]">
                No packages found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806f61]">
                Create your first event package to manage your
                pricing and services.
            </p>

            <button
                type="button"
                onClick={onAdd}
                className="mt-6 rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white"
            >
                + Add Package
            </button>
        </div>
    );
}