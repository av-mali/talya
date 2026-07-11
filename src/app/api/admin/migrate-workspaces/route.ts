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

  // 3) Aynı mantıkla: Görevler, Notlar, Gelir-Gider kayıtları, Şablonlar
  //    ve Sözleşme Takip kayıtlarını da büroya taşı (2. aşama).
  let othersMigrated = 0;
  const userCache = new Map<string, string | null>();
  async function getWorkspaceIdForUser(userId: string): Promise<string | null> {
    if (userCache.has(userId)) return userCache.get(userId)!;
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } });
    const wsId = u?.workspaceId || null;
    userCache.set(userId, wsId);
    return wsId;
  }

  const tasksToMigrate = await prisma.task.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } });
  for (const t of tasksToMigrate) {
    const wsId = await getWorkspaceIdForUser(t.userId);
    if (!wsId) continue;
    await prisma.task.update({ where: { id: t.id }, data: { workspaceId: wsId } });
    othersMigrated++;
  }

  const notesToMigrate = await prisma.note.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } });
  for (const n of notesToMigrate) {
    const wsId = await getWorkspaceIdForUser(n.userId);
    if (!wsId) continue;
    await prisma.note.update({ where: { id: n.id }, data: { workspaceId: wsId } });
    othersMigrated++;
  }

  const txToMigrate = await prisma.transaction.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } });
  for (const tx of txToMigrate) {
    const wsId = await getWorkspaceIdForUser(tx.userId);
    if (!wsId) continue;
    await prisma.transaction.update({ where: { id: tx.id }, data: { workspaceId: wsId } });
    othersMigrated++;
  }

  const templatesToMigrate = await prisma.template.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } });
  for (const tp of templatesToMigrate) {
    const wsId = await getWorkspaceIdForUser(tp.userId);
    if (!wsId) continue;
    await prisma.template.update({ where: { id: tp.id }, data: { workspaceId: wsId } });
    othersMigrated++;
  }

  const contractsToMigrate = await prisma.contract.findMany({ where: { workspaceId: null }, select: { id: true, userId: true } });
  for (const c of contractsToMigrate) {
    const wsId = await getWorkspaceIdForUser(c.userId);
    if (!wsId) continue;
    await prisma.contract.update({ where: { id: c.id }, data: { workspaceId: wsId } });
    othersMigrated++;
  }

  return NextResponse.json({ ok: true, workspacesCreated, clientsMigrated, othersMigrated });
}
