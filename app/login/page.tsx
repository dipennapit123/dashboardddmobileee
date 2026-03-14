"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string; admin: { id: string; name: string; email: string; role: string } }>(
        "/admin/auth/login",
        values
      );
      login(res.data as { token: string; admin: { id: string; name: string; email: string; role: string } });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const onSetupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("setup-email") as HTMLInputElement)?.value;
    const password = (form.elements.namedItem("setup-password") as HTMLInputElement)?.value;
    const name = (form.elements.namedItem("setup-name") as HTMLInputElement)?.value;
    const parsed = setupSchema.safeParse({ email, password, name: name || undefined });
    if (!parsed.success) {
      setSetupError(parsed.error.errors.map((e) => e.message).join(" "));
      return;
    }
    setSetupLoading(true);
    setSetupError(null);
    try {
      const res = await api.post<{ token: string; admin: { id: string; name: string; email: string; role: string } }>(
        "/admin/auth/setup",
        { email: parsed.data.email, password: parsed.data.password, name: parsed.data.name || "Admin" }
      );
      login(res.data as { token: string; admin: { id: string; name: string; email: string; role: string } });
      router.replace("/");
    } catch (err) {
      setSetupError(
        err instanceof Error ? err.message : "An admin already exists. Use the form above to sign in."
      );
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050316] via-[#05021A] to-[#0B061F]">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/20 bg-card/80 p-8 shadow-2xl shadow-purple-900/40">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">AstraDaily Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage daily horoscopes.</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-4 py-2 text-sm font-medium shadow-lg shadow-purple-900/40 hover:bg-purple-500 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-6 border-t border-purple-500/20 pt-4">
          <button
            type="button"
            onClick={() => {
              setShowSetup(!showSetup);
              setSetupError(null);
            }}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            {showSetup ? "Hide first-time setup" : "First time? Create admin account"}
          </button>
          {showSetup && (
            <form className="mt-4 space-y-3" onSubmit={onSetupSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <input
                  name="setup-name"
                  type="text"
                  placeholder="Admin"
                  className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  name="setup-email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Password (min 6)</label>
                <input
                  name="setup-password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {setupError && (
                <p className="text-xs text-red-400">{setupError}</p>
              )}
              <button
                type="submit"
                disabled={setupLoading}
                className="w-full rounded-full border border-purple-500/50 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/20 disabled:opacity-60"
              >
                {setupLoading ? "Creating..." : "Create first admin"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
