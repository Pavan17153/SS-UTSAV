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

export default function AboutPage() {
    return (
        <main className={`${montserrat.className} bg-[#FBF7F0] text-[#39030F]`}>
            {/* HERO */}
            <section className="relative min-h-[78vh] overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2200&q=90')",
                    }}
                />

                <div className="absolute inset-0 bg-[#39030F]/75" />

                <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-6 py-24 lg:px-12">
                    <div className="max-w-4xl text-white">
                        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-[#D9B84C]">
                            About SS UTSAV
                        </p>

                        <h1
                            className={`${playfair.className} text-6xl font-semibold leading-[0.95] md:text-7xl lg:text-[7rem]`}
                        >
                            We Plan.
                            <br />
                            You Celebrate.
                        </h1>

                        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/85 md:text-xl">
                            SS UTSAV is an event management company built around one simple
                            idea — your celebration should feel effortless, memorable, and
                            completely yours.
                        </p>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                href="/get-a-quote"
                                className="bg-[#D9B84C] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#39030F] transition hover:bg-white"
                            >
                                Plan Your Event
                            </Link>

                            <Link
                                href="/services"
                                className="border border-white/60 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-[#D9B84C] hover:text-[#D9B84C]"
                            >
                                Explore Services
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
                            Our Story
                        </p>

                        <h2
                            className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                        >
                            More Than An Event.
                            <br />
                            A Moment To Remember.
                        </h2>
                    </div>

                    <div className="space-y-6 text-base leading-8 text-[#39030F]/70 md:text-lg">
                        <p>
                            Every event begins with an idea. It could be a dream wedding, a
                            birthday surrounded by family, a corporate gathering, a college
                            celebration, or a simple occasion that deserves to feel special.
                        </p>

                        <p>
                            At SS UTSAV, we take that idea and turn it into a carefully
                            planned experience. From the first conversation to the final
                            guest leaving, we bring together planning, coordination, styling,
                            vendors, and execution under one vision.
                        </p>

                        <p>
                            Our goal is simple: while we handle the details behind the
                            scenes, you get to be present for the moments that matter.
                        </p>
                    </div>
                </div>
            </section>

            {/* IMAGE + PHILOSOPHY */}
            <section className="bg-[#39030F] text-white">
                <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
                    <div
                        className="min-h-[520px] bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=90')",
                        }}
                    />

                    <div className="flex items-center px-8 py-20 md:px-16 lg:px-20">
                        <div>
                            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                                What We Believe
                            </p>

                            <h2
                                className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                Beautiful Events
                                <br />
                                Begin With
                                <br />
                                Thoughtful Planning.
                            </h2>

                            <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">
                                Great events are not created by decoration alone. They come
                                from understanding people, paying attention to details, and
                                making hundreds of small decisions work together seamlessly.
                            </p>

                            <div className="mt-10 h-px w-24 bg-[#D9B84C]" />

                            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-[#D9B84C]">
                                We plan every detail with purpose.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR APPROACH */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                        Our Approach
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                    >
                        Personal. Detailed. Seamless.
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-[#39030F]/65">
                        We believe every celebration should reflect the people behind it.
                        That is why we listen first, plan carefully, and execute with
                        attention to every important detail.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {[
                        {
                            number: "01",
                            title: "Understand",
                            text: "We listen to your ideas, expectations, guest experience, and vision before building the plan.",
                        },
                        {
                            number: "02",
                            title: "Create",
                            text: "We bring the right concepts, vendors, styling, schedules, and details together around your event.",
                        },
                        {
                            number: "03",
                            title: "Execute",
                            text: "We coordinate the moving parts and manage the event-day details so you can enjoy the celebration.",
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

            {/* WHY SS UTSAV */}
            <section className="bg-[#F1E9DC]">
                <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                    <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div>
                            <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                                Why SS UTSAV
                            </p>

                            <h2
                                className={`${playfair.className} text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                Your Celebration.
                                <br />
                                Our Responsibility.
                            </h2>

                            <p className="mt-7 max-w-xl text-lg leading-8 text-[#39030F]/65">
                                We want you to remember the laughter, the people, and the
                                moments — not the stress of coordinating an event.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            {[
                                {
                                    title: "Attention To Detail",
                                    text: "Every timeline, setup, vendor, and experience is considered carefully.",
                                },
                                {
                                    title: "Reliable Coordination",
                                    text: "We bring different event partners and moving parts together around one plan.",
                                },
                                {
                                    title: "Thoughtful Experiences",
                                    text: "We focus on creating celebrations that feel personal rather than generic.",
                                },
                                {
                                    title: "Calm Execution",
                                    text: "Our role is to manage the details so you can stay present during your event.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="bg-white p-8 shadow-sm"
                                >
                                    <div className="mb-5 h-1 w-12 bg-[#D9B84C]" />

                                    <h3
                                        className={`${playfair.className} text-2xl font-semibold`}
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
                </div>
            </section>

            {/* TEAM */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-32">
                <div className="text-center">
                    <p className="mb-5 text-sm font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                        The Team Behind SS UTSAV
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold md:text-6xl`}
                    >
                        Four People. One Vision.
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#39030F]/65">
                        SS UTSAV is built by a team that believes successful events come
                        from collaboration, preparation, creativity, and responsibility.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        "Planning",
                        "Creative",
                        "Operations",
                        "Client Experience",
                    ].map((role, index) => (
                        <div
                            key={role}
                            className="border border-[#39030F]/10 bg-white p-8 text-center"
                        >
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D9B84C] text-xl font-semibold text-[#C9A227]">
                                {String(index + 1).padStart(2, "0")}
                            </div>

                            <h3
                                className={`${playfair.className} mt-6 text-2xl font-semibold`}
                            >
                                {role}
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-[#39030F]/60">
                                Working together to make every celebration thoughtfully
                                planned and smoothly executed.
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
                        Let&apos;s Create Something Beautiful
                    </p>

                    <h2
                        className={`${playfair.className} text-5xl font-semibold leading-tight md:text-7xl`}
                    >
                        Have An Event
                        <br />
                        In Mind?
                    </h2>

                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/75">
                        Tell us what you are planning. We&apos;ll help you turn the idea
                        into a celebration worth remembering.
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