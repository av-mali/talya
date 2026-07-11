import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

async function requireOwnedCase(caseId: string) {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const found = await prisma.case.findFirst({
    where: { id: caseId, client: { workspaceId: ws.workspaceId } },
    include: { client: true },
  });
  return found ? { userId: ws.userId, workspaceId: ws.workspaceId, caseInfo: found } : null;
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
      workspaceId: ctx.workspaceId,
      sourceInvoiceId: invoice.id,
    },
  });

  return NextResponse.json({ invoice });
}
