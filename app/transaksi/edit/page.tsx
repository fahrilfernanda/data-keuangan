"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  type: string;
};
type Account = {
  id: number;
  name: string;
};

export default function EditTransaksiPage() {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
  const params = new URLSearchParams(
    window.location.search
  );

  const trxId = params.get("id");

  if (!trxId) {
    setLoading(false);
    return;
  }

  setId(trxId);
  loadData(trxId);
}, []);
  
  async function loadData(trxId: string) {
  const { data: trx } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", trxId)
    .single();

    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  setLoading(false);
  return;
}

const { data: accs } = await supabase
  .from("accounts")
  .select("*")
  .eq("user_id", user?.id)
  .order("name");

  const { data: cats } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (trx) {
  setTitle(trx.title);

  setAmount(
    Number(trx.amount).toLocaleString(
      "id-ID"
    )
  );

  setCategoryId(
    String(trx.category_id)
  );

  setAccountId(
    String(trx.account_id)
  );
}

  setCategories(cats || []);
  setAccounts(accs || []);
  setLoading(false);
}
  function formatRupiah(value: string) {
    const number =
      value.replace(/\D/g, "");

    return number.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );
  }

  async function simpan(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!id) return;

    if (!categoryId) {
      alert("Pilih kategori");
      return;
    }

    if (!accountId) {
      alert("Pilih akun");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("transactions")
      .update({
      title,
      amount: Number(
        amount.replace(/\./g, "")
      ),
      category_id: Number(categoryId),
      account_id: Number(accountId),
    })
      .eq("id", id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/transaksi");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto bg-slate-800 p-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">
          Edit Transaksi
        </h1>

        <form
          onSubmit={simpan}
          className="space-y-5"
        >
          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-700 text-white"
          />

          <input
            type="text"
            value={amount}
            onChange={(e) =>
              setAmount(
                formatRupiah(
                  e.target.value
                )
              )
            }
            className="w-full p-3 rounded-lg bg-slate-700 text-white"
          />

          <label className="block text-white">
            Kategori
          </label>

          <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(e.target.value)
          }
          className="w-full p-3 rounded-lg bg-slate-700 text-white"
        >
          <option value="">
            Pilih Kategori
          </option>

          {categories.map((cat) => (
            <option
              key={cat.id}
              value={cat.id}
            >
              {cat.name}
            </option>
          ))}
        </select>

          <label className="block text-white">
            Akun
          </label>

          <select
          value={accountId}
          onChange={(e) =>
            setAccountId(
              e.target.value
            )
          }
          className="w-full p-3 rounded-lg bg-slate-700 text-white"
        >
          <option value="">
            Pilih Akun
          </option>

          {accounts.map((acc) => (
            <option
              key={acc.id}
              value={acc.id}
            >
              {acc.name}
            </option>
          ))}
        </select>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan"}
            </button>

            <Link
              href="/transaksi"
              className="px-6 py-3 rounded-lg bg-slate-700 text-white"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}