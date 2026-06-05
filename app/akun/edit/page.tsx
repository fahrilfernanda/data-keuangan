
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Wallet,
  Plus,
  Trash2,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Building2,
  CreditCard,
  DollarSign,
} from "lucide-react";

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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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

    const { error } = await supabase.from("accounts").insert({
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
      alert(`Akun masih digunakan oleh ${count} transaksi`);
      setDeleting(null);
      setDeleteConfirm(null);
      return;
    }

    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (error) {
      alert(error.message);
      setDeleting(null);
      setDeleteConfirm(null);
      return;
    }

    setDeleting(null);
    setDeleteConfirm(null);
    loadAccounts();
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-medium">
            Memuat Akun
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
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-blue-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 lg:px-16 py-8 md:py-12 max-w-5xl mx-auto">
        {/* Top Nav */}
        <nav className="flex items-center justify-between mb-10 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wallet className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              Kelola Akun
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
            Kelola{" "}
            <span className="italic font-light text-amber-200/90">Akun</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl font-light">
            Atur semua rekening bank, e-wallet, dan dompet Anda dalam satu tempat
          </p>
        </header>

        {/* Total Balance Card */}
        {accounts.length > 0 && (
          <section
            className="mb-8 animate-slideUp"
            style={{ animationDelay: "80ms" }}
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/[0.06] p-7 md:p-9">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.08] rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-[0.25em] font-medium mb-3">
                  <DollarSign className="w-3.5 h-3.5" />
                  Total Saldo Semua Akun
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-zinc-500 text-2xl font-light">Rp</span>
                  <span className="text-5xl md:text-6xl font-semibold tracking-tight tabular-nums text-white">
                    {totalBalance.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-3">
                  Dari {accounts.length} akun terdaftar
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Add Account Section */}
        <section
          className="mb-10 animate-slideUp"
          style={{ animationDelay: "150ms" }}
        >
          <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 md:p-9 backdrop-blur-xl">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Tambah Akun Baru
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Daftarkan rekening atau dompet digital Anda
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      tambahAkun();
                    }
                  }}
                  placeholder="Contoh: BCA, Mandiri, GoPay, OVO"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                />
              </div>

              <button
                onClick={tambahAkun}
                className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 text-sm font-semibold border border-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/20 hover:scale-105 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun</span>
              </button>
            </div>
          </div>
        </section>

        {/* Accounts List */}
        <section
          className="animate-slideUp"
          style={{ animationDelay: "220ms" }}
        >
          <div className="flex items-end justify-between mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Daftar Akun
            </h3>
            <span className="text-xs text-zinc-600">
              {accounts.length} akun
            </span>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-zinc-800 border border-white/[0.06] flex items-center justify-center">
                <Wallet className="w-7 h-7 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Belum ada akun
              </h3>
              <p className="text-zinc-500 mb-8 max-w-md mx-auto text-sm">
                Tambahkan akun pertama Anda untuk mulai mengelola keuangan dengan lebih terorganisir
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {accounts.map((account) => {
                const isDeleting = deleting === account.id;
                const showDeleteConfirm = deleteConfirm === account.id;

                return (
                  <div
                    key={account.id}
                    className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 p-6"
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Left Content */}
                      <div className="flex-1 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                          <span className="text-xl font-bold text-zinc-900">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">
                            {account.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <CreditCard className="w-3 h-3" />
                            <span>ID: {account.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Balance & Actions */}
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                            Saldo
                          </p>
                          <p className="text-2xl font-bold text-white tabular-nums">
                            {(account.balance || 0).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {!showDeleteConfirm ? (
                          <button
                            onClick={() => setDeleteConfirm(account.id)}
                            disabled={isDeleting}
                            className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-rose-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                            aria-label="Delete account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 animate-fadeIn">
                            <span className="text-xs text-zinc-400 mr-1">
                              Yakin hapus?
                            </span>
                            <button
                              onClick={() => hapusAkun(account.id)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                              {isDeleting ? "..." : "Hapus"}
                            </button>

                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Info Banner */}
        <div className="mt-10 rounded-2xl bg-blue-500/5 border border-blue-500/20 p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-200 font-medium mb-1">
              Informasi Penting
            </p>
            <p className="text-xs text-blue-300/70">
              Akun hanya dapat dihapus jika tidak memiliki transaksi terkait. 
              Saldo akan otomatis dihitung dari transaksi yang tercatat.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 mt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Finansa — Kelola keuangan dengan cerdas.
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