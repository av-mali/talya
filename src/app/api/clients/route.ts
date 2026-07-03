import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

// Tüm müvekkilleri listele (arama isteğe bağlı: ?q=isim)
export async function GET(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  const clients = await prisma.client.findMany({
    where: {
      userId,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      events: { orderBy: { dueDate: "asc" }, where: { dueDate: { gte: new Date() } }, take: 1 },
    },
  });

  return NextResponse.json({ clients });
}

// Yeni müvekkil oluştur
export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { name, phone, email, notes } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Müvekkil adı gerekli." }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { name: name.trim(), phone, email, notes, userId },
  });

  return NextResponse.json({ client });
}
