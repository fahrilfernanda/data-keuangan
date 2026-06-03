"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  console.log("LOGIN PAGE TERLOAD");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    cekUser();
  }, []);

  async function cekUser() {
  try {
    console.log("Mulai cek session");

    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) =>
        setTimeout(() => reject("TIMEOUT"), 5000)
      ),
    ]);

    console.log("HASIL:", result);

    const session =
      (result as any)?.data?.session;

    if (session) {
      console.log("User sudah login");

      router.replace("/dashboard");
      return;
    }
  } catch (err) {
    console.error(
      "Gagal mengecek session:",
      err
    );
  } finally {
    console.log("Loading selesai");

    setCheckingSession(false);
  }
}
  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError(
          "Email atau password salah"
        );
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Terjadi kesalahan saat login"
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        {/* Background Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="text-white text-xl">
          Memuat...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 relative overflow-hidden">
      <div className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white text-blue-600 p-4 rounded-full shadow-lg">
            <Wallet size={32} />
          </div>

          <h1 className="text-3xl font-bold mt-4">
            KeuanganKu
          </h1>

          <p className="text-white/80 text-sm mt-1 text-center">
            Kelola pemasukan dan pengeluaran
            dengan mudah
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
              />

              <input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                autoComplete="email"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="********"
                value={password}
                autoComplete="current-password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/20 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-300 text-red-100 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-semibold py-3 rounded-xl transition hover:scale-[1.02] hover:shadow-xl disabled:opacity-50"
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>

          <div className="text-center text-sm text-white/80">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-white hover:underline"
            >
              Daftar di sini
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}