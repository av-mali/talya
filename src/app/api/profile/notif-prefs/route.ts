import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PREFS = { sure: true, tebligat: true };

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { notifPrefs: true } });
  const prefs = (user?.notifPrefs as any) || DEFAULT_PREFS;

  return NextResponse.json({ prefs: { ...DEFAULT_PREFS, ...prefs } });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { prefs } = await req.json();
  await prisma.user.update({ where: { id: userId }, data: { notifPrefs: prefs } });

  return NextResponse.json({ ok: true });
}
