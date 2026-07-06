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
  let skippedDuplicate = 0;
  for (const item of items) {
    if (!item.include) continue;
    if (!item.dueDate || !item.type || !item.title) continue;

    let clientId = item.clientId as string | null;

    if (!clientId && item.newClientName) {
      // Aynı kullanıcının, aynı isimde bir müvekkili zaten var mı? (büyük/küçük
      // harf duyarsız) — varsa onu kullan, yeni bir mükerrer müvekkil AÇMA.
      const existingClient = await prisma.client.findFirst({
        where: { userId, name: { equals: item.newClientName.trim(), mode: "insensitive" } },
      });
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const newClient = await prisma.client.create({
          data: { name: item.newClientName.trim(), userId },
        });
        clientId = newClient.id;
      }
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

    // MÜKERRER KAYIT KONTROLÜ: Aynı dosyada, aynı tarih/saatte zaten bir
    // kayıt varsa tekrar ekleme. Bu, birkaç gün sonra tekrar senkronize
    // edince aynı duruşmanın ikinci kez eklenmesini önler.
    const dueDate = new Date(item.dueDate);
    const existingEvent = await prisma.clientEvent.findFirst({
      where: { caseId: targetCase.id, dueDate },
    });
    if (existingEvent) {
      skippedDuplicate++;
      continue;
    }

    await prisma.clientEvent.create({
      data: {
        type: item.type,
        title: item.title,
        dueDate,
        caseId: targetCase.id,
      },
    });
    created++;
  }

  await prisma.importBatch.update({
    where: { id: params.id },
    data: { status: "confirmed" },
  });

  return NextResponse.json({ ok: true, created, skippedDuplicate });
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
