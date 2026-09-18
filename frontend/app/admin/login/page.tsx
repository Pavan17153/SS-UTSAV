"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type LoginResponse = {
    access_token: string;
    token_type: string;
    admin_id: number;
    name: string;
    email: string;
    role: string;
};

export default function AdminLoginPage() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            /*
             * ---------------------------------------------
             * LOGIN API
             * ---------------------------------------------
             */

            const data = await publicApi.post<LoginResponse>(
                "/api/admin/login",
                {
                    email: email.trim(),
                    password,
                }
            );

            /*
             * ---------------------------------------------
             * SAFETY CHECK
             * ---------------------------------------------
             */

            if (!data || !data.access_token) {
                throw new Error(
                    "Login succeeded but no access token was returned."
                );
            }

            /*
             * ---------------------------------------------
             * CLEAR OLD AUTH DATA
             *
             * This prevents an old token from another
             * login/session causing problems.
             * ---------------------------------------------
             */

            localStorage.removeItem("ss_utsav_access_token");
            localStorage.removeItem("ss_utsav_admin");

            sessionStorage.removeItem("ss_utsav_access_token");
            sessionStorage.removeItem("ss_utsav_admin");

            /*
             * ---------------------------------------------
             * SELECT STORAGE
             *
             * Remember Me ON
             *     -> localStorage
             *
             * Remember Me OFF
             *     -> sessionStorage
             * ---------------------------------------------
             */

            const storage = rememberMe
                ? localStorage
                : sessionStorage;

            /*
             * ---------------------------------------------
             * SAVE TOKEN
             * ---------------------------------------------
             */

            storage.setItem(
                "ss_utsav_access_token",
                data.access_token
            );

            /*
             * ---------------------------------------------
             * ALSO SAVE USING STANDARD KEY
             *
             * This keeps compatibility with the existing
             * dashboard/admin pages.
             * ---------------------------------------------
             */

            storage.setItem(
                "access_token",
                data.access_token
            );

            /*
             * ---------------------------------------------
             * SAVE ADMIN DETAILS
             * ---------------------------------------------
             */

            const adminData = {
                id: data.admin_id,
                name: data.name,
                email: data.email,
                role: data.role,
            };

            storage.setItem(
                "ss_utsav_admin",
                JSON.stringify(adminData)
            );

            storage.setItem(
                "admin",
                JSON.stringify(adminData)
            );

            /*
             * ---------------------------------------------
             * REDIRECT
             *
             * replace() prevents the login page from
             * remaining in browser history.
             * ---------------------------------------------
             */

            router.replace("/admin/dashboard");

        } catch (err) {
            console.error("Login error:", err);

            if (err instanceof Error) {
                /*
                 * Network error
                 */
                if (
                    err.message === "Failed to fetch" ||
                    err.message.includes("NetworkError")
                ) {
                    setError(
                        "Unable to connect to the server. Please make sure the backend is running."
                    );
                }

                /*
                 * Unauthorized
                 */
                else if (
                    err.message === "Unauthorized" ||
                    err.message.includes("401")
                ) {
                    setError(
                        "Invalid email or password."
                    );
                }

                /*
                 * Other error
                 */
                else {
                    setError(err.message);
                }
            } else {
                setError(
                    "Unable to sign in. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            className={`${montserrat.className} min-h-screen bg-[#FBF7F0] text-[#39030F]`}
        >
            <div className="grid min-h-screen lg:grid-cols-2">

                {/* =====================================================
                    LEFT — BRAND VISUAL
                ===================================================== */}

                <section className="relative hidden overflow-hidden lg:block">

                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=90')",
                        }}
                    />

                    <div className="absolute inset-0 bg-[#39030F]/80" />

                    <div className="relative flex min-h-screen items-center px-16 xl:px-24">

                        <div className="max-w-xl text-white">

                            {/* BRAND */}

                            <div className="mb-8">

                                <h1
                                    className={`${playfair.className} text-5xl font-bold tracking-wide`}
                                >
                                    SS UTSAV
                                </h1>

                                <div className="mt-3 flex items-center gap-3 text-[#D9B84C]">

                                    <span className="h-px w-12 bg-[#D9B84C]" />

                                    <span className="text-lg">
                                        ✦
                                    </span>

                                    <span className="h-px w-12 bg-[#D9B84C]" />

                                </div>

                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
                                    We Plan. You Celebrate.
                                </p>

                            </div>

                            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#D9B84C]">
                                Event Management
                            </p>

                            <h2
                                className={`${playfair.className} mt-6 text-6xl font-semibold leading-[1.05] xl:text-7xl`}
                            >
                                Behind Every
                                <br />
                                Great Celebration.
                            </h2>

                            <p className="mt-8 max-w-lg text-lg leading-8 text-white/75">
                                Manage enquiries, events,
                                quotations, payments,
                                vendors, and everything
                                that happens behind the
                                scenes.
                            </p>

                            <div className="mt-12 h-px w-24 bg-[#D9B84C]" />

                            <p className="mt-6 text-sm uppercase tracking-[0.18em] text-white/60">
                                SS UTSAV Admin Portal
                            </p>

                        </div>

                    </div>

                </section>

                {/* =====================================================
                    RIGHT — LOGIN
                ===================================================== */}

                <section className="flex min-h-screen items-center justify-center px-6 py-16 md:px-12 lg:px-16 xl:px-24">

                    <div className="w-full max-w-xl">

                        {/* =================================================
                            MOBILE BRAND
                        ================================================= */}

                        <div className="mb-12 text-center lg:hidden">

                            <h1
                                className={`${playfair.className} text-4xl font-bold tracking-wide`}
                            >
                                SS UTSAV
                            </h1>

                            <div className="mt-3 flex items-center justify-center gap-3 text-[#C9A227]">

                                <span className="h-px w-10 bg-[#C9A227]" />

                                <span>
                                    ✦
                                </span>

                                <span className="h-px w-10 bg-[#C9A227]" />

                            </div>

                            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#39030F]/55">
                                Admin Portal
                            </p>

                        </div>

                        {/* =================================================
                            HEADING
                        ================================================= */}

                        <div className="mb-10">

                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C9A227]">
                                Welcome Back
                            </p>

                            <h2
                                className={`${playfair.className} mt-4 text-5xl font-semibold leading-tight md:text-6xl`}
                            >
                                Admin
                                <br />
                                Sign In.
                            </h2>

                            <p className="mt-5 text-base leading-7 text-[#39030F]/60">
                                Sign in to manage SS UTSAV
                                events and operations.
                            </p>

                        </div>

                        {/* =================================================
                            LOGIN CARD
                        ================================================= */}

                        <div className="border border-[#39030F]/10 bg-white p-7 shadow-xl md:p-10">

                            <form onSubmit={handleSubmit}>

                                {/* EMAIL */}

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-bold uppercase tracking-[0.16em]"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        placeholder="admin@ssutsav.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 text-sm text-[#39030F] outline-none transition placeholder:text-[#39030F]/35 focus:border-[#C9A227]"
                                    />

                                </div>

                                {/* PASSWORD */}

                                <div className="mt-6">

                                    <div className="mb-2 flex items-center justify-between">

                                        <label
                                            htmlFor="password"
                                            className="block text-xs font-bold uppercase tracking-[0.16em]"
                                        >
                                            Password
                                        </label>

                                        <button
                                            type="button"
                                            className="text-xs font-semibold text-[#C9A227] transition hover:text-[#39030F]"
                                            onClick={() =>
                                                setError(
                                                    "Password recovery will be connected later."
                                                )
                                            }
                                        >
                                            Forgot Password?
                                        </button>

                                    </div>

                                    <div className="relative">

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            required
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-[#39030F]/15 bg-[#FBF7F0] px-4 py-4 pr-20 text-sm text-[#39030F] outline-none transition placeholder:text-[#39030F]/35 focus:border-[#C9A227]"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-[0.1em] text-[#39030F]/50 transition hover:text-[#C9A227]"
                                        >
                                            {showPassword
                                                ? "Hide"
                                                : "Show"}
                                        </button>

                                    </div>

                                </div>

                                {/* REMEMBER ME */}

                                <div className="mt-6 flex items-center">

                                    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#39030F]/65">

                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) =>
                                                setRememberMe(
                                                    e.target.checked
                                                )
                                            }
                                            className="h-4 w-4 accent-[#4A0618]"
                                        />

                                        <span>
                                            Remember me
                                        </span>

                                    </label>

                                </div>

                                {/* ERROR */}

                                {error && (
                                    <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                                        {error}
                                    </div>
                                )}

                                {/* LOGIN BUTTON */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-8 w-full bg-[#4A0618] px-8 py-5 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#D9B84C] hover:text-[#39030F] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Signing In..."
                                        : "Sign In"}
                                </button>

                            </form>

                            {/* SECURITY MESSAGE */}

                            <div className="mt-8 border-t border-[#39030F]/10 pt-6 text-center">

                                <p className="text-xs leading-5 text-[#39030F]/45">
                                    Authorized SS UTSAV
                                    administrators only.
                                </p>

                            </div>

                        </div>

                        {/* FOOTER */}

                        <div className="mt-8 text-center">

                            <p className="text-xs uppercase tracking-[0.15em] text-[#39030F]/40">
                                SS UTSAV • We Plan. You Celebrate.
                            </p>

                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}