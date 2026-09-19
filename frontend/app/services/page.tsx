"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display, Montserrat } from "next/font/google";
import { publicApi } from "@/lib/api";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});


type PublicSettings = {
    company_name?: string;
    tagline?: string;
    description?: string;
};

const defaultSettings: PublicSettings = {
    company_name: "SS UTSAV",
    tagline: "We Plan. You Celebrate.",
    description:
        "From the first idea to the final celebration, SS UTSAV brings planning, trusted vendors, creative styling and seamless coordination together under one team.",
};

const services = [
    {
        title: "Weddings",
        subtitle: "Celebrate your story beautifully",
        description:
            "From intimate ceremonies to grand celebrations, we coordinate every detail of your wedding journey.",
        image:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=90",
        items: [
            "Wedding Planning",
            "Engagement",
            "Haldi",
            "Mehendi",
            "Sangeet",
            "Reception",
        ],
    },
    {
        title: "Private Celebrations",
        subtitle: "Make every milestone memorable",
        description:
            "Thoughtfully planned celebrations for birthdays, family occasions and the moments closest to your heart.",
        image:
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=90",
        items: [
            "Birthdays",
            "Baby Showers",
            "Anniversaries",
            "Naming Ceremonies",
            "Housewarmings",
            "Family Celebrations",
        ],
    },
    {
        title: "Corporate Events",
        subtitle: "Professional events, thoughtfully executed",
        description:
            "Create memorable experiences for your teams, clients and business community with seamless event coordination.",
        image:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=90",
        items: [
            "Conferences",
            "Team Events",
            "Annual Day",
            "Seminars",
            "Product Launches",
            "Corporate Gatherings",
        ],
    },
    {
        title: "College & Youth Events",
        subtitle: "Bring energy to every occasion",
        description:
            "From college fests to cultural programs, we help create energetic and well-coordinated experiences.",
        image:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=90",
        items: [
            "College Fests",
            "Freshers",
            "Farewells",
            "Cultural Events",
            "Fashion Shows",
            "Youth Programs",
        ],
    },
    {
        title: "Décor & Styling",
        subtitle: "Transform spaces into experiences",
        description:
            "Elegant themes, beautiful stages and thoughtful styling designed around the mood of your celebration.",
        image:
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1400&q=90",
        items: [
            "Stage & Backdrop",
            "Floral Décor",
            "Theme Décor",
            "Lighting",
            "Table Styling",
            "Venue Styling",
        ],
    },
    {
        title: "Complete Event Management",
        subtitle: "One team. Every detail.",
        description:
            "Let our team handle the complete event journey from planning and vendors to coordination and execution.",
        image:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=90",
        items: [
            "Event Planning",
            "Vendor Management",
            "Budget Coordination",
            "Logistics",
            "Event-Day Coordination",
            "Complete Execution",
        ],
    },
];
export default function ServicesPage() {
    const [settings, setSettings] =
        useState<PublicSettings>(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await publicApi.get<PublicSettings>(
                    "/api/settings/public"
                );

                setSettings({
                    company_name:
                        data.company_name ||
                        defaultSettings.company_name,

                    tagline:
                        data.tagline ||
                        defaultSettings.tagline,

                    description:
                        data.description ||
                        defaultSettings.description,
                });
            } catch (error) {
                console.error(
                    "Failed to load public settings:",
                    error
                );
            }
        };

        fetchSettings();
    }, []);
    return (
        <main
            className={`${montserrat.className} overflow-hidden bg-[#FBF7F0]`}
        >
            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden bg-[#4A0618]">

                {/* Background */}

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                {/* Overlay */}

                <div className="absolute inset-0 bg-[#35030F]/65" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#30030D]/95 via-[#4A0618]/75 to-[#4A0618]/35" />

                {/* Gold glow */}

                <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#D6A928]/10 blur-[100px]" />

                <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[120px]" />

                {/* Content */}

                <div className="relative mx-auto flex min-h-[560px] max-w-[1500px] items-center px-6 py-24 sm:px-10 lg:px-16 xl:px-24">

                    <div className="max-w-4xl">

                        {/* Label */}

                        <div className="flex items-center gap-4">

                            <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#D9B84C] sm:text-sm">
                                {settings.company_name}
                            </p>

                            <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

                        </div>

                        {/* Heading */}

                        <h1
                            className={`${playfair.className} mt-8 text-5xl font-semibold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[6rem]`}
                        >
                            Everything Your
                            <br />

                            <span className="text-[#D9B84C]">
                                Celebration Needs.
                            </span>
                        </h1>

                        {/* Separator */}

                        <div className="mt-8 flex items-center gap-3">

                            <span className="h-[2px] w-16 bg-[#D6A928]" />

                            <span className="text-sm text-[#D6A928]">
                                ✦
                            </span>

                            <span className="h-[2px] w-16 bg-[#D6A928]" />

                        </div>

                        {/* Description */}

                        <p className="mt-8 max-w-2xl text-base leading-8 text-white/80 sm:text-lg sm:leading-9">
                            {settings.description}
                        </p>

                        {/* CTA */}

                        <Link
                            href="/get-a-quote"
                            className="group mt-9 inline-flex min-h-[58px] items-center rounded-xl bg-[#D6A928] px-9 text-xs font-bold uppercase tracking-[0.16em] text-[#430517] shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                        >
                            Start Planning

                            <span className="ml-3 text-lg transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                    </div>

                </div>

            </section>

            {/* =====================================================
                INTRODUCTION
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-24 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-5xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                        What We Do
                    </p>

                    <h2
                        className={`${playfair.className} mt-5 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl lg:text-[4rem]`}
                    >
                        One Vision.
                        <br />

                        <span className="text-[#A87918]">
                            Many Ways To Celebrate.
                        </span>
                    </h2>

                    <div className="mx-auto mt-7 flex items-center justify-center gap-5">

                        <span className="h-px w-14 bg-[#C9A227]" />

                        <span className="text-sm text-[#C9A227]">
                            ✦
                        </span>

                        <span className="h-px w-14 bg-[#C9A227]" />

                    </div>

                    <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[#665B5B] sm:text-lg sm:leading-9">
                        Every event is different. That's why we build our
                        services around your occasion, your expectations
                        and your vision rather than offering a one-size-fits-all
                        experience.
                    </p>

                </div>

            </section>

            {/* =====================================================
                SERVICES
            ====================================================== */}

            <section className="bg-white px-6 pb-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-7xl space-y-20">

                    {services.map((service, index) => (

                        <article
                            key={service.title}
                            className={`grid overflow-hidden rounded-[30px] border border-[#E8DED5] bg-[#FBF7F0] shadow-sm lg:grid-cols-2 ${index % 2 !== 0
                                ? "lg:[&>div:first-child]:order-2"
                                : ""
                                }`}
                        >

                            {/* IMAGE */}

                            <div className="relative min-h-[390px] overflow-hidden">

                                <div
                                    className="absolute inset-0 bg-cover bg-center transition duration-700 hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${service.image}')`,
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/70 via-transparent to-transparent" />

                                {/* Number */}

                                <div className="absolute left-7 top-7 flex h-14 w-14 items-center justify-center rounded-full border border-[#D9B84C]/70 bg-[#4A0618]/80 text-sm font-semibold text-[#D9B84C] backdrop-blur-sm">
                                    {String(index + 1).padStart(2, "0")}
                                </div>

                            </div>

                            {/* CONTENT */}

                            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">

                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A87918]">
                                    {settings.company_name}
                                </p>

                                <h2
                                    className={`${playfair.className} mt-4 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl`}
                                >
                                    {service.title}
                                </h2>

                                <p
                                    className={`${playfair.className} mt-3 text-xl italic text-[#A87918] sm:text-2xl`}
                                >
                                    {service.subtitle}
                                </p>

                                <p className="mt-6 text-base leading-8 text-[#665B5B] sm:text-lg sm:leading-9">
                                    {service.description}
                                </p>

                                {/* Service list */}

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">

                                    {service.items.map((item) => (

                                        <div
                                            key={item}
                                            className="flex items-center gap-3"
                                        >

                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/50 text-xs text-[#A87918]">
                                                ✓
                                            </span>

                                            <span className="text-sm font-medium text-[#4A4141] sm:text-base">
                                                {item}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                                {/* CTA */}

                                <Link
                                    href="/get-a-quote"
                                    className="group mt-9 inline-flex items-center text-xs font-bold uppercase tracking-[0.17em] text-[#5A1020]"
                                >
                                    Plan This With Us

                                    <span className="ml-3 text-base text-[#C9A227] transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>

                                </Link>

                            </div>

                        </article>

                    ))}

                </div>

            </section>

            {/* =====================================================
                WHY SS UTSAV
            ====================================================== */}

            <section className="bg-[#4A0618] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-6xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Why {settings.company_name}
                        </p>

                        <h2
                            className={`${playfair.className} mt-5 text-5xl font-semibold text-white sm:text-6xl lg:text-[4rem]`}
                        >
                            Your Celebration,
                            <br />
                            Our Responsibility.
                        </h2>

                    </div>

                    <div className="mt-16 grid gap-7 md:grid-cols-3">

                        {[
                            {
                                title: "Thoughtful Planning",
                                text: "We understand your requirements before building the event around them.",
                                icon: "✦",
                            },
                            {
                                title: "Trusted Vendors",
                                text: "We coordinate with reliable service partners to bring every element together.",
                                icon: "♕",
                            },
                            {
                                title: "Seamless Execution",
                                text: "Our team stays focused on timelines, coordination and event-day details.",
                                icon: "◇",
                            },
                        ].map((item) => (

                            <div
                                key={item.title}
                                className="rounded-2xl border border-[#D9B84C]/20 bg-white/[0.04] p-8 text-center transition duration-300 hover:-translate-y-1 hover:border-[#D9B84C]/50"
                            >

                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D9B84C]/50 text-lg text-[#D9B84C]">
                                    {item.icon}
                                </div>

                                <h3
                                    className={`${playfair.className} mt-6 text-2xl font-semibold text-white`}
                                >
                                    {item.title}
                                </h3>

                                <p className="mt-4 text-base leading-7 text-white/60">
                                    {item.text}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </section>

            {/* =====================================================
                FINAL CTA
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-28 sm:px-10 lg:px-16">

                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[30px] bg-[#5A1020] px-8 py-20 text-center sm:px-12">

                    {/* Decorative circles */}

                    <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border border-[#D9B84C]/20" />

                    <div className="absolute -bottom-28 -right-20 h-72 w-72 rounded-full border border-[#D9B84C]/20" />

                    <div className="relative">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Let's Create Something Beautiful
                        </p>

                        <h2
                            className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.2rem]`}
                        >
                            Have An Event In Mind?
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
                            Tell us about your occasion and let{" "}
                            {settings.company_name} help turn your vision
                            into a celebration worth remembering.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="mt-9 inline-flex items-center rounded-xl bg-[#D6A928] px-9 py-4 text-xs font-bold uppercase tracking-[0.17em] text-[#4A0618] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                        >
                            Get Your Quote

                            <span className="ml-3 text-base">
                                →
                            </span>

                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
}