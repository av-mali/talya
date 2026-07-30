import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreementPayment } from "@/lib/workspace";

// Bir ödemeyi "ödendi" olarak işaretler. Sözleşme bir Dosya'ya bağlıysa,
// o dosyanın Fatura & Tahsilat kısmına gerçek bir FATURA düşülür (bu,
// büronun standart fatura akışıyla aynı şekilde otomatik olarak
// Gelir-Gider'e de yansır). Bağlı değilse, doğrudan Gelir-Gider'e bir
// gelir kaydı düşülür. Kullanıcı iki ayrı yerde aynı şeyi girmek zorunda
// kalmıyor.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const ok = await requireOwnedFeeAgreementPayment(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya ödeme bulunamadı." }, { status: 401 });

  const payment = await prisma.feeAgreementPayment.findUnique({
    where: { id: params.id },
    include: { agreement: { include: { client: true, case: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  if (payment.odendiMi) return NextResponse.json({ error: "Bu ödeme zaten ödendi olarak işaretli." }, { status: 400 });

  const now = new Date();
  const desc = `Avukatlık ücreti — ${payment.agreement.client.name}${payment.agreement.konu ? " (" + payment.agreement.konu.slice(0, 40) + ")" : ""}`;

  // ÖNEMLİ: fatura oluşturma (varsa) ve gelir kaydı, ödemenin "ödendi"
  // işaretlenmesiyle AYNI atomik işlemde olmalı — aksi halde (eskiden
  // olduğu gibi) fatura önce, transaction dizisinin GERÇEK yürütülmesinden
  // ÖNCE ayrı bir çağrıyla oluşturulup, sonra $transaction(ops) başarısız
  // olursa "yetim" (hiçbir ödemeye/gelir kaydına bağlı olmayan) bir fatura
  // ortada kalabiliyordu. Fatura oluşturma ADIMI önceki adımın sonucuna
  // (invoice.id) ihtiyaç duyduğu için dizi (array) formundaki $transaction
  // YETERSİZ — interaktif (callback) formu kullanılıyor, böylece tüm
  // adımlar TEK bir veritabanı işleminde ya hep birlikte uygulanır ya da
  // hep birlikte geri alınır.
  const updatedPayment = await prisma.$transaction(async (tx) => {
    const updated = await tx.feeAgreementPayment.update({
      where: { id: params.id },
      data: { odendiMi: true, odemeTarihi: now },
    });

    if (payment.agreement.caseId) {
      // Dosyaya bağlı — Fatura & Tahsilat'a gerçek bir fatura düşülür.
      const invoice = await tx.invoice.create({
        data: { amount: payment.tutar, note: desc, caseId: payment.agreement.caseId, feeAgreementPaymentId: payment.id },
      });
      await tx.transaction.create({
        data: {
          type: "gelir",
          amount: payment.tutar,
          description: desc,
          date: now,
          userId: ok.userId,
          workspaceId: ok.workspaceId,
          sourceInvoiceId: invoice.id,
        },
      });
    } else {
      // Dosyaya bağlı değil — doğrudan Gelir-Gider'e gelir kaydı.
      await tx.transaction.create({
        data: {
          type: "gelir",
          amount: payment.tutar,
          description: desc,
          date: now,
          userId: ok.userId,
          workspaceId: ok.workspaceId,
        },
      });
    }

    return updated;
  });

  return NextResponse.json({ payment: updatedPayment });
}
