import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreementPayment } from "@/lib/workspace";

// Bir ödemeyi "ödendi" olarak işaretler VE aynı anda Gelir-Gider'e bir
// gelir kaydı düşer — kullanıcı iki ayrı yerde aynı şeyi girmek zorunda
// kalmasın diye.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const ok = await requireOwnedFeeAgreementPayment(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya ödeme bulunamadı." }, { status: 401 });

  const payment = await prisma.feeAgreementPayment.findUnique({
    where: { id: params.id },
    include: { agreement: { include: { client: true } } },
  });
  if (!payment) return NextResponse.json({ error: "Ödeme bulunamadı." }, { status: 404 });
  if (payment.odendiMi) return NextResponse.json({ error: "Bu ödeme zaten ödendi olarak işaretli." }, { status: 400 });

  const now = new Date();

  const [updatedPayment] = await prisma.$transaction([
    prisma.feeAgreementPayment.update({
      where: { id: params.id },
      data: { odendiMi: true, odemeTarihi: now },
    }),
    prisma.transaction.create({
      data: {
        type: "gelir",
        amount: payment.tutar,
        description: `Avukatlık ücreti — ${payment.agreement.client.name}${payment.agreement.konu ? " (" + payment.agreement.konu.slice(0, 40) + ")" : ""}`,
        date: now,
        userId: ok.userId,
        workspaceId: ok.workspaceId,
      },
    }),
  ]);

  return NextResponse.json({ payment: updatedPayment });
}
