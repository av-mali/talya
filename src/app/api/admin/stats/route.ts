import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const [userCount, clientCount, messageCount, invoiceAgg] = await Promise.all([
    prisma.user.count(),
    prisma.client.count(),
    prisma.message.count(),
    prisma.invoice.aggregate({ _sum: { amount: true } }),
  ]);

  return NextResponse.json({
    userCount,
    clientCount,
    messageCount,
    totalInvoiced: invoiceAgg._sum.amount || 0,
  });
}
