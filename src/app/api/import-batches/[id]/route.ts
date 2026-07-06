import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const batch = await prisma.importBatch.findFirst({ where: { id: params.id, userId } });
  if (!batch) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  return NextResponse.json({ batch });
}

// Kullanıcı önizleme ekranında düzenleyip onayladığı satırları gönderir.
// Her satır için: mevcut bir müvekkil seçilmiş olabilir, ya da yeni müvekkil
// adı verilmiş olabilir. Hiçbir şey kullanıcı onayı olmadan buraya gelmez.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const batch = await prisma.importBatch.findFirst({ where: { id: params.id, userId } });
  if (!batch) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  let created = 0;
  for (const item of items) {
    if (!item.include) continue;
    if (!item.dueDate || !item.type || !item.title) continue;

    let clientId = item.clientId as string | null;

    if (!clientId && item.newClientName) {
      const newClient = await prisma.client.create({
        data: { name: item.newClientName.trim(), userId },
      });
      clientId = newClient.id;
    }
    if (!clientId) continue;

    // Aynı isimde açık bir dosya varsa onu kullan, yoksa yeni dosya aç.
    const caseTitle = (item.caseTitle || "Genel Dosya").trim();
    let targetCase = await prisma.case.findFirst({
      where: { clientId, title: caseTitle },
    });
    if (!targetCase) {
      targetCase = await prisma.case.create({
        data: { title: caseTitle, clientId },
      });
    }

    await prisma.clientEvent.create({
      data: {
        type: item.type,
        title: item.title,
        dueDate: new Date(item.dueDate),
        caseId: targetCase.id,
      },
    });
    created++;
  }

  await prisma.importBatch.update({
    where: { id: params.id },
    data: { status: "confirmed" },
  });

  return NextResponse.json({ ok: true, created });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const batch = await prisma.importBatch.findFirst({ where: { id: params.id, userId } });
  if (!batch) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  await prisma.importBatch.update({ where: { id: params.id }, data: { status: "dismissed" } });
  return NextResponse.json({ ok: true });
}
