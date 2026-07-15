import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true, workspaceRole: true } });
  if (!user?.workspaceId) return NextResponse.json({ error: "Bir büroya bağlı değilsiniz." }, { status: 404 });

  const workspace = await prisma.workspace.findUnique({
    where: { id: user.workspaceId },
    include: {
      members: { select: { id: true, name: true, email: true, workspaceRole: true, createdAt: true, blockedTools: true, aiEnabled: true, restrictToOwnItems: true } },
    },
  });
  if (!workspace) return NextResponse.json({ error: "Büro bulunamadı." }, { status: 404 });

  return NextResponse.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      memberLimit: workspace.memberLimit,
      members: workspace.members,
    },
    myRole: user.workspaceRole,
  });
}

// Büro adını değiştirme (sadece büronun kendi yöneticisi)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true, workspaceRole: true } });
  if (!user?.workspaceId) return NextResponse.json({ error: "Bir büroya bağlı değilsiniz." }, { status: 404 });
  if (user.workspaceRole !== "admin") return NextResponse.json({ error: "Sadece büro yöneticisi adı değiştirebilir." }, { status: 403 });

  const { name } = await req.json();
  if (!name || !name.trim()) return NextResponse.json({ error: "Büro adı gerekli." }, { status: 400 });

  const workspace = await prisma.workspace.update({ where: { id: user.workspaceId }, data: { name: name.trim() } });
  return NextResponse.json({ workspace });
}
