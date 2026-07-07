import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedCase(caseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const found = await prisma.case.findFirst({
    where: { id: caseId, client: { userId } },
    include: { client: true },
  });
  return found ? { userId, caseInfo: found } : null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await requireOwnedCase(params.id);
  if (!ctx) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const { amount, note } = await req.json();
  const amountNum = parseFloat(String(amount).replace(/[^\d.]/g, ""));
  if (!amountNum || amountNum <= 0) {
    return NextResponse.json({ error: "Geçerli bir tutar girin." }, { status: 400 });
  }

  const invoice = await prisma.invoice.create({
    data: { amount: amountNum, note, caseId: params.id },
  });

  // Fatura oluşunca büronun genel Gelir-Gider kasasına da otomatik olarak
  // "gelir" kaydı düşülür — elle ikinci kez girmeye gerek kalmaz.
  await prisma.transaction.create({
    data: {
      type: "gelir",
      amount: amountNum,
      description: `${ctx.caseInfo.client.name} — ${ctx.caseInfo.title}${note ? " (" + note + ")" : ""}`,
      userId: ctx.userId,
      sourceInvoiceId: invoice.id,
    },
  });

  return NextResponse.json({ invoice });
}
