import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (!(session.user as any).isAdmin) return null;
  return (session.user as any).id as string;
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { messages: true } },
    },
  });

  return NextResponse.json({ users });
}
