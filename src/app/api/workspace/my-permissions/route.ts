import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Her modül sayfası açılışta bunu çağırır — kapatılmış araçları sol
// menüden gizlemek ve AI kapalıysa sohbeti devre dışı bırakmak için.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceRole: true, blockedTools: true, aiEnabled: true },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

  // Yöneticiler her zaman her şeyi görür.
  const blockedTools = user.workspaceRole === "admin" ? [] : ((user.blockedTools as string[] | null) || []);
  const aiEnabled = user.workspaceRole === "admin" ? true : user.aiEnabled !== false;

  return NextResponse.json({ blockedTools, aiEnabled, role: user.workspaceRole });
}
