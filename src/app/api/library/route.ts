import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const items = await prisma.savedItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { type, title, content, sourceRef } = await req.json();
  if (!title || !content) {
    return NextResponse.json({ error: "Başlık ve içerik gerekli." }, { status: 400 });
  }

  const item = await prisma.savedItem.create({
    data: { type: type || "mevzuat", title, content, sourceRef, userId },
  });
  return NextResponse.json({ item });
}
