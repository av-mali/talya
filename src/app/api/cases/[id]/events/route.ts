import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedCase } from "@/lib/workspace";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const { type, title, dueDate } = await req.json();
  if (!type || !title || !dueDate) {
    return NextResponse.json({ error: "Tür, başlık ve tarih gerekli." }, { status: 400 });
  }
  const parsed = new Date(dueDate);
  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
  }

  const event = await prisma.clientEvent.create({
    data: { type, title, dueDate: parsed, caseId: params.id },
  });
  return NextResponse.json({ event });
}
