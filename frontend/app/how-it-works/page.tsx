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

const steps = [
    {
        number: "01",
        title: "Tell Us Your Vision",
        subtitle: "Start with your idea",
        description:
            "Tell us about your occasion, your expectations, guest count, preferred date and the kind of experience you want to create.",
        image:
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=90",
    },
    {
        number: "02",
        title: "Plan Your Event",
        subtitle: "Build the experience",
        description:
            "We discuss your requirements and create an event plan covering services, décor, vendors, timelines and coordination.",
        image:
            "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=90",
    },
    {
        number: "03",
        title: "We Coordinate",
        subtitle: "Bring every detail together",
        description:
            "Our team coordinates the important moving parts of your event so you don't have to manage everything yourself.",
        image:
            "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1400&q=90",
    },
    {
        number: "04",
        title: "Event Day",
        subtitle: "Everything comes together",
        description:
            "From setup to coordination, we stay focused on the event-day details so you can spend your time enjoying the occasion.",
        image:
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=90",
    },
    {
        number: "05",
        title: "You Celebrate",
        subtitle: "Enjoy your moment",
        description:
            "Your only job is to celebrate, connect with your guests and create memories while we take care of the details around you.",
        image:
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=90",
    },
];

const responsibilities = [
    {
        number: "01",
        title: "Planning",
        text: "Understanding your requirements and organizing the event journey.",
    },
    {
        number: "02",
        title: "Vendor Coordination",
        text: "Coordinating the different services required for your celebration.",
    },
    {
        number: "03",
        title: "Décor & Styling",
        text: "Helping shape the visual atmosphere around your event.",
    },
    {
        number: "04",
        title: "Timeline Management",
        text: "Keeping important activities and event-day requirements organized.",
    },
    {
        number: "05",
        title: "Event-Day Support",
        text: "Being present to coordinate details while you enjoy your celebration.",
    },
    {
        number: "06",
        title: "Execution",
        text: "Bringing the planned experience together on the day of the event.",
    },
];

