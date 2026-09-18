"use client";

import { useEffect, useState } from "react";
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

interface PublicSettings {
  company_name: string;
  tagline: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp_number: string | null;
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_x_url: string | null;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export default function Home() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/settings/public`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await response.json();

        setSettings(data);
      } catch (error) {
        console.error("Home settings error:", error);
      }
    };

    fetchSettings();
  }, []);

  const companyName = settings?.company_name || "SS UTSAV";

  const tagline = settings?.tagline || "We Plan. You Celebrate.";

  const description =
    settings?.description ||
    "From intimate celebrations to grand occasions, SS UTSAV brings thoughtful planning, trusted vendors and seamless coordination together to create moments worth remembering.";

  return (
    <main className={`${montserrat.className} overflow-hidden`}>

      {/* =====================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#39030F]">

        {/* Background Image */}

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=90')",
          }}
        />

        {/* Main overlay */}

        <div className="absolute inset-0 bg-[#3A0410]/40" />

        {/* Left gradient for text readability */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#30030D]/95 via-[#4A0618]/70 to-[#4A0618]/15" />

        {/* Bottom gradient */}

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#30030D]/90 to-transparent" />

        {/* Gold glow */}

        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[100px]" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[120px]" />

        {/* Decorative border */}

        <div className="absolute inset-5 hidden rounded-[30px] border border-[#D9B84C]/15 lg:block" />

        {/* =================================================
            HERO CONTENT
        ================================================== */}

        <div className="relative mx-auto flex min-h-[calc(100vh-82px)] max-w-[1500px] items-center px-6 py-20 sm:px-10 lg:px-16 xl:px-24">

          <div className="grid w-full items-center lg:grid-cols-[1.08fr_0.92fr]">

            {/* =================================================
                LEFT CONTENT
            ================================================== */}

            <div className="relative z-10 max-w-[800px]">

              {/* Brand label */}

              <div className="flex items-center gap-4">

                <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#D9B84C] sm:text-sm">
                  {companyName}
                </span>

                <span className="h-px w-14 bg-[#D9B84C] sm:w-20" />

              </div>

              {/* Main heading */}

              <h1
                className={`${playfair.className} mt-8 max-w-[800px] text-[4.6rem] font-semibold leading-[0.94] tracking-[-0.045em] text-white sm:text-[5.5rem] md:text-[6.2rem] lg:text-[6.7rem] xl:text-[7.4rem]`}
              >
                {tagline.includes(".") ? (
                  <>
                    {tagline.split(".")[0]}.

                    <br />

                    <span className="text-[#D9B84C]">
                      {tagline.split(".").slice(1).join(".").trim()}
                    </span>
                  </>
                ) : (
                  tagline
                )}
              </h1>

              {/* Gold separator */}

              <div className="mt-9 flex items-center gap-3">

                <span className="h-[2px] w-16 bg-[#D6A928] sm:w-20" />

                <span className="text-sm text-[#D6A928]">
                  ✦
                </span>

                <span className="h-[2px] w-16 bg-[#D6A928] sm:w-20" />

              </div>

              {/* Description */}

              <p className="mt-8 max-w-[700px] text-base leading-7 text-white/80 sm:text-lg sm:leading-8 lg:text-[19px] lg:leading-9">
                {description}
              </p>

              {/* CTA Buttons */}

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                <Link
                  href="/get-a-quote"
                  className="group inline-flex min-h-[58px] items-center justify-center rounded-xl bg-[#D6A928] px-9 text-xs font-bold uppercase tracking-[0.16em] text-[#430517] shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#E8CA70]"
                >
                  Begin Planning

                  <span className="ml-3 text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </Link>

                <Link
                  href="/services"
                  className="group inline-flex min-h-[58px] items-center justify-center rounded-xl border border-white/40 bg-white/[0.06] px-9 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#D9B84C] hover:text-[#D9B84C]"
                >
                  Explore Services

                  <span className="ml-3 text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </Link>

              </div>

              {/* =================================================
                  TRUST POINTS
              ================================================== */}

              <div className="mt-14 max-w-[700px] border-t border-white/20 pt-8">

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

                  {/* Thoughtful */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D9B84C]/60 text-base text-[#D9B84C]">
                      ✦
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Thoughtful
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
                        Planning
                      </p>

                    </div>

                  </div>

                  {/* Trusted */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D9B84C]/60 text-base text-[#D9B84C]">
                      ♕
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Trusted
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
                        Vendors
                      </p>

                    </div>

                  </div>

                  {/* Seamless */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D9B84C]/60 text-base text-[#D9B84C]">
                      ◇
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Seamless
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/50">
                        Execution
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT VISUAL
            ================================================== */}

            <div className="relative hidden h-[650px] lg:block">

              {/* Main image */}

              <div className="absolute right-0 top-1/2 h-[590px] w-[480px] -translate-y-1/2 overflow-hidden rounded-[260px_260px_35px_35px] border border-[#D9B84C]/40 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">

                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=90')",
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/60 via-transparent to-[#35030F]/10" />

              </div>

              {/* Outer gold frame */}

              <div className="absolute right-[-18px] top-1/2 h-[620px] w-[510px] -translate-y-1/2 rounded-[280px_280px_40px_40px] border border-[#D9B84C]/20" />

              {/* Floating card */}

              <div className="absolute bottom-[75px] left-0 rounded-2xl border border-[#D9B84C]/30 bg-[#4A0618]/90 px-7 py-6 shadow-2xl backdrop-blur-md">

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D9B84C]">
                  Your Celebration
                </p>

                <p
                  className={`${playfair.className} mt-2 text-2xl italic text-white`}
                >
                  Starts With A Vision
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          INTRODUCTION SECTION
      ====================================================== */}

      <section className="bg-[#FBF7F0] px-6 py-28 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-6xl">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* Text */}

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-12 bg-[#C9A227]" />

                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8A6A1F]">
                  The {companyName} Experience
                </p>

              </div>

              <h2
                className={`${playfair.className} mt-6 text-5xl font-semibold leading-[1.05] text-[#5A1020] sm:text-6xl lg:text-[4.4rem]`}
              >
                More Than An Event.

                <br />

                <span className="text-[#A87918]">
                  A Moment To Remember.
                </span>
              </h2>

              <p className="mt-8 max-w-xl text-base leading-8 text-[#5A5050] sm:text-lg sm:leading-9">
                Every celebration has its own story. We bring the
                right people, details and ideas together to turn
                that story into an experience your guests will
                remember.
              </p>

              <p className="mt-5 max-w-xl text-base leading-8 text-[#5A5050] sm:text-lg sm:leading-9">
                From the first conversation to the final moment,
                our team handles the planning, coordination and
                execution so you can be present for what matters.
              </p>

              <Link
                href="/about"
                className="group mt-9 inline-flex items-center text-sm font-bold uppercase tracking-[0.15em] text-[#5A1020]"
              >
                Discover Our Story

                <span className="ml-3 text-base text-[#C9A227] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>

              </Link>

            </div>

            {/* Image */}

            <div className="relative">

              <div className="relative h-[460px] overflow-hidden rounded-[30px] shadow-xl">

                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=90')",
                  }}
                />

              </div>

              {/* Gold decoration */}

              <div className="absolute -bottom-6 -left-6 h-36 w-36 rounded-2xl border border-[#C9A227]/50" />

              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border border-[#C9A227]/50" />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SERVICES SECTION
      ====================================================== */}

      <section className="bg-white px-6 py-28 sm:px-10 lg:px-16">

        <div className="mx-auto max-w-7xl">

          {/* Heading */}

          <div className="mx-auto max-w-4xl text-center">

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#A87918]">
              What We Do
            </p>

            <h2
              className={`${playfair.className} mt-5 text-5xl font-semibold leading-tight text-[#5A1020] sm:text-6xl lg:text-[4.2rem]`}
            >
              Everything Your Celebration Needs
            </h2>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3">

              <span className="h-px w-14 bg-[#C9A227]" />

              <span className="text-sm text-[#C9A227]">
                ✦
              </span>

              <span className="h-px w-14 bg-[#C9A227]" />

            </div>

            <p className="mt-7 text-base leading-8 text-[#665B5B] sm:text-lg">
              From elegant décor to complete event coordination,
              we bring every important detail together under one
              trusted team.
            </p>

          </div>

          {/* Service Cards */}

          <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

            {[
              {
                title: "Weddings",
                description:
                  "Beautifully planned weddings, engagements, receptions and traditional celebrations.",
                image:
                  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85",
              },
              {
                title: "Private Celebrations",
                description:
                  "Birthdays, baby showers, anniversaries, housewarmings and special family occasions.",
                image:
                  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=85",
              },
              {
                title: "Corporate Events",
                description:
                  "Professional conferences, team events, annual celebrations, launches and gatherings.",
                image:
                  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=85",
              },
              {
                title: "College Events",
                description:
                  "Fests, cultural programs, freshers, farewells and energetic youth experiences.",
                image:
                  "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=85",
              },
              {
                title: "Décor & Styling",
                description:
                  "From elegant floral styling to themed stages and immersive celebration spaces.",
                image:
                  "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1000&q=85",
              },
              {
                title: "Complete Management",
                description:
                  "One team managing planning, vendors, logistics, coordination and event-day execution.",
                image:
                  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85",
              },
            ].map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="group overflow-hidden rounded-2xl border border-[#E8DED5] bg-[#FBF7F0] shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl"
              >

                {/* Image */}

                <div className="relative h-60 overflow-hidden">

                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url('${service.image}')`,
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#35030F]/80 via-[#35030F]/10 to-transparent" />

                  <div className="absolute bottom-6 left-6">

                    <h3
                      className={`${playfair.className} text-[1.75rem] font-semibold text-white`}
                    >
                      {service.title}
                    </h3>

                  </div>

                </div>

                {/* Content */}

                <div className="p-7">

                  <p className="text-base leading-7 text-[#665B5B]">
                    {service.description}
                  </p>

                  <span className="mt-6 inline-flex text-xs font-bold uppercase tracking-[0.15em] text-[#5A1020]">
                    Explore

                    <span className="ml-2 text-base text-[#C9A227]">
                      →
                    </span>

                  </span>

                </div>

              </Link>
            ))}

          </div>

          {/* View All */}

          <div className="mt-14 text-center">

            <Link
              href="/services"
              className="inline-flex items-center rounded-xl bg-[#5A1020] px-9 py-4 text-xs font-bold uppercase tracking-[0.17em] text-white transition duration-300 hover:bg-[#74182B]"
            >
              View All Services

              <span className="ml-3 text-sm text-[#D9B84C]">
                →
              </span>

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="relative overflow-hidden bg-[#4A0618] px-6 py-28 sm:px-10 lg:px-16">

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#D6A928]/10 blur-[110px]" />

        <div className="relative mx-auto max-w-6xl">

          {/* Heading */}

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D9B84C]">
              Simple & Seamless
            </p>

            <h2
              className={`${playfair.className} mt-5 text-5xl font-semibold text-white sm:text-6xl lg:text-[4.2rem]`}
            >
              How We Bring It Together
            </h2>

          </div>

          {/* Steps */}

          <div className="mt-18 grid gap-12 md:grid-cols-4">

            {[
              {
                number: "01",
                title: "Tell Us",
                text: "Share your event vision, date, location and requirements.",
              },
              {
                number: "02",
                title: "We Plan",
                text: "We build the right plan, services and vendor combination.",
              },
              {
                number: "03",
                title: "We Coordinate",
                text: "Our team manages vendors, timelines, logistics and details.",
              },
              {
                number: "04",
                title: "You Celebrate",
                text: "Enjoy your event while we take care of the execution.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="relative text-center"
              >

                <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border border-[#D9B84C]/50 text-xl font-semibold text-[#D9B84C]">
                  {step.number}
                </div>

                <h3
                  className={`${playfair.className} mt-6 text-3xl font-semibold text-white`}
                >
                  {step.title}
                </h3>

                <p className="mx-auto mt-4 max-w-[250px] text-base leading-7 text-white/60">
                  {step.text}
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
              Your Celebration Starts Here
            </p>

            <h2
              className={`${playfair.className} mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-[4.2rem]`}
            >
              Have An Event In Mind?
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg sm:leading-9">
              Tell us what you're planning and let our team help
              you turn your vision into a celebration worth
              remembering.
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