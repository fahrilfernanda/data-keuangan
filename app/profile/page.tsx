"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User, Mail, Wallet } from "lucide-react";

export default function ProfilPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setEmail(user?.email || "");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 md:p-8">

      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">

       <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">
            Profil Pengguna
        </h1>
        <Link
    href="/dashboard"
    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
  >
    ← Dashboard
  </Link>
</div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">

            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <User
                size={42}
                className="text-white"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mt-4">
              Pengguna
            </h2>

            <p className="text-slate-400">
              Web Keuangan
            </p>
          </div>

          {/* Informasi */}
          <div className="space-y-4">

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">

              <Mail
                className="text-cyan-400"
                size={22}
              />

              <div>
                <p className="text-slate-400 text-sm">
                  Email
                </p>

                <p className="text-white font-medium">
                  {email}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">

              <Wallet
                className="text-green-400"
                size={22}
              />

              <div>
                <p className="text-slate-400 text-sm">
                  Status
                </p>

                <p className="text-white font-medium">
                  Pengguna Aktif
                </p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-500 text-sm">
            © 2026 KeuanganKu
          </div>

        </div>
      </div>
    </div>
  );
}