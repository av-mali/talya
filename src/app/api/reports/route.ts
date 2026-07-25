import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

// Büronun genel durumunun tek sayfalık özeti — dosya durumu, son 6 ayın
// gelir-gider trendi, görev durumu dağılımı. Var olan verileri toplayıp
// görselleştirir, yeni bir veri modeli gerektirmez.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const canSeeGelirGider = await hasToolAccess(ws.userId, "gelirgider");

  const [openCases, closedCases, muvekkilSayisi, adaySayisi, tasks] = await Promise.all([
    prisma.case.count({ where: { client: { workspaceId: ws.workspaceId }, status: "acik" } }),
    prisma.case.count({ where: { client: { workspaceId: ws.workspaceId }, status: "kapali" } }),
    prisma.client.count({ where: { workspaceId: ws.workspaceId, archived: false, isAday: false } }),
    prisma.client.count({ where: { workspaceId: ws.workspaceId, isAday: true } }),
    prisma.task.findMany({ where: { workspaceId: ws.workspaceId } }),
  ]);

  const gorevDagilimi = {
    yapilacak: tasks.filter((t) => t.status === "yapilacak").length,
    devam: tasks.filter((t) => t.status === "devam").length,
    tamamlandi: tasks.filter((t) => t.status === "tamamlandi").length,
  };

  let gelirGiderTrend: { ay: string; gelir: number; gider: number }[] = [];
  if (canSeeGelirGider) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const txs = await prisma.transaction.findMany({
      where: { workspaceId: ws.workspaceId, date: { gte: sixMonthsAgo } },
    });
    const AY_ISIMLERI = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const inMonth = txs.filter((t) => new Date(t.date) >= d && new Date(t.date) < nextD);
      gelirGiderTrend.push({
        ay: `${AY_ISIMLERI[d.getMonth()]} ${d.getFullYear()}`,
        gelir: inMonth.filter((t) => t.type === "gelir").reduce((s, t) => s + t.amount, 0),
        gider: inMonth.filter((t) => t.type === "gider").reduce((s, t) => s + t.amount, 0),
      });
    }
  }

  return NextResponse.json({
    dosya: { open: openCases, closed: closedCases },
    muvekkil: { total: muvekkilSayisi, aday: adaySayisi },
    gorevDagilimi,
    gelirGiderTrend,
    canSeeGelirGider,
  });
}
