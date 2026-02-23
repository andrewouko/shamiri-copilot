"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface NavbarProps {
  supervisorName: string;
}

export function Navbar({ supervisorName }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-shamiri-green">
            <SparklesIcon className="h-4 w-4 text-white" />
          </div>
          <span className="hidden font-bold text-slate-800 sm:block">
            Shamiri <span className="text-shamiri-green">Copilot</span>
          </span>
        </Link>

        {/* User menu */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-700">
              {supervisorName}
            </p>
            <p className="text-xs text-slate-400">Supervisor</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-shamiri-green flex items-center justify-center text-white text-sm font-bold">
            {supervisorName.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs font-medium text-slate-500 hover:text-red-600 transition"
          >
            {loggingOut ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
