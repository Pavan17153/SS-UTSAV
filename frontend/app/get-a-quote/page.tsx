"use client";

import { useState } from "react";
import Link from "next/link";
import { Playfair_Display, Montserrat } from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const API_BASE_URL = "http://127.0.0.1:8000";

export default function GetAQuotePage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Collect selected services
        const selectedServices = formData.getAll("services");

        // Backend Lead payload
        const payload = {
            full_name: String(formData.get("fullName") || "").trim(),

            phone: String(formData.get("phone") || "").trim(),

            email:
                String(formData.get("email") || "").trim() ||
                null,

            event_type: String(
                formData.get("eventType") || ""
            ).trim(),

            event_date: String(
                formData.get("eventDate") || ""
            ).trim(),

            location: String(
                formData.get("venue") || ""
            ).trim(),

            guest_count: Number(
                formData.get("guestCount") || 0
            ),

            budget_range:
                String(formData.get("budget") || "").trim() ||
                null,

            services:
                selectedServices.length > 0
                    ? selectedServices.join(", ")
                    : null,

            message:
                String(formData.get("message") || "").trim() ||
                null,
        };

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/leads/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            let data: any = null;

            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (!response.ok) {
                if (response.status === 422) {
                    const validationMessage =
                        data?.detail
                            ?.map(
                                (item: any) =>
                                    item?.msg
                            )
                            ?.join(", ");

                    throw new Error(
                        validationMessage ||
                        "Please check the form details and try again."
                    );
                }

                throw new Error(
                    data?.detail ||
                    "Unable to submit your enquiry. Please try again."
                );
            }

            console.log(
                "Lead created successfully:",
                data
            );

            setSubmitted(true);
            form.reset();
        } catch (err: any) {
            console.error(
                "Lead submission error:",
                err
            );

            if (
                err?.message === "Failed to fetch"
            ) {
                setError(
                    "Unable to connect to SS UTSAV. Please make sure the backend server is running."
                );
            } else {
                setError(
                    err?.message ||
                    "Something went wrong. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className={`${montserrat.className} bg-[#FBF7F0] text-[#39030F]`}
        >
            {/* HERO */}
            <section className="relative min-h-[68vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#39030F]/78" />

                <div className="relative mx-auto flex min-h-[68vh] max-w-7xl items-center px-6 py-24 lg:px-12">
                    <div className="max-w-4xl text-white">
                        <p className="mb-6 text-sm font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Start Planning
                        </p>

                        <h1
                            className={`${playfair.className} text-6xl font-semibold leading-[0.95] md:text-7xl lg:text-[7rem]`}
                        >
                            Let&apos;s Create
                            <br />
                            Your Celebration.
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                            Tell us about your event, your ideas, and what you need. We&apos;ll
                            use the details to understand your celebration and prepare the
                            next step.
                        </p>
                    </div>
                </div>
            </section>

            {/* INTRO */}
            <section className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                        Request A Quote
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                    >
                        Tell Us About Your Event.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-[#39030F]/65">
                        The more we know, the better we can understand what you are
                        planning. You don&apos;t need to have everything figured out yet.
                    </p>
                </div>
            </section>

            {/* FORM SECTION */}
            <section className="bg-[#39030F] text-white">
                <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28">
                    <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
                        {/* LEFT INFO */}
                        <div className="lg:sticky lg:top-24">
                            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                                Your Event
                            </p>

                            <h2
                                className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                A Few Details.
                                <br />
                                A Great Start.
                            </h2>

                            <p className="mt-7 text-lg leading-8 text-white/70">
                                Share the basics with us and our team can start understanding
                                the event you have in mind.
                            </p>

                            <div className="mt-10 h-px w-20 bg-[#D9B84C]" />

                            <div className="mt-10 space-y-7">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9B84C]">
                                        Step 01
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        Tell us who you are and what you are planning.
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9B84C]">
                                        Step 02
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        Share your event requirements and preferences.
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9B84C]">
                                        Step 03
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-white/65">
                                        We&apos;ll understand the requirement and discuss the next
                                        steps.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white p-7 text-[#39030F] shadow-2xl md:p-10 lg:p-12"
                        >
                            {/* PERSONAL DETAILS */}
                            <div>
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                        01 — Your Details
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-3xl font-semibold`}
                                    >
                                        Who Are We Planning With?
                                    </h3>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="fullName"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Full Name *
                                        </label>

                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            required
                                            placeholder="Your full name"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="company"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Company / Organization
                                        </label>

                                        <input
                                            id="company"
                                            name="company"
                                            type="text"
                                            placeholder="Optional"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Email Address *
                                        </label>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            placeholder="you@example.com"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Phone Number *
                                        </label>

                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            placeholder="+91"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* EVENT DETAILS */}
                            <div className="mt-14 border-t border-[#39030F]/10 pt-12">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                        02 — Event Details
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-3xl font-semibold`}
                                    >
                                        What Are You Planning?
                                    </h3>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="eventType"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Event Type *
                                        </label>

                                        <select
                                            id="eventType"
                                            name="eventType"
                                            required
                                            defaultValue=""
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        >
                                            <option value="" disabled>
                                                Select event type
                                            </option>

                                            <option>Wedding</option>
                                            <option>Engagement</option>
                                            <option>Reception</option>
                                            <option>Birthday</option>
                                            <option>Baby Shower</option>
                                            <option>Naming Ceremony</option>
                                            <option>Anniversary</option>
                                            <option>Housewarming</option>
                                            <option>Corporate Event</option>
                                            <option>College Event</option>
                                            <option>
                                                Community / Cultural Event
                                            </option>
                                            <option>Brand / Store Event</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="eventDate"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Event Date *
                                        </label>

                                        <input
                                            id="eventDate"
                                            name="eventDate"
                                            type="date"
                                            required
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="guestCount"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Approx. Guest Count *
                                        </label>

                                        <input
                                            id="guestCount"
                                            name="guestCount"
                                            type="number"
                                            min="1"
                                            required
                                            placeholder="e.g. 150"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="venue"
                                            className="mb-2 block text-xs font-bold uppercase tracking-[0.15em]"
                                        >
                                            Venue / Location *
                                        </label>

                                        <input
                                            id="venue"
                                            name="venue"
                                            type="text"
                                            required
                                            placeholder="Venue or area"
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm outline-none transition focus:border-[#C9A227]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SERVICES */}
                            <div className="mt-14 border-t border-[#39030F]/10 pt-12">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                        03 — Services
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-3xl font-semibold`}
                                    >
                                        What Do You Need Help With?
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-[#39030F]/55">
                                        Select everything that may be relevant. You can always
                                        discuss additional requirements later.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        "Complete Event Planning",
                                        "Venue Coordination",
                                        "Décor & Styling",
                                        "Food & Catering",
                                        "Photography & Videography",
                                        "Entertainment",
                                        "Guest Management",
                                        "Invitations",
                                        "Sound & Lighting",
                                        "Event-Day Coordination",
                                        "Vendor Management",
                                        "Other",
                                    ].map((service) => (
                                        <label
                                            key={service}
                                            className="flex cursor-pointer items-center gap-3 border border-[#39030F]/10 bg-[#FBF7F0] px-4 py-4 text-sm transition hover:border-[#C9A227]"
                                        >
                                            <input
                                                type="checkbox"
                                                name="services"
                                                value={service}
                                                className="h-4 w-4 accent-[#4A0618]"
                                            />

                                            <span>{service}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* BUDGET */}
                            <div className="mt-14 border-t border-[#39030F]/10 pt-12">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                        04 — Budget
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-3xl font-semibold`}
                                    >
                                        Your Approximate Budget
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-[#39030F]/55">
                                        This helps us understand the scale of your requirements.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        "Below ₹1 Lakh",
                                        "₹1 Lakh – ₹3 Lakhs",
                                        "₹3 Lakhs – ₹5 Lakhs",
                                        "₹5 Lakhs – ₹10 Lakhs",
                                        "₹10 Lakhs+",
                                        "Not Sure Yet",
                                    ].map((budget) => (
                                        <label
                                            key={budget}
                                            className="flex cursor-pointer items-center gap-3 border border-[#39030F]/10 bg-[#FBF7F0] px-4 py-4 text-sm transition hover:border-[#C9A227]"
                                        >
                                            <input
                                                type="radio"
                                                name="budget"
                                                value={budget}
                                                className="h-4 w-4 accent-[#4A0618]"
                                            />

                                            <span>{budget}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* MESSAGE */}
                            <div className="mt-14 border-t border-[#39030F]/10 pt-12">
                                <div className="mb-8">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A227]">
                                        05 — Your Vision
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-3xl font-semibold`}
                                    >
                                        Tell Us More
                                    </h3>
                                </div>

                                <textarea
                                    name="message"
                                    rows={7}
                                    placeholder="Tell us about your event, your ideas, preferred style, venue, special requirements, or anything else you would like us to know..."
                                    className="w-full resize-none border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm leading-7 outline-none transition focus:border-[#C9A227]"
                                />
                            </div>

                            {/* SUBMIT */}
                            <div className="mt-12 border-t border-[#39030F]/10 pt-10">
                                {submitted ? (
                                    <div className="border border-[#C9A227]/40 bg-[#F1E9DC] p-6 text-center">
                                        <p
                                            className={`${playfair.className} text-2xl font-semibold`}
                                        >
                                            Thank You.
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-[#39030F]/65">
                                            Your enquiry has been received by SS UTSAV. Our team
                                            will review your requirements and get in touch with you.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSubmitted(false);
                                                setError("");
                                            }}
                                            className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-[#39030F] underline underline-offset-4"
                                        >
                                            Submit Another Enquiry
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {error && (
                                            <div className="mb-5 border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`w-full px-8 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white transition ${loading
                                                ? "cursor-not-allowed bg-[#80606A]"
                                                : "bg-[#4A0618] hover:bg-[#D9B84C] hover:text-[#39030F]"
                                                }`}
                                        >
                                            {loading
                                                ? "Submitting..."
                                                : "Request My Quote"}
                                        </button>

                                        <p className="mt-4 text-center text-xs leading-5 text-[#39030F]/45">
                                            By submitting this form, you are sharing your event
                                            details with SS UTSAV for enquiry purposes.
                                        </p>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* WHAT HAPPENS NEXT */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                        What Happens Next?
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                    >
                        From Enquiry To Celebration.
                    </h2>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {[
                        {
                            number: "01",
                            title: "We Review",
                            text: "We understand the information you shared and the requirements of your event.",
                        },
                        {
                            number: "02",
                            title: "We Connect",
                            text: "We discuss your vision, requirements, expectations, and possible options.",
                        },
                        {
                            number: "03",
                            title: "We Plan",
                            text: "Once we understand the event, we can move forward with planning and coordination.",
                        },
                    ].map((item) => (
                        <div
                            key={item.number}
                            className="border border-[#39030F]/10 bg-white p-10 shadow-sm"
                        >
                            <span className="text-sm font-bold tracking-[0.2em] text-[#C9A227]">
                                {item.number}
                            </span>

                            <h3
                                className={`${playfair.className} mt-5 text-3xl font-semibold`}
                            >
                                {item.title}
                            </h3>

                            <p className="mt-5 text-base leading-7 text-[#39030F]/65">
                                {item.text}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="relative overflow-hidden bg-[#4A0618]">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=90')",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-6 py-24 text-center text-white lg:py-32">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                        SS UTSAV
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-7xl`}
                    >
                        You Bring The Vision.
                        <br />
                        We&apos;ll Plan The Rest.
                    </h2>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/75">
                        Have more questions before requesting a quote? Get in touch with
                        our team.
                    </p>

                    <Link
                        href="/contact"
                        className="mt-10 inline-block border border-white/60 px-10 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:border-[#D9B84C] hover:text-[#D9B84C]"
                    >
                        Contact Us
                    </Link>
                </div>
            </section>
        </main>
    );
}