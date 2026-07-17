import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedMediationCase(id: string, userId: string) {
  return prisma.mediationCase.findFirst({ where: { id, userId } });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await requireOwnedMediationCase(params.id, userId);
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  return NextResponse.json({ case: found });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await requireOwnedMediationCase(params.id, userId);
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  const fields = [
    "dosyaNo", "basvurucuAd", "basvurucuAdres", "basvurucuVekilAd", "basvurucuBaroSicil",
    "basvurucuTelefon", "karsiTarafAd", "karsiTarafAdres", "karsiTarafVergiMersis",
    "karsiTarafYetkiliAd", "karsiTarafVekilAd", "karsiTarafTelefon", "uyusmazlikKonusu",
    "basvuruTarihi", "gorevlendirmeTarihi",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f] || null;
  }

  const updated = await prisma.mediationCase.update({ where: { id: params.id }, data });
  return NextResponse.json({ case: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await requireOwnedMediationCase(params.id, userId);
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  await prisma.mediationCase.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
