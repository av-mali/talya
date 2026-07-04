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

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

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
      userId,
    },
  });
  return NextResponse.json({ transaction: tx });
}
