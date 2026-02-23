import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shamiri Supervisor Copilot",
  description:
    "AI-powered session review dashboard for Shamiri Supervisors — quality assurance for Tiered Care therapy sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
