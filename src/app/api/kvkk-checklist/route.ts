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

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { kvkkChecklist: true } });
  return NextResponse.json({ checklist: user?.kvkkChecklist || {} });
}

export async function PUT(req: Request) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { checklist } = await req.json();
  await prisma.user.update({ where: { id: userId }, data: { kvkkChecklist: checklist } });
  return NextResponse.json({ ok: true });
}
