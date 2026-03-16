"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});
type FormValues = z.infer<typeof schema>;

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

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ token: string; admin: { id: string; name: string; username?: string; role: string } }>(
        "/admin/auth/login",
        values
      );
      login(res.data as { token: string; admin: { id: string; name: string; username?: string; role: string } });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050316] via-[#05021A] to-[#0B061F]">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/20 bg-card/80 p-8 shadow-2xl shadow-purple-900/40">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">AstraDaily Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in with your admin username and password.</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              className="w-full rounded-xl border border-purple-500/30 bg-muted/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-400">{errors.username.message}</p>
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
      </div>
    </div>
  );
}
