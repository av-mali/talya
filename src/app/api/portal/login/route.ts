import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createPortalToken, PORTAL_COOKIE_NAME, PORTAL_MAX_AGE_SECONDS } from "@/lib/portalAuth";

export async function POST(req: Request) {
  const { tcMersis, password } = await req.json();
  if (!tcMersis || !password) {
    return NextResponse.json({ error: "TC Kimlik No ve şifre gerekli." }, { status: 400 });
  }

  // Aynı TC No'ya sahip birden fazla büronun müvekkili olabilir — hepsini
  // kontrol edip şifresi eşleşeni buluyoruz.
  const candidates = await prisma.client.findMany({
    where: { tcMersis: tcMersis.trim(), portalPasswordHash: { not: null } },
    select: { id: true, portalPasswordHash: true },
  });

  for (const c of candidates) {
    if (c.portalPasswordHash && (await bcrypt.compare(password, c.portalPasswordHash))) {
      const token = createPortalToken(c.id);
      const res = NextResponse.json({ ok: true });
      res.cookies.set(PORTAL_COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: PORTAL_MAX_AGE_SECONDS,
        path: "/",
      });
      return res;
    }
  }

  return NextResponse.json({ error: "TC Kimlik No veya şifre hatalı." }, { status: 401 });
}
