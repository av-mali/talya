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

// Sözleşme bir Dosya'ya (Case) bağlıysa, o dosyanın "Anlaşılan Ücret" ve
// vade tarihini sözleşmedeki bilgiyle senkronize eder — aynı bilgiyi iki
// yerde ayrı ayrı girmeye gerek kalmasın diye. Vade tarihi olarak, HENÜZ
// ÖDENMEMİŞ en yakın taksidin tarihi kullanılır.
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const body = await req.json();
  const odemeSekli = normalizeOdemeSekli(body.odemeSekli);
  const sabitUcret = body.sabitUcret != null ? parseFloat(body.sabitUcret) : null;
  const pesinatTutar = body.pesinatTutar != null && body.pesinatTutar !== "" ? parseFloat(body.pesinatTutar) : null;
  const pesinTarihi = body.pesinTarihi ? new Date(body.pesinTarihi) : null;
  const taksitler = Array.isArray(body.taksitler) ? body.taksitler : [];
  const konu = body.konu || null;
  let caseId = body.caseId || null;

  // Kullanıcı bu sözleşmeyi mevcut bir dosyaya bağlamadıysa (ör. bu
  // müvekkilin hiç dosyası yoksa), sözleşme konusuyla otomatik YENİ bir
  // dosya oluşturup sözleşmeyi ona bağlıyoruz — böylece her sözleşme
  // her zaman bir dosyanın altında, Fatura & Tahsilat'ta da görünür olur.
  if (!caseId) {
    const yeniDosya = await prisma.case.create({
      data: {
        clientId: params.id,
        title: konu ? konu.slice(0, 120) : "Avukatlık Ücret Sözleşmesi",
      },
    });
    caseId = yeniDosya.id;
  }

  const agreement = await prisma.feeAgreement.create({
    data: {
      clientId: params.id,
      caseId,
      konu,
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

  if (caseId) {
    await syncCaseFromAgreement(caseId, sabitUcret, schedule);
  }

  const withPayments = await prisma.feeAgreement.findUnique({
    where: { id: agreement.id },
    include: { payments: { orderBy: { vadeTarihi: "asc" } } },
  });

  return NextResponse.json({ agreement: withPayments });
}
