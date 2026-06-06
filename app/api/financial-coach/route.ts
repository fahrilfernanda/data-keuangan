import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function GET() {
  return NextResponse.json({
    status: "Financial Coach API berjalan",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body?.message?.trim();

    if (!message) {
      return NextResponse.json(
        {
          error: "Pesan tidak boleh kosong",
        },
        {
          status: 400,
        }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Kamu adalah Financial Coach AI.

Tugas:
- Membantu mengelola keuangan pribadi.
- Memberikan saran tabungan.
- Membuat anggaran bulanan.
- Menjelaskan risiko keuangan.
- Menjawab pertanyaan investasi dasar.
- Gunakan Bahasa Indonesia yang mudah dipahami.
- Berikan jawaban yang jelas dan praktis.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "Maaf, saya tidak dapat memberikan jawaban.";

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    console.error("GROQ ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Terjadi kesalahan server",
      },
      {
        status: 500,
      }
    );
  }
}