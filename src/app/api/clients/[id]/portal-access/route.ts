import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generatePassword(): string {
  // Okunması/yazdırılması kolay, karışmayan karakterlerden 6 haneli şifre
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[crypto.randomInt(0, chars.length)];
  }
  return out;
}

// Müvekkil paneline giriş için yeni bir şifre üretir (varsa eskisinin
// üzerine yazar). Şifre SADECE bu cevapta, düz metin olarak bir kez
// gösterilir — veritabanında hiçbir zaman düz metin olarak saklanmaz.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const client = await prisma.client.findUnique({ where: { id: params.id }, select: { tcMersis: true } });
  if (!client?.tcMersis || !client.tcMersis.trim()) {
    return NextResponse.json({ error: "Önce müvekkilin TC Kimlik/Mersis No alanını doldurun." }, { status: 400 });
  }

  const password = generatePassword();
  const hash = await bcrypt.hash(password, 10);

  await prisma.client.update({ where: { id: params.id }, data: { portalPasswordHash: hash } });

  return NextResponse.json({ password, tcMersis: client.tcMersis });
}

// Erişimi tamamen kapat (müvekkil artık giriş yapamaz)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  await prisma.client.update({ where: { id: params.id }, data: { portalPasswordHash: null } });
  return NextResponse.json({ ok: true });
}
