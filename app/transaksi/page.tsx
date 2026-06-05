"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

type Transaction = {
  id: number;
  title: string;
  amount: number;
  account_id: number;
  transaction_date: string;
  categories: {
    name: string;
    type: string;
  };
};

export default function TransaksiPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("transactions")
        .select(
          `
          *,
          categories(name,type)
        `
        )
        .eq("user_id", user?.id)
        .order("transaction_date", {
          ascending: false,
        });

      setData(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function hapusTransaksi(id: number) {
    setDeleteLoading(id);

    const transaksi = data.find((item) => item.id === id);

    if (!transaksi) {
      setDeleteLoading(null);
      return;
    }

    // Ambil saldo akun
    const { data: akun } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", transaksi.account_id)
      .single();

    if (akun) {
      const perubahan =
        transaksi.categories.type === "income"
          ? -transaksi.amount
          : transaksi.amount;

      await supabase
        .from("accounts")
        .update({
          balance: Number(akun.balance) + perubahan,
        })
        .eq("id", transaksi.account_id);
    }

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    setDeleteLoading(null);
    setDeleteConfirm(null);

    if (error) {
      alert(error.message);
      return;
    }

    loadData();
  }

  const filteredData = data.filter((item) => {
    const cocokKategori =
      filterType === "all" ? true : item.categories?.type === filterType;

    const cocokSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.categories?.name?.toLowerCase().includes(search.toLowerCase());

    return cocokKategori && cocokSearch;
  });

  const totalIncome = data
    .filter((item) => item.categories?.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = data
    .filter((item) => item.categories?.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-medium">
            Memuat Transaksi
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
        <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 lg:px-16 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Top Nav */}
        <nav className="flex items-center justify-between mb-10 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              Riwayat Transaksi
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </Link>
            <Link
              href="/transaksi/tambah"
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 text-xs font-semibold border border-amber-300 transition-all duration-300 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Transaksi</span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-10 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
            Riwayat{" "}
            <span className="italic font-light text-amber-200/90">Transaksi</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base max-w-2xl font-light">
            Kelola dan lihat semua transaksi Anda. Filter berdasarkan kategori atau cari transaksi spesifik.
          </p>
        </header>

        {/* Quick Stats */}
        <section
          className="grid md:grid-cols-2 gap-4 mb-8 animate-slideUp"
          style={{ animationDelay: "80ms" }}
        >
          <div className="relative rounded-2xl overflow-hidden bg-white/[0.02] border border-emerald-500/20 p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.08] rounded-full blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-[0.2em] font-medium mb-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Total Pemasukan
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-500 text-base font-light">Rp</span>
                  <span className="text-3xl md:text-4xl font-semibold text-emerald-300 tabular-nums">
                    {totalIncome.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-white/[0.02] border border-rose-500/20 p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.08] rounded-full blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-rose-400 text-xs uppercase tracking-[0.2em] font-medium mb-2">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Total Pengeluaran
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-zinc-500 text-base font-light">Rp</span>
                  <span className="text-3xl md:text-4xl font-semibold text-rose-300 tabular-nums">
                    {totalExpense.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section
          className="mb-8 animate-slideUp"
          style={{ animationDelay: "150ms" }}
        >
          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan judul atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mr-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-full font-medium text-xs whitespace-nowrap transition-all duration-300 ${
                filterType === "all"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-900 shadow-lg shadow-amber-500/20"
                  : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              Semua Transaksi
            </button>
            <button
              onClick={() => setFilterType("income")}
              className={`px-4 py-2 rounded-full font-medium text-xs whitespace-nowrap transition-all duration-300 ${
                filterType === "income"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`px-4 py-2 rounded-full font-medium text-xs whitespace-nowrap transition-all duration-300 ${
                filterType === "expense"
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                  : "bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </section>

        {/* Transaction List */}
        <section
          className="animate-slideUp"
          style={{ animationDelay: "220ms" }}
        >
          {filteredData.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-zinc-800 border border-white/[0.06] flex items-center justify-center">
                <Search className="w-7 h-7 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {search ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
              </h3>
              <p className="text-zinc-500 mb-8 max-w-md mx-auto text-sm">
                {search
                  ? `Tidak ada hasil untuk pencarian "${search}"`
                  : filterType === "all"
                  ? "Mulai catat transaksi Anda sekarang untuk melacak keuangan"
                  : `Belum ada transaksi ${
                      filterType === "income" ? "pemasukan" : "pengeluaran"
                    }`}
              </p>
              {!search && (
                <Link
                  href="/transaksi/tambah"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 text-sm font-semibold transition-all duration-300 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Transaksi Pertama
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.map((item) => {
                const isIncome = item.categories?.type === "income";
                const isDeleting = deleteLoading === item.id;
                const showDeleteConfirm = deleteConfirm === item.id;

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Content */}
                      <div className="flex-1 flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                            isIncome
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : "bg-rose-500/10 border-rose-500/20"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-rose-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold mb-1.5 truncate">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-medium ${
                                isIncome
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              }`}
                            >
                              <Tag className="w-3 h-3" />
                              {item.categories?.name}
                            </span>
                            <span className="flex items-center gap-1 text-zinc-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.transaction_date).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Content - Amount & Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p
                            className={`text-xl md:text-2xl font-bold tabular-nums ${
                              isIncome ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {Number(item.amount).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {!showDeleteConfirm ? (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/transaksi/edit?id=${item.id}`}
                              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-blue-500 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-blue-500 transition-all duration-200"
                              aria-label="Edit transaction"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              disabled={isDeleting}
                              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-rose-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 animate-fadeIn">
                            <span className="text-xs text-zinc-400 mr-1">
                              Yakin hapus?
                            </span>
                            <button
                              onClick={() => hapusTransaksi(item.id)}
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

          {/* Footer Info */}
          {filteredData.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-500">
              <p>
                Menampilkan{" "}
                <span className="text-white font-semibold">
                  {filteredData.length}
                </span>{" "}
                dari{" "}
                <span className="text-white font-semibold">{data.length}</span>{" "}
                transaksi
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tersinkron otomatis
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="pt-8 mt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()}Transaksi — Kelola keuangan dengan cerdas.
          </p>
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