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

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah Financial Coach AI yang membantu mengelola keuangan pribadi.",
          },
          {
            role: "user",
            content: body.message,
          },
        ],
      });

    return NextResponse.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}