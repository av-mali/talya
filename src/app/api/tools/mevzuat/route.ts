import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchMevzuat, getMevzuatContent } from "@/lib/mevzuatMcp";
import { hasToolAccess } from "@/lib/workspace";

// Mevzuat Bilgi Sistemi'nde arama ve tam metin getirme — hepsi tek uç
// noktada, "action" alanına göre.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "mevzuat"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  try {
    const { action, query, mevzuatId, mevzuatTur, mevzuatNo } = await req.json();

    if (action === "search") {
      if (!query || !query.trim()) {
        return NextResponse.json({ error: "Arama terimi girin." }, { status: 400 });
      }
      const { items, total, rawDebug } = await searchMevzuat(query.trim());
      if (!items.length && /429|too many requests/i.test(rawDebug)) {
        return NextResponse.json(
          { error: "Adalet Bakanlığı'nın mevzuat sistemi şu an çok yoğun (kısa süreli erişim sınırı). Birkaç dakika bekleyip tekrar dener misiniz?" },
          { status: 429 }
        );
      }
      return NextResponse.json({ result: items, total, _debug: rawDebug.slice(0, 2500) });
    }

    if (action === "content") {
      if (!mevzuatId) return NextResponse.json({ error: "mevzuatId gerekli." }, { status: 400 });
      const { text, availableTools } = await getMevzuatContent(mevzuatId, mevzuatTur || "", mevzuatNo || "");
      if (availableTools) {
        return NextResponse.json({ result: null, _debug: `Bu araç sunucuda yok. Sunucudaki GERÇEK araçlar: ${availableTools.join(", ")}` });
      }
      return NextResponse.json({ result: text });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    // Bu ücretsiz, topluluk tarafından barındırılan bir servis — her an
    // yavaşlayabilir/kapalı olabilir. Kullanıcıya net bir mesaj veriyoruz.
    return NextResponse.json(
      { error: "Mevzuat arama servisine şu anda ulaşılamıyor. Bu, ücretsiz bir topluluk servisidir ve geçici olarak kullanılamıyor olabilir. Birkaç dakika sonra tekrar deneyin." },
      { status: 502 }
    );
  }
}
