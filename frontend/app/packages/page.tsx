"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display, Montserrat } from "next/font/google";
import { publicApi } from "@/lib/api";
import {
    ClipboardList,
    GitMerge,
    Palette,
    CheckCircle2,
} from "lucide-react";
const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

type BackendPackage = {
    id: number;
    name: string;
    description: string | null;
    starting_price: number | string | null;
    services: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
};

type Package = {
    number: string;
    name: string;
    subtitle: string;
    description: string;
    image: string;
    idealFor: string;
    features: string[];
    startingPrice: number | string | null;
    featured?: boolean;
};

const defaultPackages: Package[] = [
    {
        number: "01",
        name: "Essential",
        subtitle: "Simple celebrations, beautifully planned",
        description:
            "A practical package for intimate celebrations where you want the important details handled professionally.",
        image:
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=90",
        idealFor: "Birthdays • Baby Showers • Small Gatherings",
        features: [
            "Event planning consultation",
            "Basic venue coordination",
            "Theme & décor planning",
            "Vendor coordination",
            "Event-day support",
        ],
        startingPrice: null,
    },
    {
        number: "02",
        name: "Signature",
        subtitle: "A complete celebration experience",
        description:
            "Our balanced package for celebrations that need thoughtful styling, detailed coordination and smooth execution.",
        image:
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=90",
        idealFor: "Engagements • Anniversaries • Receptions",
        features: [
            "Complete event planning",
            "Venue & vendor coordination",
            "Theme décor & styling",
            "Guest & timeline coordination",
            "Event-day management",
            "Post-event coordination",
        ],
        startingPrice: null,
        featured: true,
    },
    {
        number: "03",
        name: "Grand",
        subtitle: "For celebrations that deserve more",
        description:
            "A comprehensive experience designed for larger occasions where every detail needs dedicated planning and execution.",
        image:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=90",
        idealFor: "Weddings • Large Celebrations • Corporate Events",
        features: [
            "End-to-end event planning",
            "Dedicated coordination",
            "Complete décor & styling",
            "Multiple vendor management",
            "Guest & logistics coordination",
            "Event-day execution team",
            "Detailed event timeline",
        ],
        startingPrice: null,
    },
];

const included = [
    {
        icon: ClipboardList,
        title: "Planning",
        text: "We turn your event idea into a structured plan.",
    },
    {
        icon: GitMerge,
        title: "Coordination",
        text: "We bring venues, vendors and timelines together.",
    },
    {
        icon: Palette,
        title: "Styling",
        text: "We help create a visual experience around your theme.",
    },
    {
        icon: CheckCircle2,
        title: "Execution",
        text: "We stay involved through the important event-day details.",
    },
];

function convertServicesToFeatures(
    services: string | null
): string[] {
    if (!services) {
        return [];
    }

    return services
        .split(",")
        .map((service) => service.trim())
        .filter(Boolean);
}

function createSubtitle(name: string): string {
    const subtitles: Record<string, string> = {
        Essential:
            "Simple celebrations, beautifully planned",

        Signature:
            "A complete celebration experience",

        Grand:
            "For celebrations that deserve more",
    };

    return (
        subtitles[name] ||
        "A celebration experience designed around you"
    );
}

function createIdealFor(name: string): string {
    const idealFor: Record<string, string> = {
        Essential:
            "Birthdays • Baby Showers • Small Gatherings",

        Signature:
            "Engagements • Anniversaries • Receptions",

        Grand:
            "Weddings • Large Celebrations • Corporate Events",
    };

    return (
        idealFor[name] ||
        "Custom Celebrations • Events • Special Occasions"
    );
}

function mapBackendPackage(
    pkg: BackendPackage,
    index: number
): Package {
    const features = convertServicesToFeatures(pkg.services);

    return {
        number: String(index + 1).padStart(2, "0"),

        name: pkg.name,

        subtitle: createSubtitle(pkg.name),

        description:
            pkg.description ||
            "A thoughtfully planned event package designed around your celebration.",

        image:
            pkg.image_url ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=90",

        idealFor: createIdealFor(pkg.name),

        features:
            features.length > 0
                ? features
                : [
                    "Event planning",
                    "Venue coordination",
                    "Vendor coordination",
                    "Event-day support",
                ],

        startingPrice: pkg.starting_price,

        featured: index === 1,
    };
}

