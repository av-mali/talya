import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedCase } from "@/lib/workspace";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const found = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true } },
      events: { orderBy: { dueDate: "asc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      timeEntries: { orderBy: { date: "desc" } },
      feeAgreements: { include: { payments: { orderBy: { vadeTarihi: "asc" } } } },
    },
  });
  return NextResponse.json({ case: found });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const { title, status, agreedFee, paymentDueDate, assignedToId } = await req.json();
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (status !== undefined) data.status = status;
  if (agreedFee !== undefined) {
    data.agreedFee = agreedFee === null || agreedFee === "" ? null : parseFloat(String(agreedFee).replace(/[^\d.]/g, ""));
  }
  if (paymentDueDate !== undefined) {
    data.paymentDueDate = paymentDueDate ? new Date(paymentDueDate) : null;
  }
  if (assignedToId !== undefined) {
    data.assignedToId = assignedToId || null;
  }

  const updated = await prisma.case.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ case: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  await prisma.case.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
