"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cekUser();
  }, []);

  async function cekUser() {
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject("TIMEOUT"), 5000)
        ),
      ]);

      const session = (result as any)?.data?.session;

      if (session) {
        router.replace("/dashboard");
        return;
      }
    } catch (err) {
      console.error("Gagal mengecek session:", err);
    } finally {
      setCheckingSession(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Email atau password salah");
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-medium">
            Memuat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden flex">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-amber-500/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Left brand panel (desktop only) */}
      <aside className="hidden lg:flex relative z-10 w-1/2 flex-col justify-between p-12 xl:p-16 border-r border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Login
          </span>
        </div>

        <div className="space-y-6 animate-fadeIn">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">
            Kelola Keuangan Anda
          </p>
          <h2 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
            Buat keputusan finansial yang{" "}
            <span className="italic font-light text-amber-200/90">
              lebih cerdas
            </span>
            .
          </h2>
          <p className="text-zinc-500 text-base max-w-md font-light leading-relaxed">
            Pantau pemasukan, kendalikan pengeluaran, dan capai target tabungan
            Anda — semua dalam satu dashboard yang elegan.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-8 max-w-md">
            {[
              { label: "Aman", value: "256-bit" },
              { label: "Akurat", value: "Real-time" },
              { label: "Privasi", value: "Terjaga" },
            ].map((s) => (
              <div
                key={s.label}
                className="border-l border-white/[0.08] pl-3"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                  {s.label}
                </p>
                <p className="text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Dilindungi enkripsi end-to-end
        </div>
      </aside>

      {/* Right form panel */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm animate-slideUp">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              Login
            </span>
          </div>

          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium mb-3">
              Masuk
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
              Selamat{" "}
              <span className="italic font-light text-amber-200/90">
                datang
              </span>
            </h1>
            <p className="text-zinc-500 text-sm font-light">
              Masukkan kredensial Anda untuk melanjutkan ke dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                Email
              </label>
              <div className="relative group">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
                />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-amber-400 font-medium transition-colors"
                >
                </Link>
              </div>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 font-semibold text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                atau
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="text-center text-sm text-zinc-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Daftar gratis →
              </Link>
            </div>
          </form>

          {/* Mobile trust line */}
          <div className="lg:hidden flex items-center justify-center gap-1.5 text-xs text-zinc-600 mt-10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Dilindungi enkripsi end-to-end
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.7s ease-out both; }
        .animate-slideUp { animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>
    </div>
  );
}