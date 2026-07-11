import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { userId },
    orderBy: { endDate: "asc" },
  });
  return NextResponse.json({ contracts });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

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
      userId,
    },
  });
  return NextResponse.json({ contract });
}
