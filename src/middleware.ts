import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Bu dosya, /api/* isteklerinden HER BİRİNİN önünden geçer. Amaç: demo
// hesabıyla giriş yapmış birinin, sistemde HİÇBİR kalıcı değişiklik
// yapamamasını ve HİÇBİR AI çağrısı (maliyetli) tetikleyememesini, tek
// bir merkezi yerden garanti altına almak — 100'den fazla ayrı API
// rotasının her birine tek tek "demo mu?" kontrolü eklemek yerine.

const AI_PATH_PARTS = ["/api/chat", "/api/tools/analyze", "/api/uyap-sync", "/generate"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // NextAuth'un kendi giriş/çıkış rotalarına asla dokunma.
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !(token as any).isDemo) {
    return NextResponse.next();
  }

  // AI çağrısı olan bir rota mı? (metottan bağımsız — hem GET hem POST olabilir)
  const isAiRoute = AI_PATH_PARTS.some((p) => pathname.includes(p));
  if (isAiRoute) {
    return NextResponse.json(
      { error: "Bu bir demo hesabıdır — AI özellikleri demo modunda kapalıdır." },
      { status: 403 }
    );
  }

  // Yazma isteği mi? (GET/HEAD/OPTIONS her zaman serbest — sadece gezinme)
  const method = req.method.toUpperCase();
  if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH") {
    return NextResponse.json(
      { error: "Bu bir demo hesabıdır — değişiklik/kayıt yapılamaz." },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
