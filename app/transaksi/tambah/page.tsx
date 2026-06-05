"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Tag,
  Receipt,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  Lightbulb,
} from "lucide-react";

type Category = {
  id: number;
  name: string;
  type: string;
};

type Account = {
  id: number;
  name: string;
};

export default function TambahTransaksi() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [typeFilter, setTypeFilter] = useState<"income" | "expense">("expense");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadKategori();
    loadAccounts();
  }, []);

  // reset selected category when type changes
  useEffect(() => {
    setCategoryId("");
  }, [typeFilter]);

  async function loadKategori() {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("type")
        .order("name");

      if (error) {
        console.error(error);
        setError("Gagal memuat kategori");
        return;
      }
      setCategories(data || []);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function loadAccounts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (!error) setAccounts(data || []);
  }

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Judul transaksi tidak boleh kosong");
      return;
    }
    if (!amount || Number(amount.replace(/\./g, "")) <= 0) {
      setError("Jumlah harus lebih dari 0");
      return;
    }

    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu");
      return;
    }
    if (!accountId) {
      setError("Pilih akun terlebih dahulu");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Silakan login terlebih dahulu");
      setLoading(false);
      return;
    }

    const nominal = Number(amount.replace(/\./g, ""));
    const category = categories.find((c) => c.id === Number(categoryId));

    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: user.id,
      title,
      amount: nominal,
      category_id: Number(categoryId),
      account_id: Number(accountId),
      transaction_date: new Date().toISOString().split("T")[0],
    });

    if (insertError) {
      setLoading(false);
      setError(insertError.message);
      return;
    }

    // Update saldo akun (single source of truth — no duplicate)
    if (category) {
      const perubahan = category.type === "income" ? nominal : -nominal;

      const { data: akun } = await supabase
        .from("accounts")
        .select("balance")
        .eq("id", Number(accountId))
        .single();

      if (akun) {
        await supabase
          .from("accounts")
          .update({ balance: Number(akun.balance) + perubahan })
          .eq("id", Number(accountId));
      }
    }

    setLoading(false);
    setSuccess(true);
    setTitle("");
    setAmount("");
    setCategoryId("");
    setAccountId("");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  }

  function formatRupiah(value: string) {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAmount(formatRupiah(e.target.value));
  }

  function tambahNominal(nominal: number) {
    const current = Number(amount.replace(/\./g, "")) || 0;
    setAmount(formatRupiah((current + nominal).toString()));
  }

  function resetAmount() {
    setAmount("");
  }

  const filteredCategories = categories.filter((c) => c.type === typeFilter);
  const selectedCategory = categories.find(
    (cat) => cat.id === Number(categoryId)
  );
  const isIncome = typeFilter === "income";

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className={`absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blur-[120px] transition-colors duration-700 ${
            isIncome ? "bg-emerald-500/[0.07]" : "bg-amber-500/[0.07]"
          }`}
        />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-rose-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 py-8 md:py-12 max-w-2xl mx-auto">
        {/* Top Nav */}
        <nav className="flex items-center justify-between mb-12 animate-fadeIn">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Kembali
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">
              Tambah Transaksi
            </span>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-10 animate-fadeIn">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-3 font-medium">
            Transaksi Baru
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
            Catat{" "}
            <span className="italic font-light text-amber-200/90">
              transaksi
            </span>
          </h1>
          <p className="text-zinc-500 text-sm font-light">
            Isi detail transaksi Anda. Saldo akun akan otomatis ter-update.
          </p>
        </header>

        {/* Success */}
        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 text-sm font-medium">
                Transaksi berhasil disimpan!
              </p>
              <p className="text-emerald-400/70 text-xs mt-1">
                Mengalihkan ke dashboard…
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form
          onSubmit={simpan}
          className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-6 md:p-8 backdrop-blur-xl space-y-7 animate-slideUp"
        >
          {/* Type tabs */}
          <div>
            <label className="block mb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Tipe Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <button
                type="button"
                onClick={() => setTypeFilter("expense")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !isIncome
                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("income")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isIncome
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Pemasukan
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

          {/* Amount — Hero Input */}
          <div>
            <label className="block mb-3 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 text-2xl font-light">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                disabled={loading || success}
                className={`w-full pl-14 pr-4 py-5 rounded-2xl bg-white/[0.03] border text-3xl md:text-4xl font-semibold tracking-tight tabular-nums focus:outline-none focus:ring-2 transition-all ${
                  isIncome
                    ? "border-emerald-500/20 focus:border-emerald-500/50 focus:ring-emerald-500/10 text-emerald-300"
                    : "border-rose-500/20 focus:border-rose-500/50 focus:ring-rose-500/10 text-rose-300"
                }`}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {[10000, 50000, 100000, 500000].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => tambahNominal(n)}
                  disabled={loading || success}
                  className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-zinc-300 font-medium transition-all"
                >
                  +{n.toLocaleString("id-ID")}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={resetAmount}
                  disabled={loading || success}
                  className="px-3 py-1.5 rounded-full bg-rose-500/[0.06] hover:bg-rose-500/[0.12] border border-rose-500/20 text-xs text-rose-300 font-medium transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Judul Transaksi
            </label>
            <div className="relative group">
              <Receipt
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors"
              />
              <input
                type="text"
                placeholder="Contoh: Gaji bulan November"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading || success}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Akun
            </label>
            <div className="relative group">
              <Wallet
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-400 transition-colors pointer-events-none z-10"
              />
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={loading || success}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900">
                  {accounts.length === 0
                    ? "-- Belum ada akun --"
                    : "-- Pilih akun --"}
                </option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-zinc-900">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {accounts.length === 0 && (
              <Link
                href="/akun/edit"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat akun terlebih dahulu
              </Link>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
              Kategori
            </label>

            {loadingCategories ? (
              <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memuat kategori…
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-xs text-zinc-500 py-3">
                Tidak ada kategori {isIncome ? "pemasukan" : "pengeluaran"}.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCategories.map((cat) => {
                  const active = Number(categoryId) === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(String(cat.id))}
                      disabled={loading || success}
                      className={`group relative px-3 py-3 rounded-xl border text-left transition-all ${
                        active
                          ? isIncome
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                            : "bg-rose-500/10 border-rose-500/40 text-rose-200"
                          : "bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag
                          className={`w-3.5 h-3.5 shrink-0 ${
                            active
                              ? isIncome
                                ? "text-emerald-400"
                                : "text-rose-400"
                              : "text-zinc-500"
                          }`}
                        />
                        <span className="text-xs font-medium truncate">
                          {cat.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedCategory && (
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                <span>Dipilih:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                    isIncome
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  }`}
                >
                  {isIncome ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {selectedCategory.name}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 border-t border-white/[0.06]">
            <Link
              href="/dashboard"
              className="flex items-center justify-center px-5 py-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] text-zinc-400 hover:text-white text-sm font-medium transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 group relative inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-900 font-semibold text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan…
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Tersimpan
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Tips Pengisian
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-zinc-500 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-amber-400/60">—</span>
              Gunakan judul yang deskriptif agar mudah ditelusuri nanti
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400/60">—</span>
              Pilih tipe (Pemasukan/Pengeluaran) terlebih dahulu untuk filter
              kategori
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400/60">—</span>
              Saldo akun otomatis ter-update sesuai jenis transaksi
            </li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out both; }
        .animate-slideUp { animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
      `}</style>
    </div>
  );
}
