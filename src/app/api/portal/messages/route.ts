import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPortalToken, PORTAL_COOKIE_NAME } from "@/lib/portalAuth";

export async function GET() {
  const token = cookies().get(PORTAL_COOKIE_NAME)?.value;
  const clientId = verifyPortalToken(token);
  if (!clientId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const messages = await prisma.clientPortalMessage.findMany({
    where: { clientId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const token = cookies().get(PORTAL_COOKIE_NAME)?.value;
  const clientId = verifyPortalToken(token);
  if (!clientId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  // Kötüye kullanımı (art arda mesaj bombardımanı) önlemek için: büro
  // henüz cevap vermediyse müvekkil yeni bir mesaj gönderemez.
  const lastMessage = await prisma.clientPortalMessage.findFirst({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  if (lastMessage && lastMessage.isFromClient) {
    return NextResponse.json(
      { error: "Bürodan cevap gelmeden yeni mesaj gönderemezsiniz. Lütfen yanıtı bekleyin." },
      { status: 400 }
    );
  }

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
  }

  await prisma.clientPortalMessage.create({
    data: { clientId, content: content.trim(), isFromClient: true },
  });
  return NextResponse.json({ ok: true });
}
