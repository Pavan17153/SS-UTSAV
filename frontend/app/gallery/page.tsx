"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display, Montserrat } from "next/font/google";
import { publicApi, API_BASE_URL } from "@/lib/api";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});


// ============================================================
// TYPES
// ============================================================

type GalleryItem = {
    id: string | number;
    title: string;
    category: string;
    image: string;
    size: "large" | "normal";
};


// ============================================================
// DEFAULT GALLERY
//
// These remain available as fallback images.
// ============================================================

const defaultGallery: GalleryItem[] = [
    {
        id: "default-1",
        title: "Wedding Celebrations",
        category: "Weddings",
        image:
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90",
        size: "large",
    },
    {
        id: "default-2",
        title: "Elegant Reception",
        category: "Weddings",
        image:
            "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=90",
        size: "normal",
    },
    {
        id: "default-3",
        title: "Beautiful Décor",
        category: "Décor",
        image:
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=90",
        size: "normal",
    },
    {
        id: "default-4",
        title: "Birthday Celebration",
        category: "Private Events",
        image:
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=90",
        size: "normal",
    },
    {
        id: "default-5",
        title: "Corporate Gathering",
        category: "Corporate",
        image:
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=90",
        size: "large",
    },
    {
        id: "default-6",
        title: "Grand Event",
        category: "Celebrations",
        image:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=90",
        size: "normal",
    },
    {
        id: "default-7",
        title: "College Celebration",
        category: "Youth Events",
        image:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=90",
        size: "normal",
    },
    {
        id: "default-8",
        title: "Event Styling",
        category: "Décor",
        image:
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=90",
        size: "normal",
    },
];


// ============================================================
// CATEGORIES
// ============================================================

const categories = [
    "All Events",
    "Weddings",
    "Private Events",
    "Corporate",
    "Décor",
    "Youth Events",
];


