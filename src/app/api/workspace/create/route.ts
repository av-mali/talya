import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcı ilk girişte "Kendi Büromu Kur" derse bu çağrılır. Zaten bir
// büroya bağlıysa (ör. bir davetle katıldıysa) tekrar büro açılmasın diye
// engelliyoruz.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const existing = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } });
  if (existing?.workspaceId) {
    return NextResponse.json({ error: "Zaten bir büroya bağlısınız." }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Büro adı gerekli." }, { status: 400 });
  }

  const workspace = await prisma.workspace.create({ data: { name: name.trim() } });
  await prisma.user.update({
    where: { id: userId },
    data: { workspaceId: workspace.id, workspaceRole: "admin" },
  });

  return NextResponse.json({ ok: true, workspace });
}
