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

  const { name, phone, email, notes } = await req.json();
  const client = await prisma.client.update({
    where: { id: params.id },
    data: { name, phone, email, notes },
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
