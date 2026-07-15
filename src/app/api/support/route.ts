import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { subject, content } = await req.json();
  if (!subject || !subject.trim() || !content || !content.trim()) {
    return NextResponse.json({ error: "Konu ve mesaj gerekli." }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      subject: subject.trim(),
      userId,
      messages: { create: { content: content.trim(), isAdmin: false } },
    },
    include: { messages: true },
  });

  return NextResponse.json({ ticket });
}
