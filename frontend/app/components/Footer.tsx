"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { publicApi } from "@/lib/api";
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    ArrowRight,
} from "lucide-react";

import {
    FaInstagram,
    FaWhatsapp,
    FaYoutube,
    FaXTwitter,
} from "react-icons/fa6";
type PublicSettings = {
    company_name: string;
    tagline: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    whatsapp_number: string | null;
    website_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
    twitter_x_url: string | null;
    description: string | null;
    logo_url: string | null;
};

export default function Footer() {
    const footerRef = useRef<HTMLElement | null>(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [settings, setSettings] =
        useState<PublicSettings | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await publicApi.get<PublicSettings>(
                    "/api/settings/public"
                );

                setSettings(data);
            } catch (error) {
                console.error(
                    "Footer settings error:",
                    error
                );
            }
        };

        loadSettings();
    }, []);
    useEffect(() => {
        const footer = footerRef.current;

        if (!footer) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            {
                threshold: 0.05,
            }
        );

        observer.observe(footer);

        return () => {
            observer.disconnect();
        };
    }, []);
    // =========================================================
    // DYNAMIC SETTINGS
    // =========================================================

    const companyName =
        settings?.company_name || "SS UTSAV";

    const tagline =
        settings?.tagline ||
        "We Plan. You Celebrate.";

    const description =
        settings?.description ||
        "SS UTSAV brings together thoughtful planning, trusted vendors and professional coordination to create celebrations worth remembering.";

    const address =
        settings?.address ||
        "Bengaluru, Karnataka";

    const phone =
        settings?.phone ||
        "+91 XXXXX XXXXX";

    const email =
        settings?.email ||
        "hello@ssutsav.com";

    const websiteUrl =
        settings?.website_url || "#";

    const instagramUrl =
        settings?.instagram_url || "#";
    const youtubeUrl =
        settings?.youtube_url ||
        "https://www.youtube.com/@SSUTSAV";
    const twitterXUrl =
        settings?.twitter_x_url || "#";

    const whatsappNumber =
        settings?.whatsapp_number || "";

    // =========================================================
    // PHONE LINK
    // =========================================================

    const phoneHref = phone
        ? `tel:${phone.replace(/[^\d+]/g, "")}`
        : "#";

    // =========================================================
    // WHATSAPP LINK
    // =========================================================

    const whatsappHref = whatsappNumber
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
        : "#";

    // =========================================================
    // EXTERNAL LINK HELPER
    // =========================================================

    const externalLinkProps = (url: string) => ({
        target: url !== "#" ? "_blank" : undefined,
        rel:
            url !== "#"
                ? "noopener noreferrer"
                : undefined,
    });

    return (
        <footer
            ref={footerRef}
            className="bg-[#4A0618] text-white"
        >

            {/* =====================================================
                MAIN FOOTER
            ====================================================== */}

            <div
                className="
                    mx-auto
                    max-w-[1500px]
                    px-6
                    py-14
                    sm:px-8
                    sm:py-16
                    lg:px-12
                    lg:py-18
                "
            >

                <div
                    className="
                        grid
                        gap-x-10
                        gap-y-12
                        md:grid-cols-2
                        lg:grid-cols-[1.6fr_1fr_1fr_1.15fr]
                        lg:gap-x-12
                        xl:gap-x-16
                    "
                >

                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <div className="min-w-0">

                        {/* Logo */}

                        <Link
                            href="/"
                            className="
                                group
                                inline-flex
                                items-center
                            "
                        >

                            <div
                                className="
                                    relative
                                    flex
                                    h-[92px]
                                    w-[92px]
                                    shrink-0
                                    items-center
                                    justify-center
                                    overflow-hidden
                                    rounded-full
                                    border
                                    border-[#D9B84C]/70
                                    bg-white
                                    p-1
                                    shadow-[0_6px_22px_rgba(0,0,0,0.25)]
                                    transition-all
                                    duration-300
                                    group-hover:border-[#E8CA70]
                                    group-hover:shadow-[0_8px_28px_rgba(214,169,40,0.20)]
                                    sm:h-[100px]
                                    sm:w-[100px]
                                "
                            >
                                <Image
                                    src="/logo.png"
                                    alt={`${companyName} logo`}
                                    fill
                                    priority={false}
                                    sizes="100px"
                                    className="
                                        rounded-full
                                        object-cover
                                    "
                                    style={{
                                        objectPosition:
                                            "50% 32%",
                                    }}
                                />
                            </div>

                            <div className="ml-4 sm:ml-5">

                                <div
                                    className="
                                        whitespace-nowrap
                                        font-serif
                                        text-[27px]
                                        font-semibold
                                        tracking-[0.14em]
                                        text-white
                                        transition
                                        duration-300
                                        group-hover:text-[#E0BC55]
                                        sm:text-[30px]
                                    "
                                >
                                    {companyName}
                                </div>

                                {/* Decorative Line */}

                                <div className="mt-1 flex items-center gap-5">

                                    <span className="h-px w-10 bg-[#D6A928] sm:w-15" />

                                    <span className="text-[7px] text-[#D6A928]">
                                        ✦
                                    </span>

                                    <span className="h-px w-10 bg-[#D6A928] sm:w-15" />

                                </div>

                                {/* Tagline */}

                                <p
                                    className="
                                        mt-2
                                        whitespace-nowrap
                                        text-[8px]
                                        font-medium
                                        uppercase
                                        tracking-[0.16em]
                                        text-[#D9B84C]
                                    "
                                >
                                    {tagline}
                                </p>

                            </div>

                        </Link>

                        {/* Description */}

                        <p
                            className="
                                mt-7
                                max-w-[440px]
                                text-sm
                                leading-7
                                text-white/65
                            "
                        >
                            {description}
                        </p>

                        {/* Tagline */}

                        <p
                            className="
                                mt-5
                                font-serif
                                text-xl
                                italic
                                text-[#D9B84C]
                            "
                        >
                            {tagline}
                        </p>

                        {/* =================================================
                            SOCIAL LINKS
                        ================================================== */}

                        <div className="mt-7 flex items-center gap-3">

                            {/* INSTAGRAM */}

                            <a
                                href={instagramUrl}
                                {...externalLinkProps(
                                    instagramUrl
                                )}
                                aria-label="Instagram"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[#D9B84C]/35
                                    text-[#D9B84C]
                                    transition
                                    duration-300
                                    hover:bg-[#D9B84C]
                                    hover:text-[#4A0618]
                                "
                            >
                                <FaInstagram size={18} />
                            </a>

                            {/* WHATSAPP */}

                            <a
                                href={whatsappHref}
                                {...externalLinkProps(
                                    whatsappHref
                                )}
                                aria-label="WhatsApp"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[#D9B84C]/35
                                    text-[#D9B84C]
                                    transition
                                    duration-300
                                    hover:bg-[#D9B84C]
                                    hover:text-[#4A0618]
                                "
                            >
                                <FaWhatsapp size={18} />
                            </a>
                            {/* YOUTUBE */}

                            <a
                                href={youtubeUrl}
                                {...externalLinkProps(youtubeUrl)}
                                aria-label="YouTube"
                                className="
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-full
                                            border
                                            border-[#D9B84C]/35
                                            text-[#D9B84C]
                                            transition
                                            duration-300
                                            hover:bg-[#D9B84C]
                                            hover:text-[#4A0618]
                                        "
                            >
                                <FaYoutube size={18} />
                            </a>
                            {/* X / TWITTER */}

                            <a
                                href={twitterXUrl}
                                {...externalLinkProps(
                                    twitterXUrl
                                )}
                                aria-label="X / Twitter"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[#D9B84C]/35
                                    text-[#D9B84C]
                                    transition
                                    duration-300
                                    hover:bg-[#D9B84C]
                                    hover:text-[#4A0618]
                                "
                            >
                                <FaXTwitter size={17} />
                            </a>

                            {/* WEBSITE */}

                            <a
                                href={websiteUrl}
                                {...externalLinkProps(
                                    websiteUrl
                                )}
                                aria-label="Website"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-[#D9B84C]/35
                                    text-[#D9B84C]
                                    transition
                                    duration-300
                                    hover:bg-[#D9B84C]
                                    hover:text-[#4A0618]
                                "
                            >
                                <Globe
                                    size={18}
                                    strokeWidth={1.7}
                                />
                            </a>

                        </div>

                    </div>


                    {/* =================================================
                        QUICK LINKS
                    ================================================== */}

                    <div>

                        <h3
                            className="
                                font-serif
                                text-xl
                                font-bold
                                text-[#D9B84C]
                            "
                        >
                            Quick Links
                        </h3>

                        <div className="mt-6 space-y-4">

                            <Link
                                href="/"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Home
                            </Link>

                            <Link
                                href="/services"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Services
                            </Link>

                            <Link
                                href="/packages"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Packages
                            </Link>

                            <Link
                                href="/gallery"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Gallery
                            </Link>

                            <Link
                                href="/how-it-works"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                How It Works
                            </Link>

                            <Link
                                href="/testimonials"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Reviews
                            </Link>

                            <Link
                                href="/get-a-quote"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Get a Quote
                            </Link>

                        </div>

                    </div>


                    {/* =================================================
                        COMPANY
                    ================================================== */}

                    <div>

                        <h3
                            className="
                                font-serif
                                text-xl
                                font-bold
                                text-[#D9B84C]
                            "
                        >
                            Company
                        </h3>

                        <div className="mt-6 space-y-4">

                            <Link
                                href="/about"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                About Us
                            </Link>

                            <Link
                                href="/services"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Our Services
                            </Link>

                            <Link
                                href="/packages"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Event Packages
                            </Link>

                            <Link
                                href="/testimonials"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Client Reviews
                            </Link>

                            <Link
                                href="/contact"
                                className="
                                    block
                                    text-sm
                                    text-white/65
                                    transition
                                    hover:translate-x-1
                                    hover:text-[#D9B84C]
                                "
                            >
                                Contact Us
                            </Link>

                        </div>

                    </div>


                    {/* =================================================
                        CONTACT
                    ================================================== */}

                    <div>

                        <h3
                            className="
                                font-serif
                                text-xl
                                font-bold
                                text-[#D9B84C]
                            "
                        >
                            Contact Us
                        </h3>

                        <div className="mt-6 space-y-5">

                            {/* LOCATION */}

                            <div className="flex items-start gap-3">

                                <MapPin
                                    size={18}
                                    strokeWidth={1.6}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-[#D9B84C]
                                    "
                                />

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider
                                            text-white/40
                                        "
                                    >
                                        Location
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            leading-6
                                            text-white/65
                                        "
                                    >
                                        {address}
                                    </p>

                                </div>

                            </div>


                            {/* PHONE */}

                            <div className="flex items-start gap-3">

                                <Phone
                                    size={18}
                                    strokeWidth={1.6}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-[#D9B84C]
                                    "
                                />

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider
                                            text-white/40
                                        "
                                    >
                                        Phone
                                    </p>

                                    <a
                                        href={phoneHref}
                                        className="
                                            mt-1
                                            block
                                            text-sm
                                            text-white/65
                                            transition
                                            hover:text-[#D9B84C]
                                        "
                                    >
                                        {phone}
                                    </a>

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="flex items-start gap-3">

                                <Mail
                                    size={18}
                                    strokeWidth={1.6}
                                    className="
                                        mt-0.5
                                        shrink-0
                                        text-[#D9B84C]
                                    "
                                />

                                <div className="min-w-0">

                                    <p
                                        className="
                                            text-xs
                                            uppercase
                                            tracking-wider
                                            text-white/40
                                        "
                                    >
                                        Email
                                    </p>

                                    <a
                                        href={`mailto:${email}`}
                                        className="
                                            mt-1
                                            block
                                            break-all
                                            text-sm
                                            text-white/65
                                            transition
                                            hover:text-[#D9B84C]
                                        "
                                    >
                                        {email}
                                    </a>

                                </div>

                            </div>

                        </div>


                        {/* PLAN EVENT */}

                        <Link
                            href="/get-a-quote"
                            className="
                                mt-7
                                inline-flex
                                items-center
                                rounded-xl
                                bg-[#D6A928]
                                px-5
                                py-3
                                text-xs
                                font-bold
                                uppercase
                                tracking-wider
                                text-[#4A0618]
                                transition
                                duration-300
                                hover:bg-[#E8CA70]
                            "
                        >
                            Plan Your Event

                            <ArrowRight
                                size={16}
                                strokeWidth={2}
                                className="ml-2"
                            />
                        </Link>

                    </div>

                </div>

            </div>


            {/* =====================================================
                GOLD DIVIDER
            ====================================================== */}

            <div
                className="
                    mx-auto
                    max-w-[1500px]
                    px-6
                    sm:px-8
                    lg:px-12
                "
            >

                <div
                    className="
                        h-px
                        bg-gradient-to-r
                        from-transparent
                        via-[#D9B84C]/50
                        to-transparent
                    "
                />

            </div>


            {/* =====================================================
                BOTTOM FOOTER
            ====================================================== */}

            <div
                className="
                    mx-auto
                    flex
                    max-w-[1500px]
                    flex-col
                    gap-5
                    px-6
                    py-7
                    text-center
                    sm:px-8
                    md:flex-row
                    md:items-center
                    md:justify-between
                    md:text-left
                    lg:px-12
                "
            >

                {/* Copyright */}

                <p className="text-xs text-white/40">
                    © {new Date().getFullYear()}{" "}
                    {companyName}. All rights reserved.
                </p>

                {/* Legal */}

                <div
                    className="
                        flex
                        justify-center
                        gap-6
                        text-xs
                        text-white/40
                    "
                >

                    {/* Temporary links.
                        We will connect these to real pages later. */}

                    <Link
                        href="/privacy-policy"
                        className="
                            transition
                            hover:text-[#D9B84C]
                        "
                    >
                        Privacy Policy
                    </Link>

                    <Link
                        href="/terms-and-conditions"
                        className="
                            transition
                            hover:text-[#D9B84C]
                        "
                    >
                        Terms & Conditions
                    </Link>

                </div>

                {/* Tagline */}

                <p
                    className="
                        font-serif
                        text-sm
                        italic
                        text-[#D9B84C]/70
                    "
                >
                    {tagline}
                </p>
                {/* MOBILE SCROLL TO TOP */}

                {isFooterVisible && (
                    <button
                        type="button"
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                        aria-label="Scroll to top"
                        className="
                                fixed
                                bottom-5
                                right-5
                                z-50
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#D9B84C]/60
                                bg-[#4A0618]
                                text-[#D9B84C]
                                shadow-[0_4px_16px_rgba(0,0,0,0.25)]
                                transition
                                duration-300
                                hover:bg-[#D9B84C]
                                hover:text-[#4A0618]
                                md:hidden
                            "
                    >
                        ↑
                    </button>
                )}
            </div>

        </footer>
    );
}