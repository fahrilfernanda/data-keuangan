"use client";

import { useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      if (
        !email ||
        !password ||
        !confirmPassword
      ) {
        setError(
          "Semua field wajib diisi"
        );
        return;
      }

      if (password.length < 6) {
        setError(
          "Password minimal 6 karakter"
        );
        return;
      }

      if (
        password !== confirmPassword
      ) {
        setError(
          "Konfirmasi password tidak cocok"
        );
        return;
      }

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      console.log(
        "Registrasi berhasil:",
        data
      );

      setSuccess(true);

      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // otomatis kembali ke login
      setTimeout(() => {
        router.push(
          "/login"
        );
      }, 2000);
    } catch (err) {
      console.error(
        "Register Error:",
        err
      );

      setError(
        "Terjadi kesalahan saat registrasi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0f172a] px-4">

      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User
              size={40}
              className="text-cyan-400"
            />
          </div>

          <h1 className="text-4xl font-bold text-white">
            Buat Akun
          </h1>

          <p className="text-slate-400 mt-2">
            Bergabung dan mulai kelola
            keuanganmu
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">

          {/* Success */}
          {success && (
            <div className="bg-green-500/20 border-b border-green-400/20 p-4">
              <p className="text-green-200 font-medium">
                ✅ Registrasi berhasil!
              </p>

              <p className="text-sm text-green-300">
                Silakan cek email untuk
                verifikasi akun.
              </p>

              <p className="text-xs text-green-300 mt-1">
                Mengalihkan ke halaman login...
              </p>
            </div>
          )}

          <form
            onSubmit={handleRegister}
            className="p-8 space-y-5"
          >

            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/20 rounded-xl p-3">
                <p className="text-red-200 text-sm">
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Konfirmasi Password
              </label>

              <input
                type="password"
                placeholder="Ulangi password"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
              />
            </div>

            {/* Tombol Daftar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading
                ? "Memproses..."
                : "Daftar Sekarang"}
            </button>

            {/* Tombol Kembali */}
            <Link
              href="/login"
              className="block w-full text-center py-3 rounded-xl border border-white/20 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              ← Kembali ke Login
            </Link>

          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          🔒 Data Anda aman dan terenkripsi
        </div>
      </div>
    </div>
  );
}