import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, shouldRestrictToOwnItems, hasToolAccess } from "@/lib/workspace";

// Anlaşılan ücreti girilmiş dosyalarda, henüz faturalanmamış (bekleyen)
// bakiyeyi hesaplar. Gelir-Gider ekranındaki "Bekleyen Alacaklar" kutusu
// ve listesi bunu kullanır.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gelirgider"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  // Bir Dosya, bir Ücret Sözleşmesi'ne bağlıysa, o dosyanın "Anlaşılan
  // Ücret"i zaten sözleşmeden geliyor — aşağıdaki feeRows bunu ZATEN daha
  // ayrıntılı (taksit taksit) şekilde gösterecek. Aynı tutarı İKİ KEZ
  // saymamak için, sözleşmeye bağlı dosyaları buradan hariç tutuyoruz.
  const linkedCaseIds = new Set(
    (await prisma.feeAgreement.findMany({ where: { caseId: { not: null } }, select: { caseId: true } })).map((a) => a.caseId)
  );

  const cases = await prisma.case.findMany({
    where: {
      client: { workspaceId: ws.workspaceId },
      agreedFee: { not: null },
      id: { notIn: Array.from(linkedCaseIds) as string[] },
      ...(restricted ? { assignedToId: ws.userId } : {}),
    },
    include: { client: true, invoices: true },
  });

  // Avukatlık Ücret Sözleşmesi'ndeki, vadesi gelmiş/geçmiş ama henüz
  // ödenmemiş taksitler de Bekleyen Alacaklar'a düşer.
  const feePayments = await prisma.feeAgreementPayment.findMany({
    where: { odendiMi: false, agreement: { client: { workspaceId: ws.workspaceId } } },
    include: { agreement: { include: { client: true } } },
  });

  const now = new Date();
  const feeRows = feePayments.map((p) => ({
    caseId: null,
    feeAgreementPaymentId: p.id,
    clientId: p.agreement.clientId,
    clientName: p.agreement.client.name,
    caseTitle: `Vekâlet Ücreti${p.agreement.konu ? " — " + p.agreement.konu.slice(0, 30) : ""}`,
    agreedFee: p.tutar,
    invoiced: 0,
    remaining: p.tutar,
    paymentDueDate: p.vadeTarihi,
    overdue: new Date(p.vadeTarihi) < now,
  }));

  const rows = [
    ...cases.map((c) => {
      const invoiced = c.invoices.reduce((s, i) => s + i.amount, 0);
      const remaining = (c.agreedFee || 0) - invoiced;
      const overdue = c.paymentDueDate ? new Date(c.paymentDueDate) < now : false;
      return {
        caseId: c.id,
        feeAgreementPaymentId: null,
        clientId: c.clientId,
        clientName: c.client.name,
        caseTitle: c.title,
        agreedFee: c.agreedFee || 0,
        invoiced,
        remaining,
        paymentDueDate: c.paymentDueDate,
        overdue,
      };
    }),
    ...feeRows,
  ]
    .filter((r) => r.remaining > 0)
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1; // vadesi geçmiş önce
      return b.remaining - a.remaining;
    });

  const total = rows.reduce((s, r) => s + r.remaining, 0);

  return NextResponse.json({ total, rows });
}
