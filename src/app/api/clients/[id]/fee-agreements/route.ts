import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";
import { computePaymentSchedule } from "@/lib/feeAgreementTemplates";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const agreements = await prisma.feeAgreement.findMany({
    where: { clientId: params.id },
    include: { payments: { orderBy: { vadeTarihi: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agreements });
}

function normalizeOdemeSekli(v: any): string {
  return v === "taksit" || v === "pesin_taksit" ? v : "pesin";
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const body = await req.json();
  const odemeSekli = normalizeOdemeSekli(body.odemeSekli);
  const sabitUcret = body.sabitUcret != null ? parseFloat(body.sabitUcret) : null;
  const pesinatTutar = body.pesinatTutar != null && body.pesinatTutar !== "" ? parseFloat(body.pesinatTutar) : null;
  const pesinTarihi = body.pesinTarihi ? new Date(body.pesinTarihi) : null;
  const taksitler = Array.isArray(body.taksitler) ? body.taksitler : [];

  const agreement = await prisma.feeAgreement.create({
    data: {
      clientId: params.id,
      konu: body.konu || null,
      sabitUcret,
      yuzdeVarMi: !!body.yuzdeVarMi,
      yuzdeOrani: body.yuzdeOrani != null && body.yuzdeOrani !== "" ? parseFloat(body.yuzdeOrani) : null,
      odemeSekli,
      pesinTarihi,
      pesinatTutar,
      taksitler: taksitler.length ? taksitler : undefined,
      harcMasrafDahil: body.harcMasrafDahil !== undefined ? !!body.harcMasrafDahil : true,
      yetkiYeri: body.yetkiYeri || null,
      sozlesmeTarihi: body.sozlesmeTarihi ? new Date(body.sozlesmeTarihi) : new Date(),
    },
  });

  // Ödeme takvimini (peşin/taksit/peşinat+taksit) hesaplayıp, takvime ve
  // Bekleyen Alacaklar'a düşecek ödeme kayıtlarını otomatik oluştur.
  const schedule = computePaymentSchedule({ odemeSekli, sabitUcret, pesinTarihi, pesinatTutar, taksitler });
  if (schedule.length) {
    await prisma.feeAgreementPayment.createMany({
      data: schedule.map((s) => ({ agreementId: agreement.id, tutar: s.tutar, vadeTarihi: s.vadeTarihi })),
    });
  }

  const withPayments = await prisma.feeAgreement.findUnique({
    where: { id: agreement.id },
    include: { payments: { orderBy: { vadeTarihi: "asc" } } },
  });

  return NextResponse.json({ agreement: withPayments });
}
