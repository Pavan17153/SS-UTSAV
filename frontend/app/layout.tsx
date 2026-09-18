import type { Metadata } from "next";
import "./globals.css";

import AppShell from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: "SS UTSAV | We Plan. You Celebrate.",
  description:
    "SS UTSAV - Event Planning & Management. We Plan. You Celebrate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="m-0 bg-[#FBF7F0] p-0 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}