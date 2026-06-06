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

    if (!body.message) {
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
Tugasmu:
- Membantu mengelola keuangan pribadi.
- Memberikan saran tabungan.
- Membantu membuat anggaran bulanan.
- Menjawab pertanyaan tentang pemasukan, pengeluaran, investasi, dan dana darurat.
- Jawab menggunakan Bahasa Indonesia yang mudah dipahami.
          `,
        },
        {
          role: "user",
          content: body.message,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 500,
    });

    return NextResponse.json({
      reply:
        completion.choices?.[0]?.message?.content ||
        "Maaf, saya tidak dapat memberikan jawaban.",
    });
  } catch (error: any) {
    console.error("GROQ ERROR:", error);

    return NextResponse.json(
      {
        error: error.message || "Terjadi kesalahan server",
      },
      {
        status: 500,
      }
    );
  }
}