import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; invoiceId: string } }
) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const found = await prisma.case.findFirst({ where: { id: params.id, client: { workspaceId: ws.workspaceId } } });
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const invoice = await prisma.invoice.findFirst({ where: { id: params.invoiceId, caseId: params.id } });
  if (!invoice) return NextResponse.json({ error: "Fatura bulunamadı." }, { status: 404 });

  // Bu faturayla birlikte otomatik oluşmuş Gelir-Gider kaydı varsa onu da sil
  // (büro üyelerinden herhangi biri oluşturmuş olabilir, sadece fatura
  // kimliğine göre eşleştiriyoruz).
  await prisma.transaction.deleteMany({ where: { sourceInvoiceId: params.invoiceId } });

  await prisma.invoice.delete({ where: { id: params.invoiceId } });
  return NextResponse.json({ ok: true });
}
