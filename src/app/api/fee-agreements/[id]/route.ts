import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreement } from "@/lib/workspace";
import { computePaymentSchedule } from "@/lib/feeAgreementTemplates";

function normalizeOdemeSekli(v: any): string {
  return v === "taksit" || v === "pesin_taksit" ? v : "pesin";
}

async function syncCaseFromAgreement(caseId: string, sabitUcret: number | null, schedule: { tutar: number; vadeTarihi: Date }[]) {
  const earliestUnpaid = schedule.length ? schedule.reduce((a, b) => (a.vadeTarihi < b.vadeTarihi ? a : b)) : null;
  await prisma.case.update({
    where: { id: caseId },
    data: {
      agreedFee: sabitUcret,
      paymentDueDate: earliestUnpaid ? earliestUnpaid.vadeTarihi : null,
    },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.konu !== undefined) data.konu = body.konu || null;
  if (body.caseId !== undefined) data.caseId = body.caseId || null;
  if (body.sabitUcret !== undefined) data.sabitUcret = body.sabitUcret != null ? parseFloat(body.sabitUcret) : null;
  if (body.yuzdeVarMi !== undefined) data.yuzdeVarMi = !!body.yuzdeVarMi;
  if (body.yuzdeOrani !== undefined) data.yuzdeOrani = body.yuzdeOrani != null && body.yuzdeOrani !== "" ? parseFloat(body.yuzdeOrani) : null;
  if (body.odemeSekli !== undefined) data.odemeSekli = normalizeOdemeSekli(body.odemeSekli);
  if (body.pesinTarihi !== undefined) data.pesinTarihi = body.pesinTarihi ? new Date(body.pesinTarihi) : null;
  if (body.pesinatTutar !== undefined) data.pesinatTutar = body.pesinatTutar != null && body.pesinatTutar !== "" ? parseFloat(body.pesinatTutar) : null;
  if (body.taksitler !== undefined) data.taksitler = body.taksitler;
  if (body.harcMasrafDahil !== undefined) data.harcMasrafDahil = !!body.harcMasrafDahil;
  if (body.yetkiYeri !== undefined) data.yetkiYeri = body.yetkiYeri || null;
  if (body.sozlesmeTarihi !== undefined) data.sozlesmeTarihi = body.sozlesmeTarihi ? new Date(body.sozlesmeTarihi) : new Date();

  const agreement = await prisma.feeAgreement.update({ where: { id: params.id }, data });

  // Ödeme takvimi değişmiş olabilir — HENÜZ ÖDENMEMİŞ kayıtları silip
  // yeni takvimle değiştiriyoruz. ZATEN ÖDENMİŞ ödemelere hiç dokunmuyoruz
  // (gerçek bir ödeme geçmişini kaybetmemek için).
  await prisma.feeAgreementPayment.deleteMany({ where: { agreementId: params.id, odendiMi: false } });
  const schedule = computePaymentSchedule({
    odemeSekli: agreement.odemeSekli,
    sabitUcret: agreement.sabitUcret,
    pesinTarihi: agreement.pesinTarihi,
    pesinatTutar: agreement.pesinatTutar,
    taksitler: agreement.taksitler as any,
  });
  if (schedule.length) {
    await prisma.feeAgreementPayment.createMany({
      data: schedule.map((s) => ({ agreementId: agreement.id, tutar: s.tutar, vadeTarihi: s.vadeTarihi })),
    });
  }

  if (agreement.caseId) {
    await syncCaseFromAgreement(agreement.caseId, agreement.sabitUcret, schedule);
  }

  const withPayments = await prisma.feeAgreement.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { vadeTarihi: "asc" } } },
  });

  return NextResponse.json({ agreement: withPayments });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  // Bu sözleşmenin ödemelerinden otomatik oluşmuş faturalar varsa,
  // onların Gelir-Gider kaydını da (sourceInvoiceId ile eşleşen
  // Transaction) temizliyoruz — yoksa "yetim" bir gelir kaydı olarak
  // Gelir-Gider'de kalırlardı. Fatura ve ödeme kayıtlarının kendisi,
  // sözleşme silinince zincirleme (cascade) olarak zaten silinir.
  const invoices = await prisma.invoice.findMany({
    where: { feeAgreementPayment: { agreementId: params.id } },
    select: { id: true },
  });
  if (invoices.length) {
    await prisma.transaction.deleteMany({ where: { sourceInvoiceId: { in: invoices.map((i) => i.id) } } });
  }

  await prisma.feeAgreement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
