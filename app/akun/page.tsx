"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Account = {
  id: number;
  name: string;
  balance: number;
};

export default function AkunPage() {
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id);

    setAccounts(data || []);
    setLoading(false);
  }

  async function tambahAkun() {
    if (!name.trim()) {
      alert("Nama akun tidak boleh kosong");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Silakan login");
      return;
    }

    const { error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        balance: 0,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setName("");
    loadAccounts();
  }

  async function hapusAkun(id: number) {
    const konfirmasi = confirm(
      "Yakin ingin menghapus akun ini?"
    );

    if (!konfirmasi) return;

    setDeleting(id);

    const { count } = await supabase
      .from("transactions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("account_id", id);

    if ((count ?? 0) > 0) {
      alert(
        `Akun masih digunakan oleh ${count} transaksi`
      );
      setDeleting(null);
      return;
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      setDeleting(null);
      return;
    }

    loadAccounts();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex justify-between items-start md:items-center flex-col md:flex-row gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Kelola Akun
            </h1>
            <p className="text-slate-400 text-sm uppercase tracking-wide">
              Atur semua rekening bank dan dompet Anda
            </p>
          </div>

          <Link
            href="/dashboard"
            className="group px-6 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-900/50 flex items-center gap-2 whitespace-nowrap"
          >
            <span>←</span>
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {/* Add Account Section */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Tambah Akun Baru
            </h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    tambahAkun();
                  }
                }}
                placeholder="Contoh: BCA, Mandiri, E-Wallet, dll"
                className="flex-1 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              <button
                onClick={tambahAkun}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-900/50 whitespace-nowrap"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🏦</span>
            Akun Anda ({accounts.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-lg mb-2">
                Belum ada akun yang ditambahkan
              </p>
              <p className="text-slate-500 text-sm">
                Tambahkan akun pertama Anda untuk memulai
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 p-6 transition-all duration-500 transform hover:scale-102 hover:shadow-lg hover:shadow-slate-900/50 animate-fade-in"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10 flex justify-between items-start md:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white truncate">
                            {account.name}
                          </h3>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">
                            ID: {account.id}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-lg bg-slate-700/30 border border-slate-600/20">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                          Saldo
                        </p>
                        <p className="text-2xl font-bold text-white">
                          Rp {account.balance?.toLocaleString("id-ID") || 0}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => hapusAkun(account.id)}
                      disabled={deleting === account.id}
                      className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        deleting === account.id
                          ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-red-900/50"
                      }`}
                    >
                      {deleting === account.id ? (
                        <span className="inline-block animate-spin">⏳</span>
                      ) : (
                        <span>🗑️ Hapus</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>💡 Hapus akun hanya jika tidak memiliki transaksi</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
