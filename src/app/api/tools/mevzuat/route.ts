import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { searchMevzuat, getMevzuatArticleTree, getMevzuatArticleContent } from "@/lib/mevzuatMcp";

// Mevzuat Bilgi Sistemi'nde arama, madde ağacı ve madde içeriği getirme —
// hepsi tek uç noktada, "action" alanına göre.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  try {
    const { action, query, mevzuatId, maddeId } = await req.json();

    if (action === "search") {
      if (!query || !query.trim()) {
        return NextResponse.json({ error: "Arama terimi girin." }, { status: 400 });
      }
      const result = await searchMevzuat(query.trim());
      return NextResponse.json({ result, _debug: JSON.stringify(result).slice(0, 2000) });
    }

    if (action === "tree") {
      if (!mevzuatId) return NextResponse.json({ error: "mevzuatId gerekli." }, { status: 400 });
      const result = await getMevzuatArticleTree(mevzuatId);
      return NextResponse.json({ result });
    }

    if (action === "content") {
      if (!mevzuatId || !maddeId) return NextResponse.json({ error: "mevzuatId ve maddeId gerekli." }, { status: 400 });
      const result = await getMevzuatArticleContent(mevzuatId, maddeId);
      return NextResponse.json({ result });
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
