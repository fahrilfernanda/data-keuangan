"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // password strength
  const strength = (() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  })();

  const strengthLabel = ["Sangat lemah", "Lemah", "Cukup", "Kuat", "Sangat kuat"][
    strength
  ];
  const strengthColor = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-emerald-400",
  ][strength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      if (!email || !password || !confirmPassword) {
        setError("Semua field wajib diisi");
        return;
      }

      if (password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
      if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      console.log("Registrasi berhasil:", data);
      setSuccess(true);

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // otomatis kembali ke login
      setTimeout(() => {
        router.push("/login");
      }, 2200);
    } catch (err) {
      console.error("Register Error:", err);
      setError("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden flex">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-amber-500/[0.08] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[520px] h-[520px] rounded-full bg-emerald-500/[0.06] blur-[120px]" />
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
            Registerasi
          </span>
        </div>

        <div className="space-y-6 animate-fadeIn">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">
            Mulai Perjalanan Anda
          </p>
          <h2 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05]">
            Satu akun.{" "}
            <span className="italic font-light text-amber-200/90">
              Banyak kemungkinan
            </span>
            .
          </h2>
          <p className="text-zinc-500 text-base max-w-md font-light leading-relaxed">
            Bergabunglah dengan ribuan pengguna yang sudah mengatur keuangan
            mereka dengan lebih cerdas dan terarah.
          </p>

          <ul className="space-y-3 pt-6 max-w-md">
            {[
              "Catat transaksi tanpa batas",
              "Target tabungan & laporan otomatis",
              "Sinkronisasi real-time, kapan saja",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-3 text-sm text-zinc-400"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Data Anda dienkripsi end-to-end
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
              Registerasi
            </span>
          </div>

          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium mb-3">
              Daftar
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
              Buat{" "}
              <span className="italic font-light text-amber-200/90">akun</span>{" "}
              baru
            </h1>
            <p className="text-zinc-500 text-sm font-light">
              Hanya butuh 30 detik. Gratis selamanya.
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-300 text-sm font-medium">
                  Registrasi berhasil!
                </p>
                <p className="text-emerald-400/70 text-xs mt-1">
                  Cek email untuk verifikasi. Mengalihkan ke login…
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
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
              <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  autoComplete="new-password"
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

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-3 animate-fadeIn">
                  <div className="flex gap-1 mb-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i < strength ? strengthColor : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    Kekuatan:{" "}
                    <span className="text-zinc-300 font-medium">
                      {strengthLabel}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
                Konfirmasi Password
              </label>
              <div className="relative group">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password Anda"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/[0.03] border text-white text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? "border-rose-500/40 focus:border-rose-500/60 focus:ring-rose-500/10"
                      : confirmPassword && password === confirmPassword
                      ? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/10"
                      : "border-white/[0.08] focus:border-amber-500/50 focus:ring-amber-500/10"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Password tidak cocok
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Password cocok
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-rose-300 text-xs leading-relaxed">{error}</p>
              </div>
            )}

            {/* Terms note */}
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link
                href="/terms"
                className="text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
              >
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="text-zinc-400 hover:text-amber-400 underline underline-offset-2 transition-colors"
              >
                Kebijakan Privasi
              </Link>{" "}
              kami.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 font-semibold text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* Back to login */}
            <Link
              href="/login"
              className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] text-zinc-400 hover:text-white text-sm font-medium transition-all"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Sudah punya akun? Masuk</span>
            </Link>
          </form>

          {/* Mobile trust line */}
          <div className="lg:hidden flex items-center justify-center gap-1.5 text-xs text-zinc-600 mt-10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Data Anda dienkripsi end-to-end
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
        .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
        .animate-slideUp { animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>
    </div>
  );
}