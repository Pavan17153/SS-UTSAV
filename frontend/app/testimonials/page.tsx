"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Quote, Star } from "lucide-react";
import { publicApi, API_BASE_URL } from "@/lib/api";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

type Testimonial = {
    id: number;
    customer_name: string;
    event_type: string | null;
    review: string;
    image_url: string | null;
    rating: number;
    is_active: boolean;
    created_at: string;
};

const fallbackTestimonials: Testimonial[] = [
    {
        id: 1,
        customer_name: "Happy Client",
        event_type: "Wedding Celebration",
        review:
            "SS UTSAV made our celebration feel effortless. From planning and coordination to the smallest details, everything was handled with care.",
        image_url: null,
        rating: 5,
        is_active: true,
        created_at: "",
    },
    {
        id: 2,
        customer_name: "Happy Family",
        event_type: "Birthday Celebration",
        review:
            "The team understood exactly what we wanted and turned our idea into a beautiful celebration.",
        image_url: null,
        rating: 5,
        is_active: true,
        created_at: "",
    },
    {
        id: 3,
        customer_name: "Corporate Client",
        event_type: "Corporate Event",
        review:
            "The coordination was smooth and professional. SS UTSAV managed the details while keeping everything aligned with our requirements.",
        image_url: null,
        rating: 5,
        is_active: true,
        created_at: "",
    },
];

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data =
                    await publicApi.get<Testimonial[]>(
                        "/api/testimonials/public"
                    );

                if (Array.isArray(data) && data.length > 0) {
                    setTestimonials(data);
                } else {
                    setTestimonials(fallbackTestimonials);
                }
            } catch {
                setTestimonials(fallbackTestimonials);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);
    const getImageUrl = (imageUrl: string | null) => {
        if (!imageUrl) return null;

        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        return `${API_BASE_URL}${imageUrl}`;
    };

    return (
        <main
            className={`${montserrat.className} bg-[#FBF7F0] text-[#39030F]`}
        >
            {/* HERO */}
            <section className="relative min-h-[72vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#39030F]/75" />

                <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-6 py-24 lg:px-12">
                    <div className="max-w-4xl text-white">
                        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Client Stories
                        </p>

                        <h1
                            className={`${playfair.className} text-6xl font-semibold leading-[0.95] md:text-7xl lg:text-[7rem]`}
                        >
                            Moments
                            <br />
                            Worth Remembering.
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                            The best part of what we do is seeing our clients enjoy
                            the moments we helped create. Here are some of the
                            experiences shared by the people we have worked with.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/get-a-quote"
                                className="bg-[#D9B84C] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#39030F] transition hover:bg-white"
                            >
                                Plan Your Event
                            </Link>

                            <Link
                                href="/about"
                                className="border border-white/60 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#D9B84C] hover:text-[#D9B84C]"
                            >
                                About SS UTSAV
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* INTRO */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                            What Our Clients Say
                        </p>

                        <h2
                            className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                        >
                            Celebrations
                            <br />
                            Made Personal.
                        </h2>
                    </div>

                    <div className="space-y-6 text-base leading-8 text-[#39030F]/70 md:text-lg">
                        <p>
                            Every event is different because every client,
                            family, company, and celebration is different.
                        </p>

                        <p>
                            We listen to what matters to you, understand the
                            experience you want to create, and bring the details
                            together around that vision.
                        </p>

                        <p>
                            These testimonials reflect the experiences of clients
                            who trusted SS UTSAV with their important moments.
                        </p>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="bg-[#39030F] text-white">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                            Words From Our Clients
                        </p>

                        <h2
                            className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                        >
                            Experiences That
                            <br />
                            Speak For Themselves.
                        </h2>

                        <p className="mt-6 text-lg leading-8 text-white/70">
                            From intimate family celebrations to larger events,
                            our focus remains the same — thoughtful planning,
                            smooth coordination, and memorable experiences.
                        </p>
                    </div>

                    {/* LOADING */}
                    {loading && (
                        <div className="mt-16 text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D9B84C] border-t-transparent" />

                            <p className="mt-5 text-sm uppercase tracking-[0.2em] text-white/50">
                                Loading client stories...
                            </p>
                        </div>
                    )}

                    {/* TESTIMONIAL CARDS */}
                    {!loading && (
                        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((testimonial) => {
                                const imageUrl = getImageUrl(
                                    testimonial.image_url
                                );

                                return (
                                    <article
                                        key={testimonial.id}
                                        className="group relative flex h-full flex-col border border-white/10 bg-white/[0.05] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#D9B84C]/50"
                                    >
                                        {/* QUOTE ICON */}
                                        <div className="mb-8 flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9B84C]/60">
                                                <Quote
                                                    size={20}
                                                    className="text-[#D9B84C]"
                                                />
                                            </div>

                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={14}
                                                        className={
                                                            star <= testimonial.rating
                                                                ? "fill-[#D9B84C] text-[#D9B84C]"
                                                                : "text-white/25"
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* REVIEW */}
                                        <p className="flex-1 text-base leading-8 text-white/75">
                                            “{testimonial.review}”
                                        </p>

                                        {/* DIVIDER */}
                                        <div className="my-8 h-px w-full bg-white/10" />

                                        {/* CLIENT */}
                                        <div className="flex items-center gap-4">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={
                                                        testimonial.customer_name
                                                    }
                                                    className="h-14 w-14 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D9B84C] text-lg font-semibold text-[#D9B84C]">
                                                    {testimonial.customer_name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <h3
                                                    className={`${playfair.className} text-xl font-semibold`}
                                                >
                                                    {
                                                        testimonial.customer_name
                                                    }
                                                </h3>

                                                {testimonial.event_type && (
                                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#D9B84C]">
                                                        {
                                                            testimonial.event_type
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* OUR PROMISE */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                        <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                            Our Promise
                        </p>

                        <h2
                            className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                        >
                            Your Event.
                            <br />
                            Your Story.
                            <br />
                            Our Care.
                        </h2>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        {[
                            {
                                number: "01",
                                title: "We Listen",
                                text: "Your ideas and expectations come first. We understand what matters before planning the details.",
                            },
                            {
                                number: "02",
                                title: "We Plan",
                                text: "We turn your requirements into a clear event plan built around your celebration.",
                            },
                            {
                                number: "03",
                                title: "We Coordinate",
                                text: "We bring vendors, schedules, styling, and event details together.",
                            },
                            {
                                number: "04",
                                title: "We Care",
                                text: "We stay focused on the experience so you can be present for the moments that matter.",
                            },
                        ].map((item) => (
                            <div
                                key={item.number}
                                className="border border-[#39030F]/10 bg-white p-8 shadow-sm"
                            >
                                <span className="text-sm font-bold tracking-[0.2em] text-[#C9A227]">
                                    {item.number}
                                </span>

                                <h3
                                    className={`${playfair.className} mt-5 text-2xl font-semibold`}
                                >
                                    {item.title}
                                </h3>

                                <p className="mt-4 text-sm leading-7 text-[#39030F]/65">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXPERIENCE SECTION */}
            <section className="bg-[#F1E9DC]">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div
                            className="min-h-[500px] bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=90')",
                            }}
                        />

                        <div>
                            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                                More Than Planning
                            </p>

                            <h2
                                className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                We Want You To
                                <br />
                                Enjoy The Moment.
                            </h2>

                            <p className="mt-8 text-lg leading-8 text-[#39030F]/70">
                                An event should not leave you worrying about
                                vendors, timelines, arrangements, or last-minute
                                details.
                            </p>

                            <p className="mt-6 text-lg leading-8 text-[#39030F]/70">
                                Our role is to take care of the moving parts
                                behind the scenes, giving you the freedom to
                                celebrate with your family, friends, guests,
                                colleagues, and loved ones.
                            </p>

                            <div className="mt-10 h-px w-24 bg-[#C9A227]" />

                            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                                We Plan. You Celebrate.
                            </p>
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
                            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=90')",
                    }}
                />

                <div className="relative mx-auto max-w-5xl px-6 py-24 text-center text-white lg:py-32">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                        Your Celebration Starts Here
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-7xl`}
                    >
                        Have An Event
                        <br />
                        In Mind?
                    </h2>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/75">
                        Tell us what you are planning. We&apos;ll help you turn
                        the idea into a celebration worth remembering.
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