export default function GalleryPage() {

    // ========================================================
    // STATE
    // ========================================================

    const [gallery, setGallery] = useState<GalleryItem[]>(
        defaultGallery
    );

    const [selectedCategory, setSelectedCategory] =
        useState("All Events");


    // ========================================================
    // LOAD GALLERY FROM BACKEND
    // ========================================================

    useEffect(() => {
        const loadGallery = async () => {
            try {
                const data = await publicApi.get<any[]>(
                    "/api/gallery/public"
                );

                if (!Array.isArray(data) || data.length === 0) {
                    console.log(
                        "No active gallery items found. Using default gallery."
                    );

                    return;
                }

                const backendGallery: GalleryItem[] = data.map(
                    (item: any, index: number) => {
                        let imageUrl = item.image_url;

                        if (
                            imageUrl &&
                            !imageUrl.startsWith("http://") &&
                            !imageUrl.startsWith("https://")
                        ) {
                            imageUrl = `${API_BASE_URL}${imageUrl}`;
                        }

                        return {
                            id: item.id,
                            title: item.title,
                            category: item.category,
                            image: imageUrl,
                            size:
                                index === 0 || index === 4
                                    ? "large"
                                    : "normal",
                        };
                    }
                );

                setGallery(backendGallery);
            } catch (error) {
                console.error(
                    "Gallery loading error:",
                    error
                );

                // Keep default images.
            }
        };

        loadGallery();
    }, []);


    // ========================================================
    // FILTER GALLERY
    // ========================================================

    const filteredGallery =
        selectedCategory === "All Events"
            ? gallery
            : gallery.filter(
                (item) =>
                    item.category === selectedCategory
            );


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
                            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#35030F]/70" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#30030D]/95 via-[#4A0618]/75 to-[#4A0618]/30" />

                <div className="relative mx-auto flex min-h-[550px] max-w-[1500px] items-center px-6 py-24 sm:px-10 lg:px-16 xl:px-24">

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
                            Moments Worth
                            <br />

                            <span className="text-[#D9B84C]">
                                Remembering.
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
                            A glimpse into the celebrations, details and
                            experiences that inspire the way we plan events
                            at SS UTSAV.
                        </p>

                    </div>

                </div>

            </section>


            {/* =====================================================
                INTRO
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-24 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-4xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                        Our Gallery
                    </p>

                    <h2
                        className={`${playfair.className} mt-5 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl lg:text-[4rem]`}
                    >
                        Every Celebration
                        <br />

                        <span className="text-[#A87918]">
                            Tells A Story.
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
                        From elegant décor to energetic celebrations, explore
                        the visual inspiration behind the world of SS UTSAV.
                    </p>

                </div>

            </section>


            {/* =====================================================
                CATEGORY BAR
            ====================================================== */}

            <section className="border-y border-[#E6DCD3] bg-white px-6 py-6 sm:px-10 lg:px-16">

                <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-3">

                    {categories.map((category) => (

                        <button
                            key={category}
                            onClick={() =>
                                setSelectedCategory(category)
                            }
                            className={`rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] transition duration-300 sm:text-xs ${selectedCategory === category
                                ? "bg-[#5A1020] text-white"
                                : "border border-[#DCCFC5] text-[#5A1020] hover:border-[#C9A227] hover:bg-[#FBF7F0]"
                                }`}
                        >
                            {category}
                        </button>

                    ))}

                </div>

            </section>


            {/* =====================================================
                GALLERY GRID
            ====================================================== */}

            <section className="bg-white px-6 py-20 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-7xl">

                    {filteredGallery.length > 0 ? (

                        <div className="grid auto-rows-[280px] gap-5 md:grid-cols-2 lg:grid-cols-3">

                            {filteredGallery.map((item, index) => (

                                <article
                                    key={item.id}
                                    className={`group relative overflow-hidden rounded-[24px] ${item.size === "large"
                                        ? "md:row-span-2 lg:col-span-2"
                                        : ""
                                        }`}
                                >

                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url('${item.image}')`,
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/90 via-[#35030F]/15 to-transparent opacity-80 transition duration-300 group-hover:opacity-95" />


                                    {/* Number */}

                                    <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[#35030F]/30 text-xs text-white backdrop-blur-sm">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>


                                    {/* Content */}

                                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">

                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D9B84C]">
                                            {item.category}
                                        </p>

                                        <h3
                                            className={`${playfair.className} mt-2 text-2xl font-semibold text-white sm:text-3xl`}
                                        >
                                            {item.title}
                                        </h3>

                                        <div className="mt-3 h-px w-0 bg-[#D9B84C] transition-all duration-500 group-hover:w-16" />

                                    </div>

                                </article>

                            ))}

                        </div>

                    ) : (

                        <div className="py-20 text-center">

                            <p className="text-sm uppercase tracking-[0.2em] text-[#A87918]">
                                No Events Found
                            </p>

                            <p className="mt-3 text-[#665B5B]">
                                Gallery images for this category will appear here.
                            </p>

                        </div>

                    )}

                </div>

            </section>


            {/* =====================================================
                VISUAL STATEMENT
            ====================================================== */}

            <section className="bg-[#4A0618] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-6xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                        The SS UTSAV Philosophy
                    </p>

                    <h2
                        className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.5rem]`}
                    >
                        We Don't Just
                        <br />

                        <span className="text-[#D9B84C]">
                            Plan Events.
                        </span>
                    </h2>

                    <div className="mx-auto mt-8 flex items-center justify-center gap-3">

                        <span className="h-px w-16 bg-[#D9B84C]" />

                        <span className="text-[#D9B84C]">
                            ✦
                        </span>

                        <span className="h-px w-16 bg-[#D9B84C]" />

                    </div>

                    <p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-white/65">
                        We create the setting for people to celebrate,
                        connect, laugh, remember and enjoy the moments
                        that matter.
                    </p>

                </div>

            </section>


            {/* =====================================================
                INSPIRATION CARDS
            ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-24 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-7xl">

                    <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">

                        <div>

                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                                Inspiration
                            </p>

                            <h2
                                className={`${playfair.className} mt-4 text-4xl font-semibold text-[#5A1020] sm:text-5xl`}
                            >
                                Details Make
                                <br />
                                The Difference.
                            </h2>

                        </div>

                        <p className="max-w-md text-sm leading-7 text-[#665B5B] sm:text-base">
                            From lighting and florals to stage design and
                            atmosphere, every element contributes to the
                            experience of an event.
                        </p>

                    </div>


                    <div className="grid gap-6 md:grid-cols-3">

                        {[
                            {
                                title: "Atmosphere",
                                text: "Lighting, music and styling come together to create the right mood.",
                                image:
                                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=90",
                            },
                            {
                                title: "Details",
                                text: "Small design elements can transform an ordinary space into something memorable.",
                                image:
                                    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=90",
                            },
                            {
                                title: "Experience",
                                text: "The goal is to create an environment where guests can simply enjoy the occasion.",
                                image:
                                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=90",
                            },
                        ].map((item) => (

                            <article
                                key={item.title}
                                className="group overflow-hidden rounded-[24px] border border-[#E6DCD3] bg-white"
                            >

                                <div className="relative h-[280px] overflow-hidden">

                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `url('${item.image}')`,
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-[#35030F]/20 transition group-hover:bg-[#35030F]/10" />

                                </div>

                                <div className="p-7">

                                    <h3
                                        className={`${playfair.className} text-3xl font-semibold text-[#5A1020]`}
                                    >
                                        {item.title}
                                    </h3>

                                    <p className="mt-4 text-sm leading-7 text-[#665B5B]">
                                        {item.text}
                                    </p>

                                </div>

                            </article>

                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================================
                FINAL CTA
            ====================================================== */}

            <section className="bg-[#5A1020] px-6 py-28 sm:px-10 lg:px-16">

                <div className="relative mx-auto max-w-5xl text-center">

                    <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D9B84C]/10" />

                    <div className="relative">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Your Story Could Be Next
                        </p>

                        <h2
                            className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.5rem]`}
                        >
                            Let's Create
                            <br />
                            Something Beautiful.
                        </h2>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
                            Have a celebration coming up? Tell us your idea
                            and let's start planning something memorable together.
                        </p>

                        <Link
                            href="/get-a-quote"
                            className="mt-9 inline-flex items-center rounded-xl bg-[#D6A928] px-9 py-4 text-xs font-bold uppercase tracking-[0.17em] text-[#4A0618] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                        >
                            Plan Your Event

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