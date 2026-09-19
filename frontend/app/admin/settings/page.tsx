"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { adminApi } from "@/lib/api";

type SettingsData = {
    id?: number;

    company_name: string;
    tagline: string;

    email: string;
    phone: string;
    address: string;

    website_url: string;
    whatsapp_number: string;

    instagram_url: string;
    facebook_url: string;
    twitter_x_url: string;

    description: string;
    logo_url: string;

    is_active: boolean;

    updated_at?: string;
};

type SettingsForm = {
    company_name: string;
    tagline: string;

    email: string;
    phone: string;
    address: string;

    website_url: string;
    whatsapp_number: string;

    instagram_url: string;
    facebook_url: string;
    twitter_x_url: string;

    description: string;
    logo_url: string;
};

const emptyForm: SettingsForm = {
    company_name: "SS UTSAV",
    tagline: "We Plan. You Celebrate.",

    email: "",
    phone: "",
    address: "",

    website_url: "",
    whatsapp_number: "",

    instagram_url: "",
    facebook_url: "",
    twitter_x_url: "",

    description: "",
    logo_url: "",
};

// =====================================================
// DATE
// =====================================================

function formatDate(date?: string) {
    if (!date) {
        return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function SettingsAdminPage() {
    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [settings, setSettings] =
        useState<SettingsData | null>(null);

    const [form, setForm] =
        useState<SettingsForm>(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [activeSection, setActiveSection] =
        useState("business");

    // ===================================================
    // FETCH SETTINGS
    // ===================================================

    async function fetchSettings() {
        try {
            setLoading(true);

            const data = await adminApi.get<any>(
                "/api/settings/"
            );

            setSettings(data);

            setForm({
                company_name: data.company_name ?? "",
                tagline: data.tagline ?? "",

                email: data.email ?? "",
                phone: data.phone ?? "",
                address: data.address ?? "",

                website_url: data.website_url ?? "",
                whatsapp_number:
                    data.whatsapp_number ?? "",

                instagram_url:
                    data.instagram_url ?? "",

                facebook_url:
                    data.facebook_url ?? "",

                twitter_x_url:
                    data.twitter_x_url ?? "",

                description:
                    data.description ?? "",

                logo_url:
                    data.logo_url ?? "",
            });
        } catch (error) {
            console.error(
                "Settings fetch error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to load settings."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    // ===================================================
    // FORM UPDATE
    // ===================================================

    function updateForm(
        field: keyof SettingsForm,
        value: string
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    // ===================================================
    // SAVE
    // ===================================================

    async function saveSettings() {
        if (!form.company_name.trim()) {
            alert("Company name is required.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                company_name: form.company_name.trim(),
                tagline: form.tagline.trim() || null,
                email: form.email.trim() || null,
                phone: form.phone.trim() || null,
                address: form.address.trim() || null,
                website_url: form.website_url.trim() || null,
                whatsapp_number: form.whatsapp_number.trim() || null,
                instagram_url: form.instagram_url.trim() || null,
                facebook_url: form.facebook_url.trim() || null,
                twitter_x_url: form.twitter_x_url.trim() || null,
                description: form.description.trim() || null,
                logo_url: form.logo_url.trim() || null,
            };

            const data = await adminApi.put<any>(
                "/api/settings/",
                payload
            );

            /*
             * Backend returns:
             *
             * {
             *   message: "...",
             *   settings: {...}
             * }
             *
             * Therefore use data.settings.
             */

            const updatedSettings = data.settings;

            if (!updatedSettings) {
                throw new Error(
                    "Settings were saved, but the updated data was not returned."
                );
            }

            setSettings(updatedSettings);

            setForm({
                company_name:
                    updatedSettings.company_name ?? "",

                tagline:
                    updatedSettings.tagline ?? "",

                email:
                    updatedSettings.email ?? "",

                phone:
                    updatedSettings.phone ?? "",

                address:
                    updatedSettings.address ?? "",

                website_url:
                    updatedSettings.website_url ?? "",

                whatsapp_number:
                    updatedSettings.whatsapp_number ?? "",

                instagram_url:
                    updatedSettings.instagram_url ?? "",

                facebook_url:
                    updatedSettings.facebook_url ?? "",

                twitter_x_url:
                    updatedSettings.twitter_x_url ?? "",

                description:
                    updatedSettings.description ?? "",

                logo_url:
                    updatedSettings.logo_url ?? "",
            });

            alert("Settings saved successfully.");
        } catch (error) {
            console.error(
                "Settings save error:",
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    }

    // ===================================================
    // RESET
    // ===================================================

    function resetChanges() {
        if (!settings) {
            setForm(emptyForm);
            return;
        }

        setForm({
            company_name:
                settings.company_name ?? "",

            tagline:
                settings.tagline ?? "",

            email:
                settings.email ?? "",

            phone:
                settings.phone ?? "",

            address:
                settings.address ?? "",

            website_url:
                settings.website_url ?? "",

            whatsapp_number:
                settings.whatsapp_number ?? "",

            instagram_url:
                settings.instagram_url ?? "",

            facebook_url:
                settings.facebook_url ?? "",

            twitter_x_url:
                settings.twitter_x_url ?? "",

            description:
                settings.description ?? "",

            logo_url:
                settings.logo_url ?? "",
        });
    }

    // ===================================================
    // LOADING
    // ===================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBF7F0]">
                <AdminSidebar
                    mobileMenuOpen={
                        mobileMenuOpen
                    }
                    setMobileMenuOpen={
                        setMobileMenuOpen
                    }
                />

                <main className="min-h-screen lg:ml-[270px]">
                    <header className="flex h-[82px] items-center justify-between border-b border-[#eadfce] bg-[#FBF7F0] px-5 md:px-8">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A47718]">
                                Administration
                            </p>

                            <h1 className="mt-1 font-serif text-2xl font-bold text-[#4A0618] md:text-3xl">
                                Settings
                            </h1>
                        </div>

                        <button
                            onClick={() =>
                                setMobileMenuOpen(
                                    (previous) =>
                                        !previous
                                )
                            }
                            className="rounded-xl border border-[#d9c9b4] bg-white px-3 py-2 text-xl text-[#4A0618] shadow-sm lg:hidden"
                        >
                            ☰
                        </button>
                    </header>

                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#4A0618]" />

                            <p className="mt-4 text-sm font-semibold text-[#806f61]">
                                Loading settings...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ===================================================
    // PAGE
    // ===================================================

    return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#39030F]">

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

                {/* HEADER */}

                <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-[#eadfce] bg-[#FBF7F0]/95 px-5 backdrop-blur md:px-8">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A47718]">
                            Administration
                        </p>

                        <h1 className="mt-1 font-serif text-2xl font-bold text-[#4A0618] md:text-3xl">
                            Settings
                        </h1>
                    </div>

                    {/* MOBILE MENU */}

                    <button
                        onClick={() =>
                            setMobileMenuOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                        className="rounded-xl border border-[#d9c9b4] bg-white px-3 py-2 text-xl text-[#4A0618] shadow-sm lg:hidden"
                    >
                        ☰
                    </button>
                </header>

                {/* CONTENT */}

                <section className="px-5 py-7 md:px-8 md:py-9">

                    {/* PAGE INTRO */}

                    <div className="mb-7">
                        <p className="max-w-2xl text-sm leading-7 text-[#806f61]">
                            Manage the main SS UTSAV business
                            information, contact details,
                            social links, and company
                            information used throughout
                            the platform.
                        </p>
                    </div>

                    {/* SETTINGS LAYOUT */}

                    <div className="grid gap-6 xl:grid-cols-[250px_1fr]">

                        {/* LEFT SETTINGS NAV */}

                        <aside className="h-fit rounded-2xl border border-[#eadfce] bg-white p-3 shadow-sm">

                            <SettingsNavButton
                                active={
                                    activeSection ===
                                    "business"
                                }
                                icon="◆"
                                title="Business"
                                description="Company information"
                                onClick={() =>
                                    setActiveSection(
                                        "business"
                                    )
                                }
                            />

                            <SettingsNavButton
                                active={
                                    activeSection ===
                                    "contact"
                                }
                                icon="☎"
                                title="Contact"
                                description="Phone and email"
                                onClick={() =>
                                    setActiveSection(
                                        "contact"
                                    )
                                }
                            />

                            <SettingsNavButton
                                active={
                                    activeSection ===
                                    "social"
                                }
                                icon="◎"
                                title="Social Media"
                                description="Website and social links"
                                onClick={() =>
                                    setActiveSection(
                                        "social"
                                    )
                                }
                            />

                            <SettingsNavButton
                                active={
                                    activeSection ===
                                    "system"
                                }
                                icon="⚙"
                                title="System"
                                description="Company status and metadata"
                                onClick={() =>
                                    setActiveSection(
                                        "system"
                                    )
                                }
                            />
                        </aside>

                        {/* RIGHT */}

                        <div className="space-y-6">

                            {/* BUSINESS */}

                            {activeSection ===
                                "business" && (
                                    <SettingsCard
                                        title="Business Information"
                                        description="Basic information about SS UTSAV."
                                    >
                                        <div className="grid gap-5 md:grid-cols-2">

                                            <FormField
                                                label="Company Name"
                                                required
                                            >
                                                <input
                                                    value={
                                                        form.company_name
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "company_name",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="SS UTSAV"
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="Tagline">
                                                <input
                                                    value={
                                                        form.tagline
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "tagline",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="We Plan. You Celebrate."
                                                    className="input-style"
                                                />
                                            </FormField>

                                        </div>

                                        <div className="mt-5">
                                            <FormField label="Business Address">
                                                <textarea
                                                    rows={4}
                                                    value={
                                                        form.address
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "address",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Enter your business address"
                                                    className="input-style resize-none"
                                                />
                                            </FormField>
                                        </div>

                                        <div className="mt-5">
                                            <FormField label="Business Description">
                                                <textarea
                                                    rows={5}
                                                    value={
                                                        form.description
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "description",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Describe SS UTSAV and the services you provide."
                                                    className="input-style resize-none"
                                                />
                                            </FormField>
                                        </div>

                                        <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5">

                                            <p className="font-serif text-lg font-bold text-[#4A0618]">
                                                Current Brand
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center gap-6">

                                                <div>
                                                    <p className="font-serif text-2xl font-bold tracking-wide text-[#4A0618]">
                                                        {form.company_name ||
                                                            "SS UTSAV"}
                                                    </p>

                                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A47718]">
                                                        {form.tagline ||
                                                            "We Plan. You Celebrate."}
                                                    </p>
                                                </div>

                                                <div className="h-10 w-px bg-[#ddcfbc]" />

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#917c69]">
                                                        Primary Theme
                                                    </p>

                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="h-5 w-5 rounded-full bg-[#4A0618]" />

                                                        <span className="h-5 w-5 rounded-full bg-[#D6A928]" />

                                                        <span className="h-5 w-5 rounded-full bg-[#FBF7F0] ring-1 ring-[#d8cbbb]" />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </SettingsCard>
                                )}

                            {/* CONTACT */}

                            {activeSection ===
                                "contact" && (
                                    <SettingsCard
                                        title="Contact Information"
                                        description="Information customers can use to reach SS UTSAV."
                                    >
                                        <div className="grid gap-5 md:grid-cols-2">

                                            <FormField label="Email Address">
                                                <input
                                                    type="email"
                                                    value={
                                                        form.email
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "email",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="hello@ssutsav.com"
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="Phone Number">
                                                <input
                                                    type="tel"
                                                    value={
                                                        form.phone
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "phone",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="WhatsApp Number">
                                                <input
                                                    type="tel"
                                                    value={
                                                        form.whatsapp_number
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "whatsapp_number",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="+91 XXXXX XXXXX"
                                                    className="input-style"
                                                />
                                            </FormField>

                                        </div>

                                        <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5">

                                            <p className="font-semibold text-[#4A0618]">
                                                Contact visibility
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-[#806f61]">
                                                These details can be
                                                connected to the
                                                public website,
                                                enquiry forms,
                                                WhatsApp buttons,
                                                and footer.
                                            </p>

                                        </div>
                                    </SettingsCard>
                                )}

                            {/* SOCIAL */}

                            {activeSection ===
                                "social" && (
                                    <SettingsCard
                                        title="Online Presence"
                                        description="Manage website and social media links."
                                    >
                                        <div className="space-y-5">

                                            <FormField label="Website URL">
                                                <input
                                                    type="url"
                                                    value={
                                                        form.website_url
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "website_url",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="https://www.ssutsav.com"
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="Instagram URL">
                                                <input
                                                    type="url"
                                                    value={
                                                        form.instagram_url
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "instagram_url",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="https://instagram.com/..."
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="Facebook URL">
                                                <input
                                                    type="url"
                                                    value={
                                                        form.facebook_url
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "facebook_url",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="https://facebook.com/..."
                                                    className="input-style"
                                                />
                                            </FormField>

                                            <FormField label="X / Twitter URL">
                                                <input
                                                    type="url"
                                                    value={
                                                        form.twitter_x_url
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        updateForm(
                                                            "twitter_x_url",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="https://x.com/..."
                                                    className="input-style"
                                                />
                                            </FormField>

                                        </div>

                                        <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5">

                                            <p className="font-semibold text-[#4A0618]">
                                                Social links
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-[#806f61]">
                                                These links can be
                                                connected to the
                                                public website footer
                                                and social media
                                                buttons.
                                            </p>

                                        </div>
                                    </SettingsCard>
                                )}

                            {/* SYSTEM */}

                            {activeSection ===
                                "system" && (
                                    <SettingsCard
                                        title="System Information"
                                        description="Current status and metadata for SS UTSAV settings."
                                    >
                                        <div className="grid gap-4 md:grid-cols-3">

                                            <SystemInfoCard
                                                title="Company"
                                                value={
                                                    form.company_name ||
                                                    "SS UTSAV"
                                                }
                                            />

                                            <SystemInfoCard
                                                title="Settings ID"
                                                value={
                                                    settings?.id
                                                        ? `#${settings.id}`
                                                        : "-"
                                                }
                                            />

                                            <SystemInfoCard
                                                title="Status"
                                                value={
                                                    settings?.is_active
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            />

                                            <SystemInfoCard
                                                title="Last Updated"
                                                value={
                                                    formatDate(
                                                        settings?.updated_at
                                                    )
                                                }
                                            />

                                        </div>

                                        <div className="mt-6 rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-5">

                                            <p className="font-semibold text-[#4A0618]">
                                                Settings architecture
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-[#806f61]">
                                                SS UTSAV uses one
                                                central settings
                                                record. Changes made
                                                here are stored in
                                                the settings database
                                                and can be consumed
                                                by the public website
                                                through the public
                                                settings API.
                                            </p>

                                        </div>
                                    </SettingsCard>
                                )}

                            {/* SAVE AREA */}

                            <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">

                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                                    <div>
                                        <p className="font-semibold text-[#4A0618]">
                                            Save your changes
                                        </p>

                                        <p className="mt-1 text-sm text-[#806f61]">
                                            Changes are saved to
                                            the SS UTSAV settings
                                            database.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">

                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={
                                                resetChanges
                                            }
                                            className="rounded-xl border border-[#dfd1c0] bg-white px-5 py-3 text-sm font-bold text-[#4A0618] transition hover:bg-[#fffaf3] disabled:opacity-50"
                                        >
                                            Reset
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                saving
                                            }
                                            onClick={
                                                saveSettings
                                            }
                                            className="rounded-xl bg-[#4A0618] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#35030F] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {saving
                                                ? "Saving..."
                                                : "Save Settings"}
                                        </button>

                                    </div>
                                </div>
                            </div>

                            {/* SECURITY NOTE */}

                            <div className="rounded-2xl border border-[#e7d9c7] bg-[#fffaf3] p-5">

                                <div className="flex gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ead2] text-[#A47718]">
                                        🔒
                                    </div>

                                    <div>

                                        <p className="font-semibold text-[#4A0618]">
                                            Admin-only settings
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-[#806f61]">
                                            Settings requests are
                                            sent with the
                                            authenticated admin JWT.
                                            Keep the admin account
                                            and authentication
                                            credentials private.
                                        </p>

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

// =====================================================
// SETTINGS NAV BUTTON
// =====================================================

function SettingsNavButton({
    active,
    icon,
    title,
    description,
    onClick,
}: {
    active: boolean;
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left transition last:mb-0 ${active
                ? "bg-[#4A0618] text-white shadow-md"
                : "text-[#4A0618] hover:bg-[#fff8ed]"
                }`}
        >
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${active
                    ? "bg-white/10 text-[#D6A928]"
                    : "bg-[#f7edd7] text-[#A47718]"
                    }`}
            >
                {icon}
            </span>

            <span className="min-w-0">

                <span className="block text-sm font-bold">
                    {title}
                </span>

                <span
                    className={`mt-0.5 block text-xs ${active
                        ? "text-white/70"
                        : "text-[#917c69]"
                        }`}
                >
                    {description}
                </span>

            </span>
        </button>
    );
}

// =====================================================
// SETTINGS CARD
// =====================================================

function SettingsCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm md:p-7">

            <div className="border-b border-[#eadfce] pb-5">

                <h2 className="font-serif text-2xl font-bold text-[#4A0618]">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-[#806f61]">
                    {description}
                </p>

            </div>

            <div className="pt-6">
                {children}
            </div>

        </div>
    );
}

// =====================================================
// FORM FIELD
// =====================================================

function FormField({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-bold text-[#4A0618]">

                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}

            </label>

            {children}

        </div>
    );
}

// =====================================================
// SYSTEM INFO CARD
// =====================================================

function SystemInfoCard({
    title,
    value,
}: {
    title: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[#eadfce] bg-[#fffaf3] p-4">

            <p className="text-xs font-bold uppercase tracking-wider text-[#917c69]">
                {title}
            </p>

            <p className="mt-2 break-words text-sm font-bold text-[#4A0618]">
                {value}
            </p>

        </div>
    );
}