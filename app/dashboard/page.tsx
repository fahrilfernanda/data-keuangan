"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [saldo, setSaldo] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserName(user.email?.split("@")[0] || "User");

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          amount,
          categories (
            type
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      let totalIncome = 0;
      let totalExpense = 0;

      data?.forEach((item: any) => {
        const type = item.categories?.type;

        if (type === "income") {
          totalIncome += Number(item.amount);
        } else if (type === "expense") {
          totalExpense += Number(item.amount);
        }
      });

      setIncome(totalIncome);
      setExpense(totalExpense);
      setSaldo(totalIncome - totalExpense);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">
              Selamat datang
            </h1>
            <p className="text-slate-400 text-lg">
              {userName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats - Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-slate-800 rounded-2xl p-8 border border-slate-700 animate-pulse"
              >
                <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Income Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 border border-emerald-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-emerald-100 font-semibold text-sm">
                    Total Pemasukan
                  </h2>
                  <div className="text-3xl text-emerald-200 opacity-80">
                    ↑
                  </div>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white">
                  Rp {income.toLocaleString("id-ID")}
                </p>
                <p className="text-emerald-100 text-xs mt-4 opacity-75">
                  Tahun ini
                </p>
              </div>
            </div>

            {/* Expense Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 border border-red-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-red-100 font-semibold text-sm">
                    Total Pengeluaran
                  </h2>
                  <div className="text-3xl text-red-200 opacity-80">
                    ↓
                  </div>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white">
                  Rp {expense.toLocaleString("id-ID")}
                </p>
                <p className="text-red-100 text-xs mt-4 opacity-75">
                  Tahun ini
                </p>
              </div>
            </div>

            {/* Balance Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 border border-blue-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-blue-100 font-semibold text-sm">
                    Saldo Saat Ini
                  </h2>
                  <div className="text-3xl text-blue-200 opacity-80">
                    ◆
                  </div>
                </div>
                <p
                  className={`text-4xl md:text-5xl font-bold ${
                    saldo >= 0 ? "text-white" : "text-red-200"
                  }`}
                >
                  Rp {saldo.toLocaleString("id-ID")}
                </p>
                <p className="text-blue-100 text-xs mt-4 opacity-75">
                  Saldo tersedia
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/transaksi/tambah"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Tambah Transaksi
                </h3>
                <p className="text-slate-400 text-sm">
                  Catat pemasukan atau pengeluaran
                </p>
              </div>
              <div className="text-2xl text-emerald-400">
                +
              </div>
            </div>
          </Link>

          <Link
            href="/transaksi"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Riwayat Transaksi
                </h3>
                <p className="text-slate-400 text-sm">
                  Lihat semua transaksi Anda
                </p>
              </div>
              <div className="text-2xl text-blue-400">
                📋
              </div>
            </div>
          </Link>

          <Link
            href="/laporan"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Laporan
                </h3>
                <p className="text-slate-400 text-sm">
                  Analisis keuangan Anda
                </p>
              </div>
              <div className="text-2xl text-purple-400">
                📊
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  Profil
                </h3>
                <p className="text-slate-400 text-sm">
                  Kelola akun Anda
                </p>
              </div>
              <div className="text-2xl text-slate-400">
                👤
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>✨ Kelola keuangan Anda dengan lebih baik</p>
        </div>
      </div>
    </div>
  );
}
