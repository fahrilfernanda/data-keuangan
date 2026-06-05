  "use client";

  import { useEffect, useState } from "react";
  import Link from "next/link";
  import { supabase } from "@/lib/supabase";
  import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Target,
    Plus,
    Receipt,
    LineChart,
    UserCircle2,
    LogOut,
    Sparkles,
    TrendingUp,
    ChevronRight,
    Eye,
    EyeOff,
    Pencil,
    Check,
    X,
  } from "lucide-react";

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
    const [hideBalance, setHideBalance] = useState(false);

    useEffect(() => {
      loadData();
    }, []);

    useEffect(() => {
      const savedShowTarget = localStorage.getItem("showTarget");
      if (savedShowTarget !== null) {
        setShowTarget(JSON.parse(savedShowTarget));
      }
      const savedTarget = localStorage.getItem("targetTabungan");
      if (savedTarget !== null) {
        const num = Number(savedTarget);
        setTargetTabungan(num);
        setInputTarget(num.toLocaleString("id-ID"));
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
        const { data: profile } = await supabase
        .from("profile")
        .select("nama")
        .eq("id", user.id)
        .single();

        console.log(profile);

        setUserName(
        profile?.nama ||
        user.email?.split("@")[0] ||
        "User"
      );

        const { error: accountsError } = await supabase
          .from("accounts")
          .select("balance")
          .eq("user_id", user.id);

        if (accountsError) {
          console.error(accountsError);
        }

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

          if (type === "income") totalIncome += Number(item.amount);
          if (type === "expense") totalExpense += Number(item.amount);
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

    function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
      setInputTarget(formatRupiah(e.target.value));
    }

    function formatRupiah(value: string) {
      const number = value.replace(/\D/g, "");
      return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function maskAmount(value: number) {
      if (hideBalance) return "•• ••• •••";
      return value.toLocaleString("id-ID");
    }

    const progress =
      targetTabungan > 0 ? Math.min((saldo / targetTabungan) * 100, 100) : 0;
    const remaining = Math.max(targetTabungan - saldo, 0);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0d10] text-white">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
            </div>
            <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase font-medium">
              Memuat Dashboard
            </p>
          </div>
        </div>
      );
    }

    const greeting = (() => {
      const h = new Date().getHours();
      if (h < 11) return "Selamat pagi";
      if (h < 15) return "Selamat siang";
      if (h < 19) return "Selamat sore";
      return "Selamat malam";
    })();

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
          <nav className="flex items-center justify-between mb-14 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-white/90">
                Dasboard
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </nav>

          {/* Hero */}
          <header className="mb-14 animate-fadeIn">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400/80 mb-3 font-medium">
              {greeting}
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-3">
              Halo,{" "}
              <span className="italic font-light text-amber-200/90">
                {userName}
              </span>
            </h1>
            <p className="text-zinc-500 text-sm md:text-base max-w-md font-light">
              Berikut ringkasan keuangan Anda hari ini. Tetap konsisten untuk
              mencapai target.
            </p>
          </header>

          {/* Balance hero card */}
          <section
            className="mb-6 animate-slideUp"
            style={{ animationDelay: "80ms" }}
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/[0.06] p-8 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.08] rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-500/[0.05] rounded-full blur-3xl" />

              <div className="relative flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-[0.25em] font-medium mb-3">
                    <Wallet className="w-3.5 h-3.5" />
                    Saldo Total
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-zinc-500 text-2xl font-light">Rp</span>
                    <span
                      className={`text-5xl md:text-7xl font-semibold tracking-tight tabular-nums ${
                        saldo >= 0 ? "text-white" : "text-rose-400"
                      }`}
                    >
                      {maskAmount(saldo)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setHideBalance(!hideBalance)}
                  className="p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
                  aria-label="toggle balance visibility"
                >
                  {hideBalance ? (
                    <EyeOff className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>

              <div className="relative grid grid-cols-2 gap-4 pt-6 border-t border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    Pemasukan
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-emerald-300 tabular-nums">
                    Rp {maskAmount(income)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    Pengeluaran
                  </div>
                  <p className="text-xl md:text-2xl font-semibold text-rose-300 tabular-nums">
                    Rp {maskAmount(expense)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                  {(() => {
                    const total = income + expense || 1;
                    const incomePct = (income / total) * 100;
                    return (
                      <>
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          style={{ width: `${incomePct}%` }}
                        />
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
                          style={{ width: `${100 - incomePct}%` }}
                        />
                      </>
                    );
                  })()}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-zinc-500 uppercase tracking-wider">
                  <span>Cashflow</span>
                  <span
                    className={
                      saldo >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {saldo >= 0 ? "Positif" : "Negatif"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Small stat cards */}
          <section
            className="grid grid-cols-2 gap-3 md:gap-4 mb-10 animate-slideUp"
            style={{ animationDelay: "150ms" }}
          >
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Income
                </p>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
              <p className="text-lg md:text-xl font-semibold text-white tabular-nums">
                Rp {maskAmount(income)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Expense
                </p>
                <div className="w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                </div>
              </div>
              <p className="text-lg md:text-xl font-semibold text-white tabular-nums">
                Rp {maskAmount(expense)}
              </p>
            </div>
          </section>

          {/* Target Tabungan */}
          {showTarget && (
            <section
              className="mb-10 animate-slideUp"
              style={{ animationDelay: "220ms" }}
            >
              <div className="rounded-3xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/[0.06] p-7 md:p-9 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 mb-7">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Target Tabungan
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Capai tujuan keuangan langkah demi langkah
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditTarget(!editTarget)}
                      className="p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all"
                      aria-label="edit target"
                    >
                      {editTarget ? (
                        <X className="w-3.5 h-3.5" />
                      ) : (
                        <Pencil className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowTarget(false);
                        localStorage.setItem("showTarget", JSON.stringify(false));
                      }}
                      className="p-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all"
                      aria-label="hide target"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editTarget && (
                  <div className="mb-7 flex gap-2 animate-fadeIn">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={inputTarget}
                        onChange={handleTargetChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all tabular-nums"
                        placeholder="10.000.000"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newTarget = Number(inputTarget.replace(/\./g, ""));
                        setTargetTabungan(newTarget);
                        localStorage.setItem("targetTabungan", String(newTarget));
                        setEditTarget(false);
                      }}
                      className="px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-900 font-semibold text-sm transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Simpan
                    </button>
                  </div>
                )}

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                      Terkumpul
                    </p>
                    <p className="text-3xl md:text-4xl font-semibold tabular-nums">
                      <span className="text-zinc-500 text-base font-light mr-1">
                        Rp
                      </span>
                      {maskAmount(Math.max(saldo, 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1.5">
                      dari
                    </p>
                    <p className="text-base text-zinc-400 font-medium tabular-nums">
                      Rp {targetTabungan.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs font-semibold text-amber-300 tabular-nums">
                      {progress.toFixed(1)}%
                    </span>
                    <span className="text-xs text-zinc-500">
                      Sisa{" "}
                      <span className="text-white font-medium tabular-nums">
                        Rp {remaining.toLocaleString("id-ID")}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!showTarget && (
            <section className="mb-10 animate-slideUp">
              <button
                onClick={() => {
                  setShowTarget(true);
                  localStorage.setItem("showTarget", JSON.stringify(true));
                }}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-sm text-zinc-300 hover:text-white transition-all"
              >
                <Target className="w-4 h-4 text-amber-400" />
                Aktifkan Target Tabungan
              </button>
            </section>
          )}

          {/* Quick actions */}
          <section
            className="mb-10 animate-slideUp"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-end justify-between mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Aksi Cepat
              </h3>
              <span className="text-xs text-zinc-600">5 menu</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  href: "/transaksi/tambah",
                  label: "Tambah",
                  sub: "Catat transaksi baru",
                  icon: Plus,
                  accent: "text-amber-300 bg-amber-500/10 border-amber-500/20",
                  primary: true,
                },
                {
                  href: "/transaksi",
                  label: "Riwayat",
                  sub: "Semua transaksi",
                  icon: Receipt,
                  accent: "text-zinc-300 bg-white/[0.04] border-white/[0.06]",
                },
                {
                  href: "/laporan",
                  label: "Laporan",
                  sub: "Analisis & insight",
                  icon: LineChart,
                  accent: "text-zinc-300 bg-white/[0.04] border-white/[0.06]",
                },
                {
                  href: "/akun/edit",
                  label: "Akun",
                  sub: "Kelola rekening",
                  icon: Wallet,
                  accent: "text-zinc-300 bg-white/[0.04] border-white/[0.06]",
                },
                {
                  href: "/profile",
                  label: "Profil",
                  sub: "Pengaturan akun",
                  icon: UserCircle2,
                  accent: "text-zinc-300 bg-white/[0.04] border-white/[0.06]",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                      item.primary
                        ? "bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 hover:shadow-2xl hover:shadow-amber-500/20"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${
                        item.primary
                          ? "bg-zinc-900/20 border-zinc-900/20 text-zinc-900"
                          : item.accent
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2.2} />
                    </div>
                    <p
                      className={`text-sm font-semibold tracking-tight ${
                        item.primary ? "text-zinc-900" : "text-white"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        item.primary ? "text-zinc-900/70" : "text-zinc-500"
                      }`}
                    >
                      {item.sub}
                    </p>
                    <ChevronRight
                      className={`w-4 h-4 absolute top-5 right-5 transition-transform group-hover:translate-x-0.5 ${
                        item.primary ? "text-zinc-900/60" : "text-zinc-600"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </section>

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
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn { animation: fadeIn 0.7s ease-out both; }
          .animate-slideUp { animation: slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        `}</style>
      </div>
    );
  }