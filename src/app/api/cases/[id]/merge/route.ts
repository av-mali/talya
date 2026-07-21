import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedCase } from "@/lib/workspace";

// İki ayrı Dosya (Case) kaydı, aslında AYNI gerçek işi temsil ediyorsa
// (ör. biri Sözleşme'den otomatik açılmış, diğeri UYAP'tan senkronize
// olmuş) birleştirmek için: kaynak dosyadaki tüm kayıtlar (duruşma/ödeme
// tarihleri, faturalar, zaman takibi, ücret sözleşmeleri) hedef dosyaya
// TAŞINIR, kaynak dosya silinir. Her iki dosya da AYNI müvekkile ait
// olmalı (farklı müvekkillere ait dosyalar birleştirilemez).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sourceOk = await requireOwnedCase(params.id);
  if (!sourceOk) return NextResponse.json({ error: "Yetkisiz veya kaynak dosya bulunamadı." }, { status: 401 });

  const { targetCaseId } = await req.json();
  if (!targetCaseId || targetCaseId === params.id) {
    return NextResponse.json({ error: "Geçerli bir hedef dosya seçin." }, { status: 400 });
  }
  const targetOk = await requireOwnedCase(targetCaseId);
  if (!targetOk) return NextResponse.json({ error: "Yetkisiz veya hedef dosya bulunamadı." }, { status: 401 });

  const [source, target] = await Promise.all([
    prisma.case.findUnique({ where: { id: params.id } }),
    prisma.case.findUnique({ where: { id: targetCaseId } }),
  ]);
  if (!source || !target) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  if (source.clientId !== target.clientId) {
    return NextResponse.json({ error: "Farklı müvekkillere ait dosyalar birleştirilemez." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.clientEvent.updateMany({ where: { caseId: params.id }, data: { caseId: targetCaseId } }),
    prisma.invoice.updateMany({ where: { caseId: params.id }, data: { caseId: targetCaseId } }),
    prisma.timeEntry.updateMany({ where: { caseId: params.id }, data: { caseId: targetCaseId } }),
    prisma.feeAgreement.updateMany({ where: { caseId: params.id }, data: { caseId: targetCaseId } }),
    // Hedef dosyada henüz bir dosya numarası/anlaşılan ücret yoksa,
    // kaynaktakini devral — bilgi kaybolmasın.
    prisma.case.update({
      where: { id: targetCaseId },
      data: {
        caseNumber: target.caseNumber || source.caseNumber || null,
        agreedFee: target.agreedFee ?? source.agreedFee ?? null,
        paymentDueDate: target.paymentDueDate ?? source.paymentDueDate ?? null,
      },
    }),
    prisma.case.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ ok: true, caseId: targetCaseId });
}
