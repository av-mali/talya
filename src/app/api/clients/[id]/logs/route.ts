import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";

// "Ne zaman ne konuşmuşuz" — yeni görüşme/iletişim notu ekle
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Not boş olamaz." }, { status: 400 });
  }

  const log = await prisma.clientLog.create({
    data: { content: content.trim(), clientId: params.id },
  });

  return NextResponse.json({ log });
}
