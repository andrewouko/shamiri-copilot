"use client";

import { useState, type SubmitEvent } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { type ApiResponse, type LoginErrorCode, type LoginResponseData } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json: ApiResponse<LoginResponseData, LoginErrorCode> = await res.json();

      if (!json.success) {
        setError(json.error.message ?? "Login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-shamiri-green-pale via-white to-slate-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-shamiri-green shadow-lg">
            <SparklesIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Shamiri Copilot</h1>
          <p className="mt-1 text-sm text-slate-500">
            Supervisor session review dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="supervisor@shamiri.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="label mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full py-2.5 ${loading ? "animate-pulse" : ""}`}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Shamiri Tiered Care Model · Supervisor Portal
        </p>
      </div>
    </div>
  );
}
