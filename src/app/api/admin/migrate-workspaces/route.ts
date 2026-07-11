import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// TEK SEFERLİK GÖÇ ARACI: Eski (kullanıcı bazlı) sistemden yeni (büro/
// workspace bazlı) sisteme geçiş yapar. Hiçbir veriyi SİLMEZ, sadece
// eksik olan workspaceId alanlarını doldurur. Güvenle birden fazla kez
// çalıştırılabilir (zaten taşınmış kayıtları tekrar işlemez).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  let workspacesCreated = 0;
  let clientsMigrated = 0;

  // 1) Henüz bürosu olmayan her kullanıcıya kendi (tek kişilik) bürosunu aç.
  const usersWithoutWorkspace = await prisma.user.findMany({
    where: { workspaceId: null },
    select: { id: true, name: true, email: true },
  });

  for (const u of usersWithoutWorkspace) {
    const workspaceName = (u.name && u.name.trim()) ? `${u.name.trim()} Bürosu` : `${u.email.split("@")[0]} Bürosu`;
    const workspace = await prisma.workspace.create({ data: { name: workspaceName } });
    await prisma.user.update({ where: { id: u.id }, data: { workspaceId: workspace.id, workspaceRole: "admin" } });
    workspacesCreated++;
  }

  // 2) workspaceId'si olmayan (ama eski userId'si olan) her müvekkili,
  //    o kullanıcının bürosuna taşı.
  const clientsToMigrate = await prisma.client.findMany({
    where: { workspaceId: null, userId: { not: null } },
    select: { id: true, userId: true },
  });

  for (const c of clientsToMigrate) {
    if (!c.userId) continue;
    const owner = await prisma.user.findUnique({ where: { id: c.userId }, select: { workspaceId: true } });
    if (!owner?.workspaceId) continue;
    await prisma.client.update({ where: { id: c.id }, data: { workspaceId: owner.workspaceId } });
    clientsMigrated++;
  }

  return NextResponse.json({ ok: true, workspacesCreated, clientsMigrated });
}
