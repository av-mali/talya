import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const cases = await prisma.case.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      events: { orderBy: { dueDate: "asc" } },
      invoices: true,
    },
  });
  return NextResponse.json({ cases });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { title } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Dosya adı gerekli." }, { status: 400 });
  }

  const newCase = await prisma.case.create({
    data: { title: title.trim(), clientId: params.id },
  });
  return NextResponse.json({ case: newCase });
}
