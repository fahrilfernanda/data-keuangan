"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  type: string;
};

export default function TambahTransaksi() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] =
    useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] =
    useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadKategori();
  }, []);

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

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError(
        "Judul transaksi tidak boleh kosong"
      );
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError(
        "Jumlah harus lebih dari 0"
      );
      return;
    }

    if (!categoryId) {
      setError("Pilih kategori terlebih dahulu");
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

    const { error: insertError } =
      await supabase.from("transactions").insert({
        user_id: user.id,
        title,
        amount: Number(amount),
        category_id: Number(categoryId),
        transaction_date: new Date()
          .toISOString()
          .split("T")[0],
      });

    setLoading(false);

    if (insertError) {
      console.error(insertError);
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTitle("");
    setAmount("");
    setCategoryId("");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  }

  const selectedCategory = categories.find(
    (cat) => cat.id === Number(categoryId)
  );
  const incomeCategories = categories.filter(
    (cat) => cat.type === "income"
  );
  const expenseCategories = categories.filter(
    (cat) => cat.type === "expense"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Tambah Transaksi
            </h1>
            <p className="text-slate-400">
              Catat transaksi keuangan Anda
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all duration-200"
          >
            ← Kembali
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-emerald-500 bg-opacity-20 border border-emerald-500 border-opacity-30 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
            <div className="text-emerald-400 text-2xl mt-0.5">
              ✓
            </div>
            <div>
              <p className="font-semibold text-emerald-300">
                Transaksi berhasil disimpan!
              </p>
              <p className="text-sm text-emerald-200 opacity-75">
                Mengalihkan ke dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <form onSubmit={simpan} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-xl p-4 flex items-start gap-3">
                <div className="text-red-400 text-xl mt-0.5">
                  ⚠
                </div>
                <p className="text-sm text-red-200 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Judul Transaksi
              </label>
              <input
                type="text"
                placeholder="Contoh: Gaji, Belanja Groceries, dll"
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-200"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                disabled={loading || success}
              />
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Jumlah (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-semibold">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-200"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value)
                  }
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Kategori
              </label>

              {loadingCategories ? (
                <div className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-slate-400 animate-pulse">
                  Memuat kategori...
                </div>
              ) : (
                <select
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-200 appearance-none cursor-pointer"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  disabled={loading || success}
                >
                  <option value="">
                    -- Pilih Kategori --
                  </option>

                  {incomeCategories.length > 0 && (
                    <optgroup label="Pemasukan">
                      {incomeCategories.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        )
                      )}
                    </optgroup>
                  )}

                  {expenseCategories.length > 0 && (
                    <optgroup label="Pengeluaran">
                      {expenseCategories.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        )
                      )}
                    </optgroup>
                  )}
                </select>
              )}

              {selectedCategory && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Tipe:
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedCategory.type ===
                      "income"
                        ? "bg-emerald-500 bg-opacity-20 text-emerald-300 border border-emerald-500 border-opacity-30"
                        : "bg-red-500 bg-opacity-20 text-red-300 border border-red-500 border-opacity-30"
                    }`}
                  >
                    {selectedCategory.type ===
                    "income"
                      ? "↑ Pemasukan"
                      : "↓ Pengeluaran"}
                  </span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Menyimpan...
                  </>
                ) : success ? (
                  <>
                    <span className="text-lg">✓</span>
                    Tersimpan!
                  </>
                ) : (
                  <>
                    <span className="text-lg">💾</span>
                    Simpan Transaksi
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all duration-200 flex items-center"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-3">
            💡 Tips Pengisian
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>
              • Gunakan judul yang deskriptif agar
              mudah diingat
            </li>
            <li>
              • Pilih kategori yang sesuai
              dengan jenis transaksi
            </li>
            <li>
              • Transaksi akan otomatis disimpan
              dengan tanggal hari ini
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
