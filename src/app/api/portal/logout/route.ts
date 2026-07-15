import { NextResponse } from "next/server";
import { PORTAL_COOKIE_NAME } from "@/lib/portalAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
