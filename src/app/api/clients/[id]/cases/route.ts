import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedClient(clientId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
  return client ? userId : null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const cases = await prisma.case.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      events: { orderBy: { dueDate: "asc" } },
      invoices: true,
    },
  });
  return NextResponse.json({ cases });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { title } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Dosya adı gerekli." }, { status: 400 });
  }

  const newCase = await prisma.case.create({
    data: { title: title.trim(), clientId: params.id },
  });
  return NextResponse.json({ case: newCase });
}
