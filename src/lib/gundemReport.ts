import { prisma } from "@/lib/prisma";
import { shouldRestrictToOwnItems } from "@/lib/workspace";
import { groupEventsByCaseAndDate } from "@/lib/groupEvents";
import { stripTcFromName } from "@/lib/mediationTemplates";

// Talya Asistan (Telegram botu) ve ileride başka kanallar için ortak
// "bugün gündemde ne var" raporunu üretir. Aynı yetki/atama mantığını
// (requireWorkspace, shouldRestrictToOwnItems) kullanır — bir üyenin
// göreceği rapor, sitede gördüğü veriyle birebir tutarlıdır.
export async function generateGundemReport(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceId: true, name: true, email: true },
  });
  if (!user?.workspaceId) {
    return "Henüz bir büroya bağlı değilsiniz. Önce Talya web sitesinde büronuzu kurun.";
  }
  const workspaceId = user.workspaceId;
  const restricted = await shouldRestrictToOwnItems(userId);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [todayEvents, tasks, casesWithFee, contracts, todayMediation] = await Promise.all([
    prisma.clientEvent.findMany({
      where: {
        case: {
          client: { workspaceId },
          ...(restricted ? { assignedToId: userId } : {}),
        },
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      include: { case: { include: { client: true, assignedTo: { select: { name: true, email: true } } } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.task.findMany({
      where: {
        workspaceId,
        done: false,
        status: { in: ["yapilacak", "devam"] },
        ...(restricted ? { assignedToId: userId } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    }),
    prisma.case.findMany({
      where: {
        client: { workspaceId },
        agreedFee: { not: null },
        ...(restricted ? { assignedToId: userId } : {}),
      },
      include: { client: true, invoices: true },
    }),
    prisma.contract.findMany({
      where: { workspaceId, endDate: { gte: now, lte: new Date(now.getTime() + 14 * 86400000) } },
      orderBy: { endDate: "asc" },
    }),
    // Arabuluculuk kişiseldir (büro geneli değil) — sadece kendi
    // dosyalarındaki bugünkü toplantılar.
    prisma.mediationCase.findMany({
      where: {
        userId,
        OR: [
          { ilkOturumTarihi: { gte: todayStart, lt: todayEnd } },
          { sonTutanakTarihi: { gte: todayStart, lt: todayEnd } },
        ],
      },
    }),
  ]);

  const lines: string[] = [];
  lines.push(`📋 *Günaydın${user.name ? " " + user.name.split(" ")[0] : ""}! İşte bugünkü gündem:*`);
  lines.push("");

  // 1) Bugünkü duruşma/tebligat tarihleri (+ arabuluculuk toplantıları)
  const grouped = groupEventsByCaseAndDate(todayEvents);
  lines.push("⚖️ *Bugünkü Duruşma/Tebligatlar*");
  if (grouped.length || todayMediation.length) {
    grouped.forEach((g) => {
      const time = new Date(g.dueDate).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
      lines.push(`• ${time} — ${g.caseTitle} — ${g.clientNamesDisplay} — ${g.title}${g.assigneeName ? ` (${g.assigneeName})` : ""}`);
    });
    todayMediation.forEach((m) => {
      if (m.ilkOturumTarihi && m.ilkOturumTarihi >= todayStart && m.ilkOturumTarihi < todayEnd) {
        const time = new Date(m.ilkOturumTarihi).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        lines.push(`• ${time} — Arabuluculuk — Bilgilendirme ve İlk Oturum — ${stripTcFromName(m.basvurucuAd) || "?"}`);
      }
      if (m.sonTutanakTarihi && m.sonTutanakTarihi >= todayStart && m.sonTutanakTarihi < todayEnd) {
        const time = new Date(m.sonTutanakTarihi).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const sonucLabel = m.sonTutanakSonucu === "anlasma" ? "Anlaşma" : "Anlaşamama";
        lines.push(`• ${time} — Arabuluculuk — Son Oturum (${sonucLabel}) — ${stripTcFromName(m.basvurucuAd) || "?"}`);
      }
    });
  } else {
    lines.push("_Bugün için kayıtlı bir duruşma/tebligat yok._");
  }
  lines.push("");

  // 2) Bekleyen alacaklar (vadesi geçenler öne çıkar)
  const receivables = casesWithFee
    .map((c) => {
      const invoiced = c.invoices.reduce((s, i) => s + i.amount, 0);
      const remaining = (c.agreedFee || 0) - invoiced;
      const overdue = c.paymentDueDate ? new Date(c.paymentDueDate) < now : false;
      return { clientName: c.client.name, caseTitle: c.title, remaining, overdue };
    })
    .filter((r) => r.remaining > 0)
    .sort((a, b) => (a.overdue === b.overdue ? b.remaining - a.remaining : a.overdue ? -1 : 1));

  lines.push("💰 *Bekleyen Alacaklar*");
  if (receivables.length) {
    receivables.slice(0, 8).forEach((r) => {
      lines.push(`• ${r.overdue ? "🔴 " : ""}${r.clientName} — ${r.caseTitle}: ${fmtTL(r.remaining)}${r.overdue ? " (vadesi geçti)" : ""}`);
    });
  } else {
    lines.push("_Bekleyen alacak yok._");
  }
  lines.push("");

  // 3) Açık görevler
  lines.push("✅ *Açık Görevler*");
  if (tasks.length) {
    tasks.forEach((t) => {
      lines.push(`• ${t.title}${t.dueDate ? ` (${new Date(t.dueDate).toLocaleDateString("tr-TR")})` : ""}`);
    });
  } else {
    lines.push("_Açık görev yok._");
  }
  lines.push("");

  // 4) Süresi yaklaşan sözleşmeler
  if (contracts.length) {
    lines.push("📄 *Süresi Yaklaşan Sözleşmeler*");
    contracts.forEach((c) => {
      lines.push(`• ${c.title} — ${new Date(c.endDate).toLocaleDateString("tr-TR")}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

function fmtTL(n: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);
}

// Resmi Gazete + hukuk/yargı gündemindeki ciddi haberleri Gemini'nin web
// araması ile özetler. Bu, garantili/eksiksiz bir tarama DEĞİLDİR — AI'ın
// o an web'de bulduğu kadarını özetler.
export async function generateResmiGazeteOzeti(): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return "";
  try {
    const today = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
    const prompt = `Bugün ${today}. Türkiye'de bugünkü Resmi Gazete'de yayınlanan hukuken önemli düzenlemeleri (varsa) ve hukuk/yargı gündemindeki ciddi haberleri (önemli bir mahkeme kararı, kanun değişikliği tartışması vb.) kısaca, madde madde özetle. Türkçe yaz, en fazla 6 madde, her madde tek cümle. Emin olmadığın bir şeyi uydurma; bulamadıysan "Bugün için önemli bir gelişme bulunamadı" yaz.`;

    // Web araması bazen uzun sürebiliyor — 25 saniyeden fazla sürerse
    // vazgeçip geri kalan raporun gönderilmesine izin veriyoruz.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") || "";
    return text.trim();
  } catch (e) {
    return "";
  }
}
