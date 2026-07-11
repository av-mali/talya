import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// Henüz faturalanmamış (invoiced=false), saatlik ücreti girilmiş zaman
// kayıtlarının toplamını tek bir faturaya çevirir ve o kayıtları
// "faturalandı" olarak işaretler — aynı zaman iki kez faturalanmaz.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const { userId } = ws;

  const found = await prisma.case.findFirst({
    where: { id: params.id, client: { workspaceId: ws.workspaceId } },
    include: { client: true },
  });
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const unbilled = await prisma.timeEntry.findMany({
    where: { caseId: params.id, invoiced: false, hourlyRate: { not: null } },
  });

  const total = unbilled.reduce((s, t) => s + t.hours * (t.hourlyRate || 0), 0);
  if (!unbilled.length || total <= 0) {
    return NextResponse.json({ error: "Faturalandırılacak (saatlik ücreti girilmiş, henüz faturalanmamış) zaman kaydı yok." }, { status: 400 });
  }

  const totalHours = unbilled.reduce((s, t) => s + t.hours, 0);

  const invoice = await prisma.invoice.create({
    data: {
      amount: total,
      note: `Zaman takibi (${totalHours} saat) otomatik faturalandırıldı`,
      caseId: params.id,
    },
  });

  await prisma.timeEntry.updateMany({
    where: { id: { in: unbilled.map((t) => t.id) } },
    data: { invoiced: true },
  });

  await prisma.transaction.create({
    data: {
      type: "gelir",
      amount: total,
      description: `${found.client.name} — ${found.title} (zaman takibi faturası)`,
      userId,
      sourceInvoiceId: invoice.id,
    },
  });

  return NextResponse.json({ invoice, hours: totalHours });
}
