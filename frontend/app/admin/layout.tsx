"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [checkingAuth, setCheckingAuth] =
        useState(true);

    useEffect(() => {
        // Login page must always be accessible
        if (pathname === "/admin/login") {
            setCheckingAuth(false);
            return;
        }

        const token =
            localStorage.getItem(
                "ss_utsav_access_token"
            ) ||
            sessionStorage.getItem(
                "ss_utsav_access_token"
            ) ||
            localStorage.getItem("access_token") ||
            sessionStorage.getItem("access_token");

        if (!token) {
            router.replace("/admin/login");
            return;
        }

        setCheckingAuth(false);
    }, [pathname, router]);

    // ---------------------------------------------------
    // LOGIN PAGE
    // ---------------------------------------------------

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // ---------------------------------------------------
    // CHECKING AUTH
    // ---------------------------------------------------

    if (checkingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FBF7F0]">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eadfce] border-t-[#4A0618]" />

                    <p className="mt-4 text-sm font-semibold text-[#806f61]">
                        Checking admin access...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}