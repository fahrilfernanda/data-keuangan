"use client";

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
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function LaporanPage() {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] =
  useState<number[]>(Array(12).fill(0));
  const [monthlyExpense, setMonthlyExpense] =
  useState<number[]>(Array(12).fill(0));
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
        .select(`
        amount,
        transaction_date,
        categories(type)
        `)
        .eq("user_id", user?.id);

      let pemasukan = 0;
      let pengeluaran = 0;

      data?.forEach((item: any) => {
        if (
          item.categories?.type === "income"
        ) {
          pemasukan += Number(item.amount);
        } else {
          pengeluaran += Number(item.amount);
        }
      });

      const incomeByMonth =
        Array(12).fill(0);

      const expenseByMonth =
        Array(12).fill(0);

      data?.forEach((item: any) => {
        const month = new Date(
          item.transaction_date
        ).getMonth();

        if (
          item.categories?.type === "income"
        ) {
          incomeByMonth[month] += Number(
            item.amount
          );
        } else {
          expenseByMonth[month] += Number(
            item.amount
          );
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

    const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],

    datasets: [
      {
        label: "Pemasukan",
        data: monthlyIncome,
        borderColor: "#10b981",
        backgroundColor:
          "rgba(16,185,129,0.2)",
        tension: 0.4,
      },
      {
        label: "Pengeluaran",
        data: monthlyExpense,
        borderColor: "#ef4444",
        backgroundColor:
          "rgba(239,68,68,0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "#334155",
        },
      },
      y: {
        ticks: {
          color: "#cbd5e1",
        },
        grid: {
          color: "#334155",
        },
      },
    },
  };

  const balance = income - expense;
  const expenseRatio =
    income > 0
      ? Math.round((expense / income) * 100)
      : 0;
  const savingsRate =
    income > 0
      ? Math.round(
          ((income - expense) / income) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-1">
              Laporan Keuangan
            </h1>
            <p className="text-slate-400">
              Ringkasan detail keuangan Anda
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-all duration-200"
          >
            ← Kembali
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
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
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Income */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 border border-emerald-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-emerald-100 text-sm font-semibold mb-2">
                    Total Pemasukan
                  </h3>
                  <p className="text-4xl font-bold text-white mb-4">
                    Rp{" "}
                    {income.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                  <div className="text-emerald-100 text-xs opacity-75">
                    ↑ {(income > 0 ? "+100" : "0")}% dari
                    sebelumnya
                  </div>
                </div>
              </div>

              {/* Expense */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-8 border border-red-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-red-100 text-sm font-semibold mb-2">
                    Total Pengeluaran
                  </h3>
                  <p className="text-4xl font-bold text-white mb-4">
                    Rp{" "}
                    {expense.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                  <div className="text-red-100 text-xs opacity-75">
                    {expenseRatio}% dari pemasukan
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 border border-blue-500 border-opacity-20 hover:border-opacity-40 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-blue-100 text-sm font-semibold mb-2">
                    Saldo Bersih
                  </h3>
                  <p
                    className={`text-4xl font-bold mb-4 ${
                      balance >= 0
                        ? "text-white"
                        : "text-red-200"
                    }`}
                  >
                    Rp{" "}
                    {balance.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                  <div className="text-blue-100 text-xs opacity-75">
                    {savingsRate}% tingkat tabungan
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8">
              <h3 className="text-white font-semibold text-lg mb-6">
                📈 Grafik Pemasukan vs Pengeluaran
              </h3>

              <div className="h-56">
              <Line
                data={chartData}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                }}
              />
            </div>
            </div>

            {/* Visualizations */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Expense Ratio */}
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-6">
                  Komposisi Pengeluaran
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">
                        Pengeluaran
                      </span>
                      <span className="text-red-400 font-semibold">
                        {expenseRatio}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${expenseRatio}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-300">
                        Tabungan
                      </span>
                      <span className="text-emerald-400 font-semibold">
                        {savingsRate}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${savingsRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <h3 className="text-white font-semibold text-lg mb-6">
                  Insights & Rekomendasi
                </h3>
                <div className="space-y-4">
                  {expenseRatio < 50 && (
                <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-green-400">
                  <p className="text-slate-200 text-sm">
                    <span className="font-semibold text-green-400">
                      🎉 Sangat Baik:
                    </span>{" "}
                    Pengeluaran Anda hanya {expenseRatio}% dari
                    pemasukan. Kondisi keuangan cukup sehat.
                  </p>
                </div>
              )}

              {expenseRatio >= 50 && expenseRatio <= 80 && (
                <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-slate-200 text-sm">
                    <span className="font-semibold text-blue-400">
                      📊 Stabil:
                    </span>{" "}
                    Pengeluaran masih dalam batas aman,
                    namun tetap perhatikan pengeluaran rutin.
                  </p>
                </div>
              )}

              {expenseRatio > 80 && (
                <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-orange-400">
                  <p className="text-slate-200 text-sm">
                    <span className="font-semibold text-orange-400">
                      ⚠ Perhatian:
                    </span>{" "}
                    Pengeluaran mencapai {expenseRatio}% dari
                    pemasukan. Pertimbangkan untuk mengurangi
                    pengeluaran yang tidak penting.
                  </p>
                </div>
              )}

              {savingsRate >= 20 && (
                <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-emerald-400">
                  <p className="text-slate-200 text-sm">
                    <span className="font-semibold text-emerald-400">
                      💰 Tabungan Sehat:
                    </span>{" "}
                    Anda berhasil menyisihkan {savingsRate}% dari
                    pemasukan sebagai tabungan.
                  </p>
                </div>
              )}

              {balance > 0 && (
                <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-cyan-400">
                  <p className="text-slate-200 text-sm">
                    <span className="font-semibold text-cyan-400">
                      📈 Saldo Positif:
                    </span>{" "}
                    Saldo Anda saat ini Rp{" "}
                    {balance.toLocaleString("id-ID")}.
                  </p>
                </div>
              )}
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <h3 className="text-white font-semibold text-lg mb-6">
                Ringkasan Detail
              </h3>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">
                      TOTAL PEMASUKAN
                    </p>
                    <p className="text-3xl font-bold text-emerald-400">
                      Rp{" "}
                      {income.toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-2">
                      TOTAL PENGELUARAN
                    </p>
                    <p className="text-3xl font-bold text-red-400">
                      Rp{" "}
                      {expense.toLocaleString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-6">
                  <p className="text-slate-400 text-sm mb-2">
                    SALDO AKHIR
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      balance >= 0
                        ? "text-white"
                        : "text-red-400"
                    }`}
                  >
                    Rp{" "}
                    {balance.toLocaleString(
                      "id-ID"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-slate-400 text-sm">
              <p>
                📊 Laporan diperbarui secara
                real-time dari transaksi Anda
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
