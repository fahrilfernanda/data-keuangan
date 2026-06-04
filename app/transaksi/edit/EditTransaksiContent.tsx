"use client";

import { Suspense } from "react";
import EditTransaksiContent from "./EditTransaksiContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditTransaksiContent />
    </Suspense>
  );
}