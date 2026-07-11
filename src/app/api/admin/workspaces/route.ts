import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: { select: { email: true } } },
  });

  return NextResponse.json({
    workspaces: workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      memberLimit: w.memberLimit,
      memberCount: w.members.length,
      memberEmails: w.members.map((m) => m.email),
    })),
  });
}
