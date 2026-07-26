import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

// Ana sayfadaki "İstatistikler" kutusu için — kullanıcının seçtiği
// istatistikleri hesaplayıp döner. Gelir-Gider, o araca erişimi olmayan
// kullanıcılar için hesaplanmaz/gösterilmez.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const result: Record<string, any> = {};

  const [aktifCount, adayCount, arsivCount, openCases, closedCases, canSeeGelirGider] = await Promise.all([
    prisma.client.count({ where: { workspaceId: ws.workspaceId, archived: false, isAday: false } }),
    prisma.client.count({ where: { workspaceId: ws.workspaceId, isAday: true } }),
    prisma.client.count({ where: { workspaceId: ws.workspaceId, archived: true, isAday: false } }),
    prisma.case.count({ where: { client: { workspaceId: ws.workspaceId }, status: "acik" } }),
    prisma.case.count({ where: { client: { workspaceId: ws.workspaceId }, status: "kapali" } }),
    hasToolAccess(ws.userId, "gelirgider"),
  ]);

  result.muvekkil = { total: aktifCount + adayCount + arsivCount, aktif: aktifCount, aday: adayCount, arsiv: arsivCount };
  result.dosya = { open: openCases, closed: closedCases };

  if (canSeeGelirGider) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [txs, cases] = await Promise.all([
      prisma.transaction.findMany({ where: { workspaceId: ws.workspaceId, date: { gte: monthStart } } }),
      prisma.case.findMany({ where: { client: { workspaceId: ws.workspaceId }, agreedFee: { not: null } }, include: { invoices: true } }),
    ]);
    const gelir = txs.filter((t) => t.type === "gelir").reduce((s, t) => s + t.amount, 0);
    const gider = txs.filter((t) => t.type === "gider").reduce((s, t) => s + t.amount, 0);
    const bekleyen = cases.reduce((s, c) => {
      const invoiced = c.invoices.reduce((ss, i) => ss + i.amount, 0);
      const remaining = (c.agreedFee || 0) - invoiced;
      return s + (remaining > 0 ? remaining : 0);
    }, 0);
    result.gelirgider = { gelir, gider, net: gelir - gider, bekleyen };
  }

  return NextResponse.json({ stats: result, canSeeGelirGider });
}
