import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Anlaşılan ücreti girilmiş dosyalarda, henüz faturalanmamış (bekleyen)
// bakiyeyi hesaplar. Gelir-Gider ekranındaki "Bekleyen Alacaklar" kutusu
// ve listesi bunu kullanır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const cases = await prisma.case.findMany({
    where: { client: { userId }, agreedFee: { not: null } },
    include: { client: true, invoices: true },
  });

  const rows = cases
    .map((c) => {
      const invoiced = c.invoices.reduce((s, i) => s + i.amount, 0);
      const remaining = (c.agreedFee || 0) - invoiced;
      return {
        caseId: c.id,
        clientId: c.clientId,
        clientName: c.client.name,
        caseTitle: c.title,
        agreedFee: c.agreedFee || 0,
        invoiced,
        remaining,
      };
    })
    .filter((r) => r.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);

  const total = rows.reduce((s, r) => s + r.remaining, 0);

  return NextResponse.json({ total, rows });
}
