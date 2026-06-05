"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  User,
  Mail,
  Shield,
  Save,
  ChevronLeft,
  Sparkles,
  Edit3,
  CheckCircle,
  Calendar,
} from "lucide-react";

export default function ProfilPage() {
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");
      setUserId(user.id || "");
      setCreatedAt(user.created_at || "");

      const { data: profile } = await supabase
        .from("profile")
        .select("nama")
        .eq("id", user.id)
        .single();

      if (profile) {
        setNama(profile.nama || "");
      }
    } finally {
      setLoading(false);
    }
  }

  async function simpanNama() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!nama.trim()) {
      alert("Nama tidak boleh kosong");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("profile").upsert({
      id: user.id,
      nama: nama.trim(),
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-medium">
            Memuat Profil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-amber-500/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-purple-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 lg:px-16 py-8 md:py-12 max-w-4xl mx-auto">
        {/* Top Nav */}
        <nav className="flex items-center justify-between mb-10 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <User className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              Profil Pengguna
            </span>
          </div>

          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-10 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
            Profil{" "}
            <span className="italic font-light text-amber-200/90">Anda</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl font-light">
            Kelola informasi akun dan preferensi pengguna Anda
          </p>
        </header>

        {/* Profile Card */}
        <section
          className="mb-8 animate-slideUp"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/[0.06] p-8 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.08] rounded-full blur-3xl" />

            {/* Avatar Section */}
            <div className="relative flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 border-4 border-zinc-900">
                  <User className="w-12 h-12 text-zinc-900" strokeWidth={2} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-zinc-900 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mt-5 mb-1">
                {nama || email.split("@")[0]}
              </h2>
              <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Pengguna Aktif
              </p>
            </div>

            {/* Info Grid */}
            <div className="relative grid md:grid-cols-2 gap-4 mb-6">
              {/* Email */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                      Email
                    </p>
                    <p className="text-sm font-medium text-white truncate">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              {createdAt && (
                <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                        Bergabung Sejak
                      </p>
                      <p className="text-sm font-medium text-white">
                        {new Date(createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Edit Profile Section */}
        <section
          className="animate-slideUp"
          style={{ animationDelay: "150ms" }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 md:p-9 backdrop-blur-xl">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Edit3 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Pengaturan Profil
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Perbarui nama tampilan Anda
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Nama Pengguna
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama pengguna Anda"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  />
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  Nama ini akan ditampilkan di dashboard dan profil Anda
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={simpanNama}
                  disabled={saving || !nama.trim()}
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 text-sm font-semibold border border-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>

                {saved && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium animate-fadeIn">
                    <CheckCircle className="w-4 h-4" />
                    <span>Tersimpan!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 mt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Profile — Kelola keuangan dengan cerdas.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Tersinkron otomatis
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out both;
        }
        .animate-slideUp {
          animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}