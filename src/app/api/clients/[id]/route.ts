import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Müvekkil detayı: bilgiler + görüşme geçmişi + faturalar + duruşma/ödeme tarihleri
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const client = await prisma.client.findFirst({
    where: { id: params.id, workspaceId: ws.workspaceId },
    include: {
      logs: { orderBy: { createdAt: "desc" } },
      cases: {
        where: restricted ? { assignedToId: ws.userId } : {},
        orderBy: { createdAt: "desc" },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          events: { orderBy: { dueDate: "asc" } },
          invoices: { orderBy: { createdAt: "desc" } },
          timeEntries: { orderBy: { date: "desc" } },
          feeAgreements: { include: { payments: { orderBy: { vadeTarihi: "asc" } } } },
        },
      },
    },
  });

  if (!client) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const existing = await prisma.client.findFirst({ where: { id: params.id, workspaceId: ws.workspaceId } });
  if (!existing) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.tcMersis !== undefined) data.tcMersis = body.tcMersis;
  if (body.address !== undefined) data.address = body.address;
  if (body.archived !== undefined) data.archived = !!body.archived;
  if (body.isAday !== undefined) data.isAday = !!body.isAday;

  const client = await prisma.client.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ client });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const existing = await prisma.client.findFirst({ where: { id: params.id, workspaceId: ws.workspaceId } });
  if (!existing) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });

  // Müvekkil silinince dosyaları/faturaları Prisma otomatik (cascade)
  // siler — ama Gelir-Gider'deki KARŞILIK GELEN gelir kayıtları
  // (Transaction), faturaya sadece gevşek bir "sourceInvoiceId" metniyle
  // bağlı olduğu için bu otomatik silmeye dahil olmuyor ve yetim kalıyor.
  // Bu yüzden faturaları bulup, önce onlara bağlı Transaction'ları elle
  // temizliyoruz.
  const invoiceIds = (
    await prisma.invoice.findMany({
      where: { case: { clientId: params.id } },
      select: { id: true },
    })
  ).map((i) => i.id);
  if (invoiceIds.length) {
    await prisma.transaction.deleteMany({ where: { sourceInvoiceId: { in: invoiceIds } } });
  }

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
