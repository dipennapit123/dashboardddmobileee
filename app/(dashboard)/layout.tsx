"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { key: "dashboard", href: "/", label: "Dashboard", icon: "dashboard" },
  { key: "horoscopes", href: "/horoscopes", label: "Horoscopes", icon: "nights_stay" },
  { key: "generate", href: "/generate", label: "Generate", icon: "auto_fix_high" },
  { key: "users", href: "/users", label: "Users", icon: "group" },
  { key: "settings", href: "/settings", label: "Settings", icon: "settings", separated: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  let activeKey = "dashboard";
  if (pathname?.startsWith("/horoscopes")) activeKey = "horoscopes";
  else if (pathname?.startsWith("/generate")) activeKey = "generate";
  else if (pathname?.startsWith("/users")) activeKey = "users";
  else if (pathname?.startsWith("/settings")) activeKey = "settings";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#050316] via-[#05021A] to-[#0B061F] text-foreground">
      <aside className="flex h-screen w-64 flex-col border-r border-purple-900/30 bg-[#0d0618]">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7f13ec] text-white">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <div>
            <h1 className="text-base font-bold leading-none text-white">
              AstraDaily
            </h1>
            <p className="mt-1 text-xs text-purple-400/70">Admin Portal</p>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <div key={item.key}>
              {item.separated && (
                <div className="mb-2 mt-4 border-t border-purple-900/30" />
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  activeKey === item.key
                    ? "border border-[#7f13ec]/30 bg-[#7f13ec]/15 text-[#7f13ec]"
                    : "border border-transparent text-slate-400 hover:bg-purple-900/25 hover:text-purple-200"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>
        <div className="border-t border-purple-900/30 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-purple-900/20 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7f13ec]/30 text-xs font-bold text-purple-200">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-200">Admin</p>
              <p className="text-[10px] text-slate-500">Portal</p>
            </div>
          </div>
          {token && (
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/20"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6">{children}</main>
    </div>
  );
}
