import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Ana sayfadaki "Günlük Özet" kutusu — sadece elimizde zaten olan veriyi
// toplayıp, mümkün olduğunca İSİMLİ/somut hale getirerek özetler (yeni
// bir altyapı gerektirmez).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const sevenDaysLater = new Date(todayStart.getTime() + 7 * 86400000);

  const [bugunEtkinlikler, yaklasanOdemeler, uyapHareket, gecikenGorevler] = await Promise.all([
    prisma.clientEvent.findMany({
      where: {
        dueDate: { gte: todayStart, lt: todayEnd },
        case: { client: { workspaceId: ws.workspaceId }, ...(restricted ? { assignedToId: ws.userId } : {}) },
      },
      include: { case: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.feeAgreementPayment.findMany({
      where: {
        odendiMi: false,
        vadeTarihi: { gte: todayStart, lte: sevenDaysLater },
        agreement: { client: { workspaceId: ws.workspaceId } },
      },
      include: { agreement: { include: { client: true } } },
      orderBy: { vadeTarihi: "asc" },
    }),
    prisma.importBatch.count({ where: { userId, status: "pending" } }),
    prisma.task.findMany({
      where: {
        workspaceId: ws.workspaceId,
        done: false,
        dueDate: { lt: now },
        ...(restricted ? { assignedToId: ws.userId } : {}),
      },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const enYakinOdeme = yaklasanOdemeler[0];
  const enYakinEtkinlik = bugunEtkinlikler[0];
  const enGecikenGorev = gecikenGorevler[0];

  // "Talya'nın Önerisi" — en acil TEK bir şeyi öne çıkar: sırasıyla bugünkü
  // duruşma, en yakın ödeme, en çok geciken görev.
  let oneri: string | null = null;
  if (enYakinEtkinlik) {
    oneri = `${enYakinEtkinlik.case.client.name} — "${enYakinEtkinlik.title}" bugün saat ${new Date(enYakinEtkinlik.dueDate).toTimeString().slice(0, 5)}'te.`;
  } else if (enYakinOdeme) {
    const gunKaldi = Math.ceil((new Date(enYakinOdeme.vadeTarihi).getTime() - now.getTime()) / 86400000);
    oneri = `${enYakinOdeme.agreement.client.name} — vekâlet ücreti tahsil süresi ${gunKaldi <= 0 ? "bugün doluyor" : gunKaldi + " gün içinde doluyor"}.`;
  } else if (enGecikenGorev) {
    oneri = `"${enGecikenGorev.title}" görevi gecikti — kontrol etmelisiniz.`;
  }

  return NextResponse.json({
    bugunDurusma: bugunEtkinlikler.length,
    yaklasanOdeme: yaklasanOdemeler.length,
    uyapHareket,
    gecikenGorev: gecikenGorevler.length,
    enYakinOdemeIsim: enYakinOdeme?.agreement.client.name || null,
    enGecikenGorevBaslik: enGecikenGorev?.title || null,
    oneri,
  });
}
