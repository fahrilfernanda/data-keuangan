"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditAkun() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [balance, setBalance] =
    useState("");

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
  const { data } = await supabase
    .from("accounts")
    .select("name")
    .eq("id", id)
    .single();

  if (data) {
    setName(data.name);
  }
}

  async function updateAccount() {
    const { error } = await supabase
      .from("accounts")
      .update({
        name,
        balance: Number(balance),
      })
      .eq("id", id);

    if (!error) {
      router.push("/akun");
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Edit Akun
      </h1>

      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        className="w-full border p-3 rounded mb-3"
      />

      <input
        value={name}
        onChange={(e) =>
          setBalance(e.target.value)
        }
        className="w-full border p-3 rounded mb-3"
      />

      <button
        onClick={updateAccount}
        className="w-full bg-blue-600 text-white p-3 rounded"
      >
        Simpan Perubahan
      </button>
    </div>
  );
}