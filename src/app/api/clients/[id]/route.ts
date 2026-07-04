import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

// Müvekkil detayı: bilgiler + görüşme geçmişi + faturalar + duruşma/ödeme tarihleri
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId },
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
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const existing = await prisma.client.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });

  const { name, phone, email, notes } = await req.json();
  const client = await prisma.client.update({
    where: { id: params.id },
    data: { name, phone, email, notes },
  });

  return NextResponse.json({ client });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const existing = await prisma.client.findFirst({ where: { id: params.id, userId } });
  if (!existing) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
