"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Playfair_Display, Montserrat } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const API_BASE = "http://127.0.0.1:8000";

type PublicSettings = {
    company_name: string;
    tagline: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp_number: string | null;
    website_url: string | null;
    instagram_url: string | null;
    facebook_url: string | null;
    description: string | null;
    logo_url: string | null;
};

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Public settings
    const [settings, setSettings] = useState<PublicSettings | null>(null);

    // Load public company settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch(
                    `${API_BASE}/api/settings/public`,
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to load public settings.");
                }

                const data: PublicSettings = await response.json();

                setSettings(data);
            } catch (err) {
                console.error("Public settings error:", err);
            }
        };

        loadSettings();
    }, []);

    /*
     * Dynamic contact values
     * Fallback values are kept so the page still looks correct
     * if the backend is temporarily unavailable.
     */
    const phone = settings?.phone || "+91 99999 99999";
    const email = settings?.email || "hello@ssutsav.com";
    const address = settings?.address || "Bengaluru";

    // Convert phone number into a valid tel: value
    const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);
        setSuccess(false);
        setError("");

        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
            full_name: String(formData.get("name") || "").trim(),
            phone: String(formData.get("phone") || "").trim(),
            email: String(formData.get("email") || "").trim() || null,
            event_type: String(formData.get("eventType") || "").trim(),
            event_date: String(formData.get("eventDate") || "").trim(),
            location: String(formData.get("location") || "").trim(),
            guest_count: Number(formData.get("guests") || 0),
            budget_range: null,
            services: null,
            message: String(formData.get("message") || "").trim() || null,
        };

        if (!payload.full_name) {
            setError("Please enter your full name.");
            setIsSubmitting(false);
            return;
        }

        if (!payload.phone) {
            setError("Please enter your phone number.");
            setIsSubmitting(false);
            return;
        }

        if (!payload.event_type) {
            setError("Please select an event type.");
            setIsSubmitting(false);
            return;
        }

        if (!payload.event_date) {
            setError("Please select your event date.");
            setIsSubmitting(false);
            return;
        }

        if (!payload.location) {
            setError("Please enter your event location or venue.");
            setIsSubmitting(false);
            return;
        }

        if (!payload.guest_count || payload.guest_count <= 0) {
            setError("Please enter a valid guest count.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/api/leads/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            let data = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                if (response.status === 422 && data?.detail) {
                    const validationMessage = Array.isArray(data.detail)
                        ? data.detail
                            .map((item: any) => item.msg)
                            .join(", ")
                        : String(data.detail);

                    throw new Error(validationMessage);
                }

                throw new Error(
                    data?.detail || "Unable to submit your enquiry."
                );
            }

            setSuccess(true);
            form.reset();
        } catch (err: any) {
            if (err?.message === "Failed to fetch") {
                setError(
                    "Unable to connect to SS UTSAV. Please make sure the backend server is running."
                );
            } else {
                setError(
                    err?.message || "Something went wrong. Please try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className={`${montserrat.className} bg-[#FBF7F0] text-[#39030F]`}>
            {/* HERO */}
            <section className="relative min-h-[72vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#39030F]/75" />

                <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-6 py-24 lg:px-12">
                    <div className="max-w-4xl text-white">
                        <p className="mb-6 text-sm font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Get In Touch
                        </p>

                        <h1
                            className={`${playfair.className} text-6xl font-semibold leading-[0.95] md:text-7xl lg:text-[7rem]`}
                        >
                            Let&apos;s Plan
                            <br />
                            Something Special.
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                            Whether you&apos;re planning an intimate celebration or a
                            larger event, tell us what you have in mind. We&apos;d love to
                            hear your vision.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="mt-10 inline-block bg-[#D9B84C] px-9 py-5 text-sm font-bold uppercase tracking-[0.2em] text-[#39030F] transition hover:bg-white"
                        >
                            Get A Quote
                        </Link>
                    </div>
                </div>
            </section>

            {/* CONTACT INTRO */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                            Contact SS UTSAV
                        </p>

                        <h2
                            className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                        >
                            Tell Us About
                            <br />
                            Your Celebration.
                        </h2>

                        <p className="mt-7 max-w-xl text-lg leading-8 text-[#39030F]/65">
                            Share a few details about your event and our team can understand
                            what you need, what you are envisioning, and how we can help.
                        </p>
                    </div>

                    {/* CONTACT DETAILS */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="border border-[#39030F]/10 bg-white p-8 shadow-sm">
                            <div className="mb-6 text-3xl text-[#C9A227]">☎</div>

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                Call Us
                            </p>

                            <h3
                                className={`${playfair.className} mt-3 text-2xl font-semibold`}
                            >
                                Let&apos;s Talk
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#39030F]/60">
                                Speak with our team about your event requirements.
                            </p>

                            <a
                                href={phoneHref}
                                className="mt-5 inline-block text-sm font-semibold text-[#39030F] hover:text-[#C9A227]"
                            >
                                {phone}
                            </a>
                        </div>

                        <div className="border border-[#39030F]/10 bg-white p-8 shadow-sm">
                            <div className="mb-6 text-3xl text-[#C9A227]">✉</div>

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                Email Us
                            </p>

                            <h3
                                className={`${playfair.className} mt-3 text-2xl font-semibold`}
                            >
                                Send A Message
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#39030F]/60">
                                Send your event details and our team will get back to you.
                            </p>

                            <a
                                href={`mailto:${email}`}
                                className="mt-5 inline-block break-all text-sm font-semibold text-[#39030F] hover:text-[#C9A227]"
                            >
                                {email}
                            </a>
                        </div>

                        <div className="border border-[#39030F]/10 bg-white p-8 shadow-sm">
                            <div className="mb-6 text-3xl text-[#C9A227]">⌖</div>

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                Location
                            </p>

                            <h3
                                className={`${playfair.className} mt-3 text-2xl font-semibold`}
                            >
                                {address}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#39030F]/60">
                                Serving Bengaluru and surrounding areas for celebrations and
                                events.
                            </p>
                        </div>

                        <div className="border border-[#39030F]/10 bg-white p-8 shadow-sm">
                            <div className="mb-6 text-3xl text-[#C9A227]">◷</div>

                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                Availability
                            </p>

                            <h3
                                className={`${playfair.className} mt-3 text-2xl font-semibold`}
                            >
                                Let&apos;s Connect
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-[#39030F]/60">
                                Tell us your preferred date and we&apos;ll discuss the next
                                steps with you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT FORM */}
            <section className="bg-[#39030F] text-white">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                    <div className="grid gap-16 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                        <div>
                            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                                Start A Conversation
                            </p>

                            <h2
                                className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                Let&apos;s Talk
                                <br />
                                About Your Event.
                            </h2>

                            <p className="mt-7 max-w-xl text-lg leading-8 text-white/70">
                                Give us a few details and tell us what you&apos;re planning.
                                This first conversation helps us understand your requirements
                                before we prepare the next steps.
                            </p>

                            <div className="mt-10 h-px w-20 bg-[#D9B84C]" />

                            <p className="mt-7 text-sm uppercase tracking-[0.15em] text-[#D9B84C]">
                                We Plan. You Celebrate.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-7 text-[#39030F] shadow-2xl md:p-10 lg:p-12"
                        >
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Your name"
                                        required
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Phone Number
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+91"
                                        required
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="eventType"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Event Type
                                    </label>

                                    <select
                                        id="eventType"
                                        name="eventType"
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        defaultValue=""
                                        required
                                    >
                                        <option value="" disabled>
                                            Select event type
                                        </option>
                                        <option>Wedding</option>
                                        <option>Engagement</option>
                                        <option>Birthday</option>
                                        <option>Baby Shower</option>
                                        <option>Corporate Event</option>
                                        <option>College Event</option>
                                        <option>Private Celebration</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="eventDate"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Event Date
                                    </label>

                                    <input
                                        id="eventDate"
                                        name="eventDate"
                                        type="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        required
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="guests"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Guest Count
                                    </label>

                                    <input
                                        id="guests"
                                        name="guests"
                                        type="number"
                                        min="1"
                                        placeholder="Approximate guests"
                                        required
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                {/* LOCATION / VENUE */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="location"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Event Location / Venue
                                    </label>

                                    <input
                                        id="location"
                                        name="location"
                                        type="text"
                                        placeholder="Venue name or event location"
                                        required
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="message"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                    >
                                        Tell Us More
                                    </label>

                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={6}
                                        placeholder="Tell us about your event, venue, requirements, ideas, or anything else you'd like us to know..."
                                        className="w-full resize-none border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#C9A227]"
                                    />
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* SUCCESS */}
                            {success && (
                                <div className="mt-6 border border-green-200 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                                    <strong>Thank you!</strong> Your enquiry has been
                                    submitted successfully. Our SS UTSAV team will get
                                    back to you soon.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="mt-8 w-full bg-[#4A0618] px-8 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#D9B84C] hover:text-[#39030F] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Submitting..." : "Send Enquiry"}
                            </button>

                            <p className="mt-4 text-center text-xs leading-5 text-[#39030F]/45">
                                Your enquiry will be securely submitted to the SS UTSAV
                                team for follow-up.
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* WHATSAPP / QUICK CONTACT */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
                <div className="relative overflow-hidden bg-[#F1E9DC] px-8 py-16 text-center md:px-16">
                    <div
                        className="absolute right-0 top-0 h-full w-1/3 bg-cover bg-center opacity-10"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=90')",
                        }}
                    />

                    <div className="relative mx-auto max-w-3xl">
                        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                            Prefer A Quick Conversation?
                        </p>

                        <h2
                            className={`${playfair.className} text-4xl font-semibold md:text-5xl`}
                        >
                            Let&apos;s Start With A Conversation.
                        </h2>

                        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#39030F]/65">
                            Have a quick question or want to discuss your event before
                            filling out the form? Get in touch with our team directly.
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <a
                                href={phoneHref}
                                className="bg-[#4A0618] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#D9B84C] hover:text-[#39030F]"
                            >
                                Call Us
                            </a>

                            <a
                                href={`mailto:${email}`}
                                className="border border-[#39030F]/25 px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[#39030F] transition hover:border-[#C9A227] hover:text-[#C9A227]"
                            >
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="relative overflow-hidden bg-[#4A0618]">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=2000&q=90')",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-6 py-24 text-center text-white lg:py-32">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                        SS UTSAV
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-7xl`}
                    >
                        Your Event.
                        <br />
                        Our Expertise.
                    </h2>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/75">
                        Let&apos;s create an experience that feels effortless for you and
                        unforgettable for everyone who attends.
                    </p>

                    <Link
                        href="/get-a-quote"
                        className="mt-10 inline-block bg-[#D9B84C] px-10 py-5 text-sm font-bold uppercase tracking-[0.2em] text-[#39030F] transition hover:bg-white"
                    >
                        Get A Quote
                    </Link>
                </div>
            </section>
        </main>
    );
}