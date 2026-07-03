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

// "Ne zaman ne konuşmuşuz" — yeni görüşme/iletişim notu ekle
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Not boş olamaz." }, { status: 400 });
  }

  const log = await prisma.clientLog.create({
    data: { content: content.trim(), clientId: params.id },
  });

  return NextResponse.json({ log });
}
