import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true, workspaceRole: true } });
  if (!user?.workspaceId) return NextResponse.json({ error: "Bir büroya bağlı değilsiniz." }, { status: 404 });
  if (user.workspaceRole !== "admin") return NextResponse.json({ error: "Sadece büro yöneticisi davet oluşturabilir." }, { status: 403 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspaceId },
    include: { members: { select: { id: true } } },
  });
  if (!workspace) return NextResponse.json({ error: "Büro bulunamadı." }, { status: 404 });

  if (workspace.members.length >= workspace.memberLimit) {
    return NextResponse.json(
      { error: `Büronuz üye limitine ulaştı (${workspace.memberLimit}). Limitinizi artırmak için yöneticinizle iletişime geçin.` },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(24).toString("hex");
  const invite = await prisma.workspaceInvite.create({
    data: { token, workspaceId: workspace.id },
  });

  return NextResponse.json({ token: invite.token });
}

// Bekleyen (henüz kullanılmamış) davetleri listele
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } });
  if (!user?.workspaceId) return NextResponse.json({ invites: [] });

  const invites = await prisma.workspaceInvite.findMany({
    where: { workspaceId: user.workspaceId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invites });
}
