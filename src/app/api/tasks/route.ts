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

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { title, dueDate } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Görev başlığı gerekli." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { title: title.trim(), dueDate: dueDate ? new Date(dueDate) : null, userId },
  });
  return NextResponse.json({ task });
}
