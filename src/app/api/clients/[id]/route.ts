import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// Müvekkil detayı: bilgiler + görüşme geçmişi + faturalar + duruşma/ödeme tarihleri
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id: params.id, workspaceId: ws.workspaceId },
    include: {
      logs: { orderBy: { createdAt: "desc" } },
      cases: {
        orderBy: { createdAt: "desc" },
        include: {
          events: { orderBy: { dueDate: "asc" } },
          invoices: { orderBy: { createdAt: "desc" } },
          timeEntries: { orderBy: { date: "desc" } },
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
  if (body.archived !== undefined) data.archived = !!body.archived;

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

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
