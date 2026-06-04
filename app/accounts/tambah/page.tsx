"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TambahAkun() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("");

  const router = useRouter();

  async function simpan()
   {

    if (!name.trim()) {
  alert("Nama akun tidak boleh kosong");
  return;
}
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Silakan login");
      return;
    }

    const { error } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        balance: Number(balance || 0),
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  // setBalance is provided by useState above and used to update the balance string

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Tambah Akun
      </h1>

      <input
        type="text"
        placeholder="Nama akun"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        className="w-full border p-3 rounded mb-3"
      />

      <input
        type="number"
        placeholder="Saldo awal"
        value={balance}
        onChange={(e) =>
          setBalance(e.target.value)
        }
        className="w-full border p-3 rounded mb-3"
      />

      <button
        onClick={simpan}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded"
      >
        {loading
          ? "Menyimpan..."
          : "Simpan Akun"}
      </button>
    </div>
  );
}