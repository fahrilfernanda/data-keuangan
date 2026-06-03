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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setLoading(false);
        return;
      }

      if (!user) {
      setLoading(false);
        window.location.href = "/login";
      return;
}
      setUserName(user.email?.split("@")[0] || "User");

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          amount,
          categories (
            type
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      let totalIncome = 0;
      let totalExpense = 0;

      (data || []).forEach((item: any) => {
        const category = Array.isArray(item.categories)
          ? item.categories[0]
          : item.categories;

        const type = category?.type;

        if (type === "income") {
          totalIncome += Number(item.amount);
        }

        if (type === "expense") {
          totalExpense += Number(item.amount);
        }
      });

      setIncome(totalIncome);
      setExpense(totalExpense);
      setSaldo(totalIncome - totalExpense);
    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  }

 async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    window.location.replace("/data-keuangan/login");
  } catch (err) {
    console.error("Logout error:", err);
  }
}
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">

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

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 border border-emerald-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
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

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 border border-red-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
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

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 border border-blue-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300 cursor-default">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <Link
            href="/transaksi/tambah"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <h3 className="text-white font-semibold text-lg mb-1">
              Tambah Transaksi
            </h3>

            <p className="text-slate-400 text-sm">
              Catat pemasukan atau pengeluaran
            </p>
          </Link>

          <Link
            href="/transaksi"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <h3 className="text-white font-semibold text-lg mb-1">
              Riwayat Transaksi
            </h3>

            <p className="text-slate-400 text-sm">
              Lihat semua transaksi Anda
            </p>
          </Link>

          <Link
            href="/laporan"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <h3 className="text-white font-semibold text-lg mb-1">
              Laporan
            </h3>

            <p className="text-slate-400 text-sm">
              Analisis keuangan Anda
            </p>
          </Link>

          <Link
            href="/profile"
            className="group relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <h3 className="text-white font-semibold text-lg mb-1">
              Profil
            </h3>

            <p className="text-slate-400 text-sm">
              Kelola akun Anda
            </p>
          </Link>

        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>✨ Kelola keuangan Anda dengan lebih baik</p>
        </div>

      </div>
    </div>
  );
}