"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
}

const menuItems = [
    {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: "▦",
    },
    {
        name: "Leads",
        href: "/admin/leads",
        icon: "◉",
    },
    {
        name: "Clients",
        href: "/admin/clients",
        icon: "♙",
    },
    {
        name: "Events",
        href: "/admin/events",
        icon: "◆",
    },
    {
        name: "Quotations",
        href: "/admin/quotations",
        icon: "▤",
    },
    {
        name: "Payments",
        href: "/admin/payments",
        icon: "₹",
    },
    {
        name: "Vendors",
        href: "/admin/vendors",
        icon: "◇",
    },
    {
        name: "Gallery",
        href: "/admin/gallery",
        icon: "▧",
    },
    {
        name: "Packages",
        href: "/admin/packages",
        icon: "▱",
    },
    {
        name: "Testimonials",
        href: "/admin/testimonials",
        icon: "☆",
    },
    {
        name: "Settings",
        href: "/admin/settings",
        icon: "⚙",
    },
    {
        name: "Legal",
        href: "/admin/legal",
        icon: "§",
    },
];

export default function AdminSidebar({
    mobileMenuOpen,
    setMobileMenuOpen,
}: AdminSidebarProps) {
    const pathname = usePathname();

    const handleLogout = () => {
        // --------------------------------------------------
        // 1. Remove all possible authentication data
        // --------------------------------------------------

        // Local Storage
        localStorage.removeItem("ss_utsav_access_token");
        localStorage.removeItem("ss_utsav_admin");

        localStorage.removeItem("access_token");
        localStorage.removeItem("admin");

        localStorage.removeItem("adminToken");

        // Session Storage
        sessionStorage.removeItem("ss_utsav_access_token");
        sessionStorage.removeItem("ss_utsav_admin");

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("admin");

        sessionStorage.removeItem("adminToken");

        // --------------------------------------------------
        // 2. Close mobile sidebar
        // --------------------------------------------------

        setMobileMenuOpen(false);

        // --------------------------------------------------
        // 3. Redirect to login
        // --------------------------------------------------

        window.location.replace("/admin/login");
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-[270px]
          bg-[#39030F]
          text-white
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
        `}
            >
                {/* Brand */}
                <div className="border-b border-[#D6A928]/25 px-6 py-7">
                    <Link
                        href="/admin/dashboard"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                        className="block"
                    >
                        <div
                            className="text-center text-2xl font-semibold tracking-[0.18em] text-[#D6A928]"
                            style={{
                                fontFamily:
                                    "Georgia, serif",
                            }}
                        >
                            SS UTSAV
                        </div>

                        <div className="mt-2 flex items-center justify-center gap-2">
                            <span className="h-px w-8 bg-[#D6A928]/60" />

                            <span className="text-xs text-[#D6A928]">
                                ✦
                            </span>

                            <span className="h-px w-8 bg-[#D6A928]/60" />
                        </div>

                        <p className="mt-2 text-center text-[9px] tracking-[0.28em] text-[#FBF7F0]/70">
                            WE PLAN. YOU CELEBRATE.
                        </p>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="h-[calc(100vh-190px)] overflow-y-auto px-4 py-5">
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D6A928]/60">
                        Management
                    </p>

                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !==
                                    "/admin/dashboard" &&
                                    pathname.startsWith(
                                        item.href
                                    ));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() =>
                                        setMobileMenuOpen(false)
                                    }
                                    className={`
                    group
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${isActive
                                            ? "bg-[#D6A928] text-[#39030F] shadow-lg shadow-black/10"
                                            : "text-[#FBF7F0]/75 hover:bg-white/10 hover:text-white"
                                        }
                  `}
                                >
                                    <span
                                        className={`
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      text-sm
                      ${isActive
                                                ? "bg-[#39030F]/10"
                                                : "bg-white/5 text-[#D6A928]"
                                            }
                    `}
                                    >
                                        {item.icon}
                                    </span>

                                    <span>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Logout */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-[#D6A928]/20 bg-[#39030F] p-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#FBF7F0]/75 transition hover:bg-white/10 hover:text-white"
                    >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#D6A928]">
                            ↪
                        </span>

                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}