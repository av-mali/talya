import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gelirgider"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gelirgider"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const { type, amount, description, date } = await req.json();
  const amountNum = parseFloat(String(amount).replace(/[^\d.]/g, ""));
  if (!type || !amountNum || amountNum <= 0 || !description) {
    return NextResponse.json({ error: "Tür, tutar ve açıklama gerekli." }, { status: 400 });
  }

  const tx = await prisma.transaction.create({
    data: {
      type,
      amount: amountNum,
      description,
      date: date ? new Date(date) : new Date(),
      userId: ws.userId,
      workspaceId: ws.workspaceId,
    },
  });
  return NextResponse.json({ transaction: tx });
}
