"use client";

import { ChartOptions } from "chart.js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import {
  ArrowLeft,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart3,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LaporanPage() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number[]>(
    Array(12).fill(0)
  );
  const [monthlyExpense, setMonthlyExpense] = useState<number[]>(
    Array(12).fill(0)
  );
  const [loading, setLoading] = useState(true);

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
        .select(`amount, transaction_date, categories(type)`)
        .eq("user_id", user?.id);

      let pemasukan = 0;
      let pengeluaran = 0;
      const incomeByMonth = Array(12).fill(0);
      const expenseByMonth = Array(12).fill(0);

      data?.forEach((item: any) => {
        const month = new Date(item.transaction_date).getMonth();
        const amt = Number(item.amount);
        if (item.categories?.type === "income") {
          pemasukan += amt;
          incomeByMonth[month] += amt;
        } else {
          pengeluaran += amt;
          expenseByMonth[month] += amt;
        }
      });

      setMonthlyIncome(incomeByMonth);
      setMonthlyExpense(expenseByMonth);

      setIncome(pemasukan);
      setExpense(pengeluaran);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const balance = income - expense;
  const expenseRatio =
    income > 0 ? Math.round((expense / income) * 100) : 0;
  const savingsRate =
    income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

  const chartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ],

    datasets: [
      {
        label: "Pemasukan",
        data: monthlyIncome,
        borderColor: "#34d399",
        backgroundColor: (ctx: any) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(52,211,153,0.1)";
          const gradient = c.createLinearGradient(
            0, chartArea.top, 0, chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(52,211,153,0.25)");
          gradient.addColorStop(1, "rgba(52,211,153,0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "#34d399",
        pointBorderColor: "#0b0d10",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: "Pengeluaran",
        data: monthlyExpense,
        borderColor: "#fb7185",
        backgroundColor: (ctx: any) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(251,113,133,0.1)";
          const gradient = c.createLinearGradient(
            0, chartArea.top, 0, chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(251,113,133,0.25)");
          gradient.addColorStop(1, "rgba(251,113,133,0)");
          return gradient;
        },
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointBackgroundColor: "#fb7185",
        pointBorderColor: "#0b0d10",
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: {
          color: "#a1a1aa",
          font: { size: 11, family: "system-ui" },
          boxWidth: 8,
          boxHeight: 8,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15,15,18,0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 12,
        titleColor: "#fbbf24",
        titleFont: { size: 11, weight: 600 },
        bodyColor: "#e4e4e7",
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: Rp ${Number(ctx.parsed.y).toLocaleString(
              "id-ID"
            )}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#71717a", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
      },
      y: {
        ticks: {
          color: "#71717a",
          font: { size: 11 },
          callback: (val: any) =>
            val >= 1_000_000
              ? `${val / 1_000_000}jt`
              : val >= 1000
              ? `${val / 1000}rb`
              : val,
        },
        grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
      },
    },
  };

  // Insights logic
  const insights = [];
  if (expenseRatio > 0 && expenseRatio < 50) {
    insights.push({
      icon: CheckCircle2,
      color: "emerald",
      title: "Sangat Baik",
      text: `Pengeluaran Anda hanya ${expenseRatio}% dari pemasukan. Kondisi keuangan cukup sehat.`,
    });
  }
  if (expenseRatio >= 50 && expenseRatio <= 80) {
    insights.push({
      icon: Info,
      color: "amber",
      title: "Stabil",
      text: "Pengeluaran masih dalam batas aman, namun tetap perhatikan pengeluaran rutin.",
    });
  }
  if (expenseRatio > 80) {
    insights.push({
      icon: AlertTriangle,
      color: "rose",
      title: "Perhatian",
      text: `Pengeluaran mencapai ${expenseRatio}% dari pemasukan. Pertimbangkan untuk mengurangi pengeluaran tidak penting.`,
    });
  }
  if (savingsRate >= 20) {
    insights.push({
      icon: PiggyBank,
      color: "emerald",
      title: "Tabungan Sehat",
      text: `Anda berhasil menyisihkan ${savingsRate}% dari pemasukan sebagai tabungan.`,
    });
  }
  if (balance > 0) {
    insights.push({
      icon: TrendingUp,
      color: "amber",
      title: "Saldo Positif",
      text: `Saldo bersih Anda saat ini Rp ${balance.toLocaleString("id-ID")}.`,
    });
  }

  const insightColors: Record<string, string> = {
    emerald: "bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300",
    amber: "bg-amber-500/[0.06] border-amber-500/20 text-amber-300",
    rose: "bg-rose-500/[0.06] border-rose-500/20 text-rose-300",
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white relative overflow-hidden font-sans">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-amber-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-emerald-500/[0.05] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
        {/* Nav */}
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
              Laporan Keuangan
            </span>
          </div>
        </nav>

        {/* Header */}
        <header className="mb-10 animate-fadeIn">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-3 font-medium">
            Analitik
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-3">
            Laporan{" "}
            <span className="italic font-light text-amber-200/90">
              Keuangan
            </span>
          </h1>
          <p className="text-zinc-500 text-sm font-light max-w-md">
            Ringkasan detail arus kas, tren bulanan, dan rekomendasi finansial
            Anda.
          </p>
        </header>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/[0.02] border border-white/[0.05] p-8 animate-pulse"
              >
                <div className="h-3 bg-white/[0.05] rounded w-1/3 mb-4" />
                <div className="h-8 bg-white/[0.05] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <section
              className="grid md:grid-cols-3 gap-4 mb-6 animate-slideUp"
              style={{ animationDelay: "80ms" }}
            >
              {/* Income */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/[0.06] p-7">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.08] rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                      Pemasukan
                    </p>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl font-semibold text-emerald-300 tabular-nums">
                    <span className="text-zinc-500 text-base font-light mr-1">
                      Rp
                    </span>
                    {income.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* Expense */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/[0.06] p-7">
                <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/[0.08] rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                      Pengeluaran
                    </p>
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                  </div>
                  <p className="text-3xl md:text-4xl font-semibold text-rose-300 tabular-nums">
                    <span className="text-zinc-500 text-base font-light mr-1">
                      Rp
                    </span>
                    {expense.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-3">
                    {expenseRatio}% dari pemasukan
                  </p>
                </div>
              </div>

              {/* Balance */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/[0.06] p-7">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/[0.08] rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-medium">
                      Saldo Bersih
                    </p>
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                  </div>
                  <p
                    className={`text-3xl md:text-4xl font-semibold tabular-nums ${
                      balance >= 0 ? "text-white" : "text-rose-400"
                    }`}
                  >
                    <span className="text-zinc-500 text-base font-light mr-1">
                      Rp
                    </span>
                    {balance.toLocaleString("id-ID")}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mt-3">
                    {savingsRate}% tingkat tabungan
                  </p>
                </div>
              </div>
            </section>

            {/* Chart */}
            <section
              className="mb-6 animate-slideUp"
              style={{ animationDelay: "150ms" }}
            >
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-6 md:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight">
                        Tren Bulanan
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Pemasukan vs Pengeluaran sepanjang tahun
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-64 md:h-72">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            </section>

            {/* Composition + Insights */}
            <section
              className="grid md:grid-cols-2 gap-4 mb-6 animate-slideUp"
              style={{ animationDelay: "220ms" }}
            >
              {/* Composition */}
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 backdrop-blur-xl">
                <h3 className="text-base font-semibold tracking-tight mb-1">
                  Komposisi Anggaran
                </h3>
                <p className="text-xs text-zinc-500 mb-7">
                  Distribusi pemasukan Anda
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-400">
                        Pengeluaran
                      </span>
                      <span className="text-sm font-semibold text-rose-300 tabular-nums">
                        {expenseRatio}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(expenseRatio, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-zinc-400">Tabungan</span>
                      <span className="text-sm font-semibold text-emerald-300 tabular-nums">
                        {Math.max(savingsRate, 0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.max(Math.min(savingsRate, 100), 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-7 pt-6 border-t border-white/[0.06] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                      Rasio Pengeluaran
                    </p>
                    <p className="text-xl font-semibold text-white tabular-nums">
                      {expenseRatio}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">
                      Savings Rate
                    </p>
                    <p className="text-xl font-semibold text-white tabular-nums">
                      {savingsRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 backdrop-blur-xl">
                <h3 className="text-base font-semibold tracking-tight mb-1">
                  Insights & Rekomendasi
                </h3>
                <p className="text-xs text-zinc-500 mb-6">
                  Analisis berdasarkan data Anda
                </p>

                <div className="space-y-3">
                  {insights.length === 0 ? (
                    <div className="text-sm text-zinc-500 py-6 text-center">
                      Belum cukup data untuk membuat insight.
                    </div>
                  ) : (
                    insights.map((ins, i) => {
                      const Icon = ins.icon;
                      return (
                        <div
                          key={i}
                          className={`flex gap-3 p-3.5 rounded-xl border ${insightColors[ins.color]}`}
                        >
                          <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold mb-1">
                              {ins.title}
                            </p>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              {ins.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* Detailed Summary */}
            <section
              className="animate-slideUp"
              style={{ animationDelay: "300ms" }}
            >
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 md:p-8 backdrop-blur-xl">
                <h3 className="text-base font-semibold tracking-tight mb-7">
                  Ringkasan Detail
                </h3>

                <div className="grid md:grid-cols-2 gap-8 mb-7">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
                      Total Pemasukan
                    </p>
                    <p className="text-3xl font-semibold text-emerald-300 tabular-nums">
                      Rp {income.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
                      Total Pengeluaran
                    </p>
                    <p className="text-3xl font-semibold text-rose-300 tabular-nums">
                      Rp {expense.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="pt-7 border-t border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2">
                    Saldo Akhir
                  </p>
                  <p
                    className={`text-4xl md:text-5xl font-semibold tabular-nums ${
                      balance >= 0 ? "text-white" : "text-rose-400"
                    }`}
                  >
                    <span className="text-zinc-500 text-xl font-light mr-2">
                      Rp
                    </span>
                    {balance.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </section>

            <footer className="pt-8 mt-10 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-xs text-zinc-600">
                Laporan diperbarui real-time berdasarkan transaksi Anda
              </p>
              <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Tersinkron otomatis
              </div>
            </footer>
          </>
        )}
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