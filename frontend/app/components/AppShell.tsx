"use client";

import { usePathname } from "next/navigation";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({
    children,
}: AppShellProps) {
    const pathname = usePathname();

    // All admin pages should have a completely separate layout.
    const isAdminPage = pathname.startsWith("/admin");

    if (isAdminPage) {
        return <>{children}</>;
    }

    // Public website layout
    return (
        <>
            <Navbar />

            {children}

            <Footer />
        </>
    );
}