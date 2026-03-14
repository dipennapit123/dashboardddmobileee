import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#050316] via-[#05021A] to-[#0B061F] text-white p-6">
      <h1 className="text-2xl font-bold text-purple-200">404: Page not found</h1>
      <p className="mt-2 text-slate-400">This page doesn’t exist or the deployment root may be wrong.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[#7f13ec] px-4 py-2 text-sm font-medium text-white hover:bg-[#6b0fc7]"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