export default function PackagesPage() {
    const [packages, setPackages] =
        useState<Package[]>(defaultPackages);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const data =
                    await publicApi.get<BackendPackage[]>(
                        "/api/packages/public"
                    );

                const activePackages = data.filter(
                    (pkg) => pkg.is_active
                );

                if (activePackages.length > 0) {
                    setPackages(
                        activePackages.map(
                            (pkg, index) =>
                                mapBackendPackage(
                                    pkg,
                                    index
                                )
                        )
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to load packages:",
                    error
                );

                // Keep default packages if backend is unavailable.
                setPackages(defaultPackages);
            }
        };

        fetchPackages();
    }, []);
    return (
        <main
            className={`${montserrat.className} overflow-hidden bg-[#FBF7F0]`}
        >
            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="relative overflow-hidden bg-[#4A0618]">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#35030F]/70" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#30030D]/95 via-[#4A0618]/75 to-[#4A0618]/35" />

                <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[120px]" />

                <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[120px]" />

                <div className="relative mx-auto flex min-h-[560px] max-w-[1500px] items-center px-6 py-24 sm:px-10 lg:px-16 xl:px-24">

                    <div className="max-w-4xl">

                        <div className="flex items-center gap-4">

                            <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#D9B84C] sm:text-sm">
                                SS UTSAV
                            </p>

                            <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

                        </div>

                        <h1
                            className={`${playfair.className} mt-8 text-5xl font-semibold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl lg:text-[6rem]`}
                        >
                            Packages Designed
                            <br />

                            <span className="text-[#D9B84C]">
                                Around Your Celebration.
                            </span>
                        </h1>

                        <div className="mt-8 flex items-center gap-3">

                            <span className="h-[2px] w-16 bg-[#D6A928]" />

                            <span className="text-sm text-[#D6A928]">
                                ✦
                            </span>

                            <span className="h-[2px] w-16 bg-[#D6A928]" />

                        </div>

                        <p className="mt-8 max-w-2xl text-base leading-8 text-white/80 sm:text-lg sm:leading-9">
                            Choose a starting point for your celebration,
                            then let us customize the experience around your
                            event, venue, guest count and vision.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="group mt-9 inline-flex min-h-[58px] items-center rounded-xl bg-[#D6A928] px-9 text-xs font-bold uppercase tracking-[0.16em] text-[#430517] shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                        >
                            Customize Your Package

                            <span className="ml-3 text-lg transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                    </div>

                </div>

            </section>

            {/* =====================================================
                INTRO
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-24 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-4xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                        Our Packages
                    </p>

                    <h2
                        className={`${playfair.className} mt-5 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl lg:text-[4rem]`}
                    >
                        A Starting Point.
                        <br />

                        <span className="text-[#A87918]">
                            Not A Limitation.
                        </span>
                    </h2>

                    <div className="mx-auto mt-7 flex items-center justify-center gap-3">

                        <span className="h-px w-14 bg-[#C9A227]" />

                        <span className="text-sm text-[#C9A227]">
                            ✦
                        </span>

                        <span className="h-px w-14 bg-[#C9A227]" />

                    </div>

                    <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[#665B5B] sm:text-lg sm:leading-9">
                        Every celebration has different requirements. Our
                        packages give you a clear starting point while keeping
                        room for personalization, upgrades and custom event
                        requirements.
                    </p>

                </div>

            </section>

            {/* =====================================================
                PACKAGE CARDS
            ====================================================== */}

            <section className="bg-white px-6 pb-28 sm:px-10 lg:px-16">

                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">

                    {packages.map((pkg) => (

                        <article
                            key={pkg.name}
                            className={`relative overflow-hidden rounded-[28px] border bg-[#FBF7F0] transition duration-300 hover:-translate-y-2 ${pkg.featured
                                ? "border-[#C9A227] shadow-[0_20px_60px_rgba(74,6,24,0.15)]"
                                : "border-[#E7DDD4] shadow-sm"
                                }`}
                        >

                            {/* Featured label */}

                            {pkg.featured && (
                                <div className="absolute left-6 top-6 z-10 rounded-full bg-[#D6A928] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A0618]">
                                    Popular Choice
                                </div>
                            )}

                            {/* Image */}

                            <div className="relative h-[280px] overflow-hidden">

                                <div
                                    className="absolute inset-0 bg-cover bg-center transition duration-700 hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${pkg.image}')`,
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/80 via-transparent to-transparent" />

                                <div className="absolute bottom-6 left-6">

                                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D9B84C]">
                                        Package {pkg.number}
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-2 text-4xl font-semibold text-white`}
                                    >
                                        {pkg.name}
                                    </h3>

                                </div>

                            </div>

                            {/* Content */}

                            <div className="p-7 sm:p-8">

                                <p
                                    className={`${playfair.className} text-xl italic text-[#A87918]`}
                                >
                                    {pkg.subtitle}
                                </p>

                                <p className="mt-5 text-sm leading-7 text-[#665B5B]">
                                    {pkg.description}
                                </p>

                                {/* Starting Price */}

                                {pkg.startingPrice !== null &&
                                    pkg.startingPrice !== undefined && (
                                        <div className="mt-5">

                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A87918]">
                                                Starting From
                                            </p>

                                            <p className="mt-1 text-xl font-semibold text-[#5A1020]">
                                                ₹
                                                {Number(
                                                    pkg.startingPrice
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </p>

                                        </div>
                                    )}

                                {/* Ideal for */}

                                <div className="mt-6 border-y border-[#E5DAD0] py-5">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A87918]">
                                        Ideal For
                                    </p>

                                    <p className="mt-2 text-sm font-medium leading-6 text-[#4A4141]">
                                        {pkg.idealFor}
                                    </p>

                                </div>

                                {/* Features */}

                                <div className="mt-6 space-y-3">

                                    {pkg.features.map((feature) => (

                                        <div
                                            key={feature}
                                            className="flex items-center gap-3"
                                        >

                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#C9A227]/50 text-[10px] text-[#A87918]">
                                                ✓
                                            </span>

                                            <span className="text-sm text-[#4A4141]">
                                                {feature}
                                            </span>

                                        </div>

                                    ))}

                                </div>

                                <Link
                                    href="/get-a-quote"
                                    className={`mt-8 flex w-full items-center justify-center rounded-xl py-4 text-xs font-bold uppercase tracking-[0.16em] transition duration-300 ${pkg.featured
                                        ? "bg-[#5A1020] text-white hover:bg-[#430515]"
                                        : "border border-[#5A1020] text-[#5A1020] hover:bg-[#5A1020] hover:text-white"
                                        }`}
                                >
                                    Get A Quote

                                    <span className="ml-3">
                                        →
                                    </span>

                                </Link>

                            </div>

                        </article>

                    ))}

                </div>

            </section>

            {/* =====================================================
                WHAT'S INCLUDED
            ====================================================== */}

            <section className="bg-[#4A0618] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-6xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            The SS UTSAV Difference
                        </p>

                        <h2
                            className={`${playfair.className} mt-5 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4rem]`}
                        >
                            More Than
                            <br />
                            A Package.
                        </h2>

                        <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">
                            Whichever package you choose, our approach stays
                            focused on making your event organized, beautiful
                            and memorable.
                        </p>

                    </div>
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        {included.map((item) => {

                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-[#D9B84C]/20 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D9B84C]/50"
                                >

                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9B84C]/50 text-[#D9B84C]">
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>

                                    <h3
                                        className={`${playfair.className} mt-6 text-2xl font-semibold text-white`}
                                    >
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-white/60">
                                        {item.text}
                                    </p>

                                </div>
                            );
                        })}

                    </div>

                </div>

            </section>

            {/* =====================================================
                CUSTOM PACKAGE
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-[0_20px_60px_rgba(74,6,24,0.08)] lg:grid-cols-2">

                    {/* Image */}

                    <div className="relative min-h-[430px]">

                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=90')",
                            }}
                        />

                        <div className="absolute inset-0 bg-[#35030F]/45" />

                        <div className="absolute bottom-8 left-8">

                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                                Your Event
                            </p>

                            <h3
                                className={`${playfair.className} mt-2 text-4xl font-semibold text-white sm:text-5xl`}
                            >
                                Your Rules.
                                <br />
                                Your Vision.
                            </h3>

                        </div>

                    </div>

                    {/* Content */}

                    <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">

                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A87918]">
                            Need Something Different?
                        </p>

                        <h2
                            className={`${playfair.className} mt-4 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl`}
                        >
                            Let's Build
                            <br />
                            Your Own Package.
                        </h2>

                        <p className="mt-6 text-base leading-8 text-[#665B5B]">
                            Maybe you only need décor. Maybe you need complete
                            event management. Or perhaps your celebration needs
                            something completely unique.
                        </p>

                        <p className="mt-4 text-base leading-8 text-[#665B5B]">
                            Tell us what you have in mind and we'll discuss the
                            right combination of services for your event.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="group mt-8 inline-flex w-fit items-center rounded-xl bg-[#5A1020] px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#430515]"
                        >
                            Create My Package

                            <span className="ml-3 text-base text-[#D9B84C] transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>

                    </div>

                </div>

            </section>

            {/* =====================================================
                FINAL CTA
            ====================================================== */}

            <section className="bg-[#5A1020] px-6 py-28 sm:px-10 lg:px-16">

                <div className="relative mx-auto max-w-5xl text-center">

                    <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D9B84C]/10" />

                    <div className="relative">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Let's Plan Your Celebration
                        </p>

                        <h2
                            className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.5rem]`}
                        >
                            Your Celebration.
                            <br />
                            Your Way.
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
                            Share your event details with us and we'll help
                            you find the right services and package for your
                            occasion.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="mt-9 inline-flex items-center rounded-xl bg-[#D6A928] px-9 py-4 text-xs font-bold uppercase tracking-[0.17em] text-[#4A0618] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                        >
                            Get A Quote

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