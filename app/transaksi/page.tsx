"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  const [filterType, setFilterType] =
  useState("all");
  const [search, setSearch] =
  useState("");
  const [deleteLoading, setDeleteLoading] =
  useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] =
    useState<number | null>(null);

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

  const transaksi = data.find(
    (item) => item.id === id
  );

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
        balance:
          Number(akun.balance) +
          perubahan,
      })
      .eq("id", transaksi.account_id);
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

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
    filterType === "all"
      ? true
      : item.categories?.type === filterType;

  const cocokSearch =
    item.title
      .toLowerCase()
      .includes(
        search.toLowerCase()
      ) ||
    item.categories?.name
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      );

  return cocokKategori && cocokSearch;
});

  const totalIncome = data
    .filter(
      (item) => item.categories?.type === "income"
    )
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = data
    .filter(
      (item) => item.categories?.type === "expense"
    )
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">
              Riwayat Transaksi
            </h1>
            <p className="text-slate-400">
              Kelola dan lihat semua transaksi Anda
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all duration-200 flex items-center gap-2"
            >
              ← Kembali
            </Link>
            <Link
              href="/transaksi/tambah"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Tambah Transaksi
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-900 bg-opacity-30 border border-emerald-500 border-opacity-20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-semibold mb-1">
                  Total Pemasukan
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  Rp{" "}
                  {totalIncome.toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>

            <div className="bg-red-900 bg-opacity-30 border border-red-500 border-opacity-20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-semibold mb-1">
                  Total Pengeluaran
                </p>
                <p className="text-2xl font-bold text-red-400">
                  Rp{" "}
                  {totalExpense.toLocaleString(
                    "id-ID"
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType("income")}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
              filterType === "income"
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() =>
              setFilterType("expense")
            }
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
              filterType === "expense"
                ? "bg-red-600 text-white"
                : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        <div className="mb-6">
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30 outline-none transition-all duration-200"
        />
      </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-800 rounded-xl border border-slate-700 animate-pulse"
              ></div>
            ))
          ) : filteredData.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 rounded-2xl border border-slate-700">
              <div className="text-6xl mb-4">
                📭
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Belum ada transaksi
              </h3>
              <p className="text-slate-400 mb-6">
                {filterType === "all"
                  ? "Mulai catat transaksi Anda sekarang"
                  : `Belum ada transaksi ${
                      filterType === "income"
                        ? "pemasukan"
                        : "pengeluaran"
                    }`}
              </p>
              <Link
                href="/transaksi/tambah"
                className="inline-block px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200"
              >
                Tambah Transaksi Pertama
              </Link>
            </div>
          ) : (
            filteredData.map((item) => {
              const isIncome =
                item.categories?.type === "income";
              const isDeleting =
                deleteLoading === item.id;
              const showDeleteConfirm =
                deleteConfirm === item.id;

              return (
                <div key={item.id}>
                  <div className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-200 p-6 flex items-center justify-between gap-4 group">
                    {/* Left Content */}
                    <div className="flex-1 flex items-center gap-4">
                      <div
                        className={`text-3xl ${
                          isIncome
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isIncome ? "↑" : "↓"}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isIncome
                                ? "bg-emerald-500 bg-opacity-20 text-emerald-300"
                                : "bg-red-500 bg-opacity-20 text-red-300"
                            }`}
                          >
                            {item.categories
                              ?.name}
                          </span>
                          <span className="text-slate-400">
                            {new Date(
                              item.transaction_date
                            ).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
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
                          className={`text-2xl font-bold ${
                            isIncome
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {isIncome ? "+" : "-"}
                          {Number(
                            item.amount
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>

                      {!showDeleteConfirm ? (
                      <div className="flex gap-2">
                        <Link
                          href={`/transaksi/edit?id=${item.id}`}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white transition-all duration-200"
                          aria-label="Edit transaction"
                        >
                          ✏️
                        </Link>

                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete transaction"
                        >
                          🗑
                        </button>
                      </div>
                    ) : (
                      <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-3 flex gap-2">
                        <button
                          onClick={() => hapusTransaksi(item.id)}
                          disabled={isDeleting}
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          {isDeleting ? "..." : "Hapus"}
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={isDeleting}
                          className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        {!loading && filteredData.length > 0 && (
          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>
              Menampilkan {filteredData.length} dari{" "}
              {data.length} transaksi
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
