"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import router from "next/dist/shared/lib/router/router";

export default function DashboardPage() {
  const [saldo, setSaldo] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [targetTabungan, setTargetTabungan] = useState(10000000);
  const [showTarget, setShowTarget] = useState<boolean>(true);
  const [editTarget, setEditTarget] = useState(false);
  const [inputTarget, setInputTarget] = useState("10.000.000");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
  const savedShowTarget =
    localStorage.getItem("showTarget");

  if (savedShowTarget !== null) {
    setShowTarget(
      JSON.parse(savedShowTarget)
    );
  }
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

      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("user_id", user.id);

      if (accountsError) {
        console.error(accountsError);
        setLoading(false);
        return;
      }

      const totalAccountBalance = (accountsData || []).reduce(
        (sum: number, account: any) => sum + Number(account.balance),
        0
      );

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
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputTarget(formatRupiah(e.target.value));
  }

  function formatRupiah(value: string) {
    const number = value.replace(/\D/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  const progress =
    targetTabungan > 0 ? Math.min((saldo / targetTabungan) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements - UNCHANGED */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 flex justify-between items-start md:items-center flex-col md:flex-row gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Selamat datang,
            </h1>
            <p className="text-slate-400 text-lg font-medium tracking-wide">
              {userName}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="group px-6 py-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-900/50 flex items-center gap-2"
          >
            <span>Keluar</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {/* Income Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 border border-emerald-500 border-opacity-30 hover:border-opacity-50 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-900/50 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-emerald-100 font-semibold text-sm uppercase tracking-wide opacity-90">
                  Total Pemasukan
                </h2>
                <div className="text-2xl animate-bounce">↑</div>
              </div>

              <p className="text-3xl md:text-4xl font-bold text-white mb-3">
                Rp {income.toLocaleString("id-ID")}
              </p>

              <p className="text-emerald-100 text-xs opacity-75">
                Saat ini
              </p>
            </div>
          </div>

          {/* Expense Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 border border-red-500 border-opacity-30 hover:border-opacity-50 transition-all duration-500 hover:shadow-lg hover:shadow-red-900/50 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-red-100 font-semibold text-sm uppercase tracking-wide opacity-90">
                  Total Pengeluaran
                </h2>
                <div className="text-2xl animate-bounce">↓</div>
              </div>

              <p className="text-3xl md:text-4xl font-bold text-white mb-3">
                Rp {expense.toLocaleString("id-ID")}
              </p>

              <p className="text-red-100 text-xs opacity-75">
                Saat ini
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 border border-blue-500 border-opacity-30 hover:border-opacity-50 transition-all duration-500 hover:shadow-lg hover:shadow-blue-900/50 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-blue-100 font-semibold text-sm uppercase tracking-wide opacity-90">
                  Saldo Saat Ini
                </h2>
                <div className="text-2xl">◆</div>
              </div>

              <p
                className={`text-3xl md:text-4xl font-bold mb-3 ${
                  saldo >= 0 ? "text-white" : "text-red-200"
                }`}
              >
                Rp {saldo.toLocaleString("id-ID")}
              </p>

              <p className="text-blue-100 text-xs opacity-75">
                Saldo tersedia
              </p>
            </div>
          </div>
        </div>

        {/* Target Savings Section */}
        {showTarget && (
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-10 shadow-xl backdrop-blur-sm animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Target Tabungan
                </h2>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50">
                  <span className="text-slate-400 text-sm">Target:</span>
                  <span className="text-white font-semibold">
                    Rp {targetTabungan.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditTarget(!editTarget)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    editTarget
                      ? "bg-slate-600 hover:bg-slate-500 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-900/50"
                  }`}
                >
                  {editTarget ? "Batal" : "Ubah Target"}
                </button>

                <button
                  onClick={() => {
                    setShowTarget(false);
                    localStorage.setItem(
                      "showTarget",
                      JSON.stringify(false)
                    );
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-all duration-300"
                >
                  Tutup
                </button>
              </div>
            </div>

            {editTarget && (
              <div className="mb-6 flex gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputTarget}
                  onChange={handleTargetChange}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Masukkan target tabungan"
                />

                <button
                  onClick={() => {
                    setTargetTabungan(Number(inputTarget.replace(/\./g, "")));
                    setEditTarget(false);
                  }}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-green-900/50"
                >
                  Simpan
                </button>
              </div>
            )}

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-end gap-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                    Terkumpul
                  </p>
                  <p className="text-3xl font-bold text-white">
                    Rp {saldo.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
                    Persentase
                  </p>
                  <p className="text-3xl font-bold bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 text-transparent">
                    {progress.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-emerald-600 transition-all duration-700 rounded-full shadow-lg shadow-green-500/50"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 text-xs">
                    0 Rp
                  </span>
                  <span className="text-slate-500 text-xs">
                    Rp {targetTabungan.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Remaining Amount */}
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-slate-700/30 to-slate-700/10 border border-slate-600/20">
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
                  Sisa yang dibutuhkan
                </p>
                <p className="text-2xl font-bold text-white">
                  Rp {Math.max(targetTabungan - saldo, 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <Link
            href="/akun/edit"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-700 hover:to-slate-700/50 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-500 transform hover:scale-105"
          >
            <div className="relative z-10">
              <div className="text-3xl mb-3">🏦</div>

              <h3 className="text-white font-bold text-lg mb-2">
                Kelola Akun
              </h3>

              <p className="text-slate-400 text-sm">
                Tambah dan kelola rekening
              </p>
            </div>
          </Link>
          
          <Link
            href="/transaksi/tambah"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-700 hover:to-slate-700/50 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-3xl mb-3">➕</div>
              <h3 className="text-white font-bold text-lg mb-2">
                Tambah Transaksi
              </h3>
              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Catat pemasukan atau pengeluaran
              </p>
            </div>
          </Link>

          <Link
            href="/transaksi"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-700 hover:to-slate-700/50 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-white font-bold text-lg mb-2">
                Riwayat Transaksi
              </h3>
              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Lihat semua transaksi Anda
              </p>
            </div>
          </Link>

          <Link
            href="/laporan"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-700 hover:to-slate-700/50 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-amber-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-white font-bold text-lg mb-2">
                Laporan
              </h3>
              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Analisis keuangan Anda
              </p>
            </div>
          </Link>

          <Link
            href="/profile"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 hover:from-slate-700 hover:to-slate-700/50 border border-slate-700 hover:border-slate-600 p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-lg hover:shadow-pink-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="text-white font-bold text-lg mb-2">
                Profil
              </h3>
              <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
                Kelola akun Anda
              </p>
            </div>
          </Link>
        </div>

        {/* Reactivate Target Button */}
        {!showTarget && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <button
              onClick={() => {
                setShowTarget(true);
                localStorage.setItem(
                  "showTarget",
                  JSON.stringify(true)
                );
              }}
              className="group px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-900/50 flex items-center gap-2"
            >
              <span>🎯</span>
              <span>Aktifkan Target Tabungan</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>✨ Kelola keuangan Anda dengan lebih baik</p>
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
      `}</style>
    </div>
  );
}
