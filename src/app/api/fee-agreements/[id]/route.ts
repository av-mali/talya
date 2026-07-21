import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreement } from "@/lib/workspace";
import { computePaymentSchedule } from "@/lib/feeAgreementTemplates";

function normalizeOdemeSekli(v: any): string {
  return v === "taksit" || v === "pesin_taksit" ? v : "pesin";
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.konu !== undefined) data.konu = body.konu || null;
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

  const withPayments = await prisma.feeAgreement.findUnique({
    where: { id: params.id },
    include: { payments: { orderBy: { vadeTarihi: "asc" } } },
  });

  return NextResponse.json({ agreement: withPayments });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  await prisma.feeAgreement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