export default function HowItWorksPage() {
    return (
        <main className={`${montserrat.className} overflow-hidden bg-[#FBF7F0]`}>

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

                <div className="absolute inset-0 bg-gradient-to-r from-[#30030D]/95 via-[#4A0618]/75 to-[#4A0618]/30" />

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
                            From First Idea
                            <br />
                            <span className="text-[#D9B84C]">
                                To Final Celebration.
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
                            A simple, organized approach to event planning that
                            keeps you involved in the decisions that matter while
                            we coordinate the details behind the scenes.
                        </p>

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

                <div className="mx-auto max-w-4xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                        How It Works
                    </p>

                    <h2
                        className={`${playfair.className} mt-5 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl lg:text-[4rem]`}
                    >
                        Simple For You.
                        <br />
                        <span className="text-[#A87918]">
                            Detailed Behind The Scenes.
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
                        Planning an event can involve many decisions, people
                        and moving parts. Our process is designed to make the
                        experience clearer from the first conversation through
                        event day.
                    </p>

                </div>

            </section>


            {/* =====================================================
          PROCESS STEPS
      ====================================================== */}

            <section className="bg-white px-6 py-20 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-7xl space-y-16">

                    {steps.map((step, index) => (

                        <article
                            key={step.number}
                            className={`grid overflow-hidden rounded-[30px] border border-[#E7DDD4] bg-[#FBF7F0] shadow-sm lg:grid-cols-2 ${index % 2 !== 0
                                ? "lg:[&>div:first-child]:order-2"
                                : ""
                                }`}
                        >

                            {/* Image */}

                            <div className="relative min-h-[390px] overflow-hidden">

                                <div
                                    className="absolute inset-0 bg-cover bg-center transition duration-700 hover:scale-105"
                                    style={{
                                        backgroundImage: `url('${step.image}')`,
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/75 via-transparent to-transparent" />

                                <div className="absolute left-7 top-7 flex h-16 w-16 items-center justify-center rounded-full border border-[#D9B84C]/70 bg-[#4A0618]/85 text-lg font-semibold text-[#D9B84C] backdrop-blur-sm">
                                    {step.number}
                                </div>

                            </div>


                            {/* Content */}

                            <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">

                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A87918]">
                                    Step {step.number}
                                </p>

                                <h2
                                    className={`${playfair.className} mt-4 text-4xl font-semibold leading-tight text-[#5A1020] sm:text-5xl`}
                                >
                                    {step.title}
                                </h2>

                                <p
                                    className={`${playfair.className} mt-3 text-xl italic text-[#A87918] sm:text-2xl`}
                                >
                                    {step.subtitle}
                                </p>

                                <p className="mt-6 text-base leading-8 text-[#665B5B] sm:text-lg sm:leading-9">
                                    {step.description}
                                </p>

                                <div className="mt-8 flex items-center gap-3">

                                    <span className="h-px w-14 bg-[#C9A227]" />

                                    <span className="text-xs text-[#C9A227]">
                                        ✦
                                    </span>

                                    <span className="h-px w-14 bg-[#C9A227]" />

                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            </section>


            {/* =====================================================
          CUSTOMER JOURNEY
      ====================================================== */}

            <section className="bg-[#4A0618] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-6xl">

                    <div className="mx-auto max-w-3xl text-center">

                        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                            Your Journey
                        </p>

                        <h2
                            className={`${playfair.className} mt-5 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4rem]`}
                        >
                            You Decide.
                            <br />
                            <span className="text-[#D9B84C]">
                                We Coordinate.
                            </span>
                        </h2>

                        <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
                            You remain part of the important decisions. Our role
                            is to organize the details and help turn those decisions
                            into a coordinated event.
                        </p>

                    </div>


                    {/* Journey line */}

                    <div className="relative mt-20">

                        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#D9B84C]/20 md:block" />

                        {[
                            {
                                side: "left",
                                title: "Your Vision",
                                text: "You share your occasion, preferences and expectations.",
                            },
                            {
                                side: "right",
                                title: "Our Planning",
                                text: "We organize the requirements and build the event plan.",
                            },
                            {
                                side: "left",
                                title: "Our Coordination",
                                text: "We bring together vendors, styling, logistics and timelines.",
                            },
                            {
                                side: "right",
                                title: "Your Celebration",
                                text: "You enjoy the occasion while we stay focused on execution.",
                            },
                        ].map((item, index) => (

                            <div
                                key={item.title}
                                className={`relative mb-12 flex items-center md:mb-16 ${item.side === "right"
                                    ? "md:justify-end"
                                    : "md:justify-start"
                                    }`}
                            >

                                <div
                                    className={`w-full rounded-2xl border border-[#D9B84C]/20 bg-white/[0.04] p-7 md:w-[44%] ${item.side === "right"
                                        ? "md:text-left"
                                        : "md:text-right"
                                        }`}
                                >

                                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D9B84C]">
                                        {String(index + 1).padStart(2, "0")}
                                    </p>

                                    <h3
                                        className={`${playfair.className} mt-3 text-3xl font-semibold text-white`}
                                    >
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-white/60">
                                        {item.text}
                                    </p>

                                </div>

                                <div className="absolute left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full border-4 border-[#4A0618] bg-[#D9B84C] md:block" />

                            </div>

                        ))}

                    </div>

                </div>

            </section>


            {/* =====================================================
          WHAT WE HANDLE
      ====================================================== */}

            <section className="bg-[#FBF7F0] px-6 py-28 sm:px-10 lg:px-16">

                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

                        {/* Heading */}

                        <div>

                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
                                Behind The Scenes
                            </p>

                            <h2
                                className={`${playfair.className} mt-5 text-5xl font-semibold leading-tight text-[#5A1020] sm:text-6xl`}
                            >
                                We Handle
                                <br />
                                The Details.
                            </h2>

                            <p className="mt-6 max-w-xl text-base leading-8 text-[#665B5B] sm:text-lg sm:leading-9">
                                A successful event involves more than what guests
                                see. Our team focuses on organizing the details
                                that help the celebration run smoothly.
                            </p>

                            <Link
                                href="/services"
                                className="group mt-8 inline-flex items-center text-xs font-bold uppercase tracking-[0.17em] text-[#5A1020]"
                            >
                                Explore Our Services

                                <span className="ml-3 text-base text-[#C9A227] transition-transform duration-300 group-hover:translate-x-1">
                                    →
                                </span>
                            </Link>

                        </div>


                        {/* Responsibilities */}

                        <div className="grid gap-4 sm:grid-cols-2">

                            {responsibilities.map((item) => (

                                <div
                                    key={item.number}
                                    className="rounded-2xl border border-[#E2D7CE] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C9A227]"
                                >

                                    <div className="flex items-center justify-between">

                                        <span className="text-xs font-bold tracking-[0.2em] text-[#A87918]">
                                            {item.number}
                                        </span>

                                        <span className="text-sm text-[#C9A227]">
                                            ✦
                                        </span>

                                    </div>

                                    <h3
                                        className={`${playfair.className} mt-5 text-2xl font-semibold text-[#5A1020]`}
                                    >
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#665B5B]">
                                        {item.text}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
          FINAL CTA
      ====================================================== */}

            <section className="relative overflow-hidden bg-[#5A1020] px-6 py-28 sm:px-10 lg:px-16">

                <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full border border-[#D9B84C]/15" />

                <div className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full border border-[#D9B84C]/15" />

                <div className="relative mx-auto max-w-5xl text-center">

                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
                        Your Event Starts Here
                    </p>

                    <h2
                        className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.5rem]`}
                    >
                        Ready To Plan
                        <br />
                        Your Celebration?
                    </h2>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
                        Share your event idea with us and let's take the
                        first step toward creating a celebration you'll remember.
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

            </section>

        </main>
    );
}