"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
    Playfair_Display,
    Montserrat,
} from "next/font/google";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#D6A928]/30 bg-[#4A0618]">

            {/* =====================================================
                MAIN NAVBAR
            ====================================================== */}

            <div
                className="
                    flex
                    h-[86px]
                    w-full
                    items-center
                    justify-between
                    px-5
                    sm:px-8
                    lg:px-10
                    xl:px-12
                "
            >

                {/* =================================================
                    LEFT SIDE - LOGO + BRAND
                ================================================== */}

                <Link
                    href="/"
                    onClick={closeMenu}
                    className="
                        group
                        flex
                        shrink-0
                        items-center
                    "
                >

                    {/* Logo */}

                    <div
                        className="
                            relative
                            flex
                            h-[54px]
                            w-[54px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border
                            border-[#D6A928]/70
                            bg-white
                            shadow-[0_3px_15px_rgba(0,0,0,0.20)]
                            transition-all
                            duration-300
                            group-hover:border-[#E8CA70]
                            group-hover:shadow-[0_5px_20px_rgba(214,169,40,0.25)]
                            sm:h-[58px]
                            sm:w-[58px]
                        "
                    >
                        <Image
                            src="/logo.png"
                            alt="SS UTSAV Logo"
                            fill
                            priority
                            sizes="58px"
                            className="object-cover"
                            style={{
                                objectPosition: "50% 32%",
                            }}
                        />
                    </div>

                    {/* =================================================
                        BRAND NAME
                    ================================================== */}

                    <div className="ml-4 sm:ml-5">

                        {/* Brand */}

                        <div
                            className={`
                                ${playfair.className}
                                whitespace-nowrap
                                text-[28px]
                                font-semibold
                                leading-none
                                tracking-[0.18em]
                                text-white
                                transition
                                duration-300
                                group-hover:text-[#E0BC55]
                            `}
                        >
                            SS UTSAV
                        </div>

                        {/* Decorative line */}

                        <div className="mt-[5px] flex items-center gap-3">

                            <span className="h-[1px] w-10 bg-[#D6A928] sm:w-13" />

                            <span className="text-[7px] leading-none text-[#D6A928]">
                                ✦
                            </span>

                            <span className="h-[1px] w-10 bg-[#D6A928] sm:w-13" />

                        </div>

                        {/* Tagline */}

                        <div
                            className={`
                                ${montserrat.className}
                                mt-[5px]
                                whitespace-nowrap
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-[#D9B84C]
                            `}
                        >
                            We Plan. You Celebrate.
                        </div>

                    </div>

                </Link>

                {/* =================================================
                    RIGHT SIDE
                ================================================== */}

                <div className="ml-auto flex items-center">

                    {/* =================================================
                        DESKTOP NAVIGATION
                    ================================================== */}

                    <nav
                        className={`
                            ${montserrat.className}
                            hidden
                            items-center
                            gap-7
                            lg:flex
                            xl:gap-9
                        `}
                    >

                        {/* Home */}

                        <Link
                            href="/"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Home

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* Services */}

                        <Link
                            href="/services"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Services

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* Packages */}

                        <Link
                            href="/packages"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Packages

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* Gallery */}

                        <Link
                            href="/gallery"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Gallery

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* How It Works */}

                        <Link
                            href="/how-it-works"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            How It Works

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* About */}

                        <Link
                            href="/about"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            About

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* Reviews */}

                        <Link
                            href="/testimonials"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Reviews

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                        {/* Contact */}

                        <Link
                            href="/contact"
                            className="
                                group
                                relative
                                py-3
                                text-[12px]
                                font-semibold
                                tracking-wide
                                text-white
                                transition
                                duration-300
                                hover:text-[#D9B84C]
                            "
                        >
                            Contact

                            <span
                                className="
                                    absolute
                                    bottom-0
                                    left-1/2
                                    h-[2px]
                                    w-0
                                    -translate-x-1/2
                                    bg-[#D9B84C]
                                    transition-all
                                    duration-300
                                    group-hover:w-full
                                "
                            />
                        </Link>

                    </nav>

                    {/* =================================================
                        GET A QUOTE
                    ================================================== */}

                    <div className="ml-7 hidden lg:block xl:ml-10">

                        <Link
                            href="/get-a-quote"
                            className={`
                                ${montserrat.className}
                                group
                                inline-flex
                                items-center
                                rounded-xl
                                bg-[#D6A928]
                                px-6
                                py-3.5
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.15em]
                                text-[#4A0618]
                                shadow-[0_6px_20px_rgba(0,0,0,0.18)]
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:bg-[#E8CA70]
                                hover:shadow-[0_10px_25px_rgba(0,0,0,0.25)]
                            `}
                        >
                            Get a Quote

                            <span
                                className="
                                    ml-2
                                    text-sm
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                "
                            >
                                →
                            </span>

                        </Link>

                    </div>

                    {/* =================================================
                        MOBILE MENU BUTTON
                    ================================================== */}

                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        className="
                            ml-4
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-[#D9B84C]/40
                            transition-all
                            duration-300
                            hover:border-[#D9B84C]
                            lg:hidden
                        "
                    >

                        {menuOpen ? (
                            <span
                                className="
                                    text-3xl
                                    font-light
                                    leading-none
                                    text-[#D9B84C]
                                "
                            >
                                ×
                            </span>
                        ) : (
                            <div className="flex flex-col gap-1.5">

                                <span className="h-[2px] w-5 bg-[#D9B84C]" />
                                <span className="h-[2px] w-5 bg-[#D9B84C]" />
                                <span className="h-[2px] w-5 bg-[#D9B84C]" />

                            </div>
                        )}

                    </button>

                </div>

            </div>

            {/* =====================================================
                MOBILE MENU
            ====================================================== */}

            {menuOpen && (
                <div
                    className="
                        border-t
                        border-[#D9B84C]/20
                        bg-[#4A0618]
                        shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                        lg:hidden
                    "
                >

                    <nav
                        className={`
                            ${montserrat.className}
                            px-5
                            py-4
                            sm:px-8
                        `}
                    >

                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Home
                        </Link>

                        <Link
                            href="/services"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Services
                        </Link>

                        <Link
                            href="/packages"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Packages
                        </Link>

                        <Link
                            href="/gallery"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Gallery
                        </Link>

                        <Link
                            href="/how-it-works"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            How It Works
                        </Link>

                        <Link
                            href="/about"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            About
                        </Link>

                        <Link
                            href="/testimonials"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Reviews
                        </Link>

                        <Link
                            href="/contact"
                            onClick={closeMenu}
                            className="
                                block
                                border-b
                                border-white/10
                                py-4
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:text-[#D9B84C]
                            "
                        >
                            Contact
                        </Link>

                        <Link
                            href="/get-a-quote"
                            onClick={closeMenu}
                            className="
                                mt-5
                                block
                                rounded-xl
                                bg-[#D6A928]
                                px-6
                                py-4
                                text-center
                                text-xs
                                font-bold
                                uppercase
                                tracking-[0.15em]
                                text-[#4A0618]
                                transition
                                hover:bg-[#E8CA70]
                            "
                        >
                            Get a Quote →
                        </Link>

                    </nav>

                </div>
            )}

        </header>
    );
}