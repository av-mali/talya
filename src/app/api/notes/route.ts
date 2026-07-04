import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

export async function GET() {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Not boş olamaz." }, { status: 400 });
  }

  const note = await prisma.note.create({ data: { content: content.trim(), userId } });
  return NextResponse.json({ note });
}
