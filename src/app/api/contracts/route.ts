import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "sozlesmetakip"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const contracts = await prisma.contract.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: { endDate: "asc" },
  });
  return NextResponse.json({ contracts });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "sozlesmetakip"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const { title, counterparty, startDate, endDate, notes } = await req.json();
  if (!title || !title.trim() || !endDate) {
    return NextResponse.json({ error: "Başlık ve bitiş tarihi gerekli." }, { status: 400 });
  }

  const contract = await prisma.contract.create({
    data: {
      title: title.trim(),
      counterparty: counterparty || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: new Date(endDate),
      notes: notes || null,
      userId: ws.userId,
      workspaceId: ws.workspaceId,
    },
  });
  return NextResponse.json({ contract });
}
