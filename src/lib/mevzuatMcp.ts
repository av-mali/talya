// Adalet Bakanlığı Mevzuat Bilgi Sistemi'ne (mevzuat.gov.tr) erişimi
// kolaylaştıran, açık kaynaklı (MIT lisanslı) topluluk projesinin
// ücretsiz, herkese açık uzak sunucusunu kullanıyoruz:
// https://github.com/saidsurucu/mevzuat-mcp
//
// ÖNEMLİ: Bu, resmi bir devlet API'si DEĞİL — bağımsız bir geliştiricinin
// gönüllü olarak barındırdığı bir servis. Her an durabilir/değişebilir.
// Bu yüzden her çağrıda hataları nazikçe ele alıp kullanıcıya net bir
// mesaj veriyoruz, sistemi buna bağımlı kılmıyoruz.

const MCP_URL = "https://mevzuat.surucu.dev/mcp/";

async function mcpRequest(body: any, sessionId?: string): Promise<{ data: any; sessionId?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const newSessionId = res.headers.get("mcp-session-id") || sessionId;
  const contentType = res.headers.get("content-type") || "";

  let data: any;
  if (contentType.includes("text/event-stream")) {
    const text = await res.text();
    const lines = text.split("\n").filter((l) => l.startsWith("data:"));
    const lastData = lines[lines.length - 1]?.replace(/^data:\s*/, "");
    data = lastData ? JSON.parse(lastData) : null;
  } else {
    data = await res.json();
  }

  return { data, sessionId: newSessionId || undefined };
}

async function getSession(): Promise<string | undefined> {
  const init = await mcpRequest({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "talya-hukuk", version: "1.0.0" },
    },
  });
  const sessionId = init.sessionId;
  try {
    await mcpRequest({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }, sessionId);
  } catch (e) {
    /* bazı sunucular bunu istemiyor, sorun değil */
  }
  return sessionId;
}

function extractToolResult(callRes: any): any {
  const content = callRes.data?.result?.content;
  if (!content || !content.length) return null;
  const textPart = content.find((c: any) => c.type === "text");
  if (!textPart) return null;
  return textPart.text; // ham metin — çağıran taraf gerekirse JSON/metin ayrıştırır
}

// GERÇEK VERİYLE TEST EDİLEREK BULUNDU: Servis JSON değil, şu formatta
// düz metin bir rapor döndürüyor:
//   Search: title='...'
//   Results: N total (page P)
//
//   - [5237] BAŞLIK (TÜR) | mevzuatId: 117657 | RG: 2022-02-25
//   - [...] ...
function parseMevzuatSearchText(text: string) {
  if (typeof text !== "string") return [];
  const lines = text.split("\n").filter((l) => l.trim().startsWith("- ["));
  return lines.map((line) => {
    const parts = line.split(" | ").map((p) => p.trim());
    const first = parts[0];
    const m = first.match(/^-\s*\[(.+?)\]\s+(.*)$/);
    const mevzuatNo = m ? m[1] : "";
    let rest = m ? m[2] : first;
    let mevzuatTur = "";
    const typeMatch = rest.match(/\(([^()]+)\)\s*$/);
    if (typeMatch) {
      mevzuatTur = typeMatch[1];
      rest = rest.slice(0, typeMatch.index).trim();
    }
    const extra: Record<string, string> = {};
    for (let i = 1; i < parts.length; i++) {
      const idx = parts[i].indexOf(":");
      if (idx > -1) extra[parts[i].slice(0, idx).trim()] = parts[i].slice(idx + 1).trim();
    }
    return {
      mevzuatNo,
      mevzuatAdi: rest,
      mevzuatTur,
      mevzuatId: extra["mevzuatId"] || "",
      resmiGazeteTarihi: extra["RG"] || "",
    };
  });
}

// Madde ağacı da muhtemelen benzer bir düz metin liste formatında geliyor —
// "- [madde_id] Başlık" satırlarını ayrıştırıyoruz. Format tam olarak
// doğrulanamadı (canlı test gerekiyor), bu yüzden birkaç olası kalıbı
// deniyoruz.
function parseMevzuatTreeText(text: string) {
  if (typeof text !== "string") return [];
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("-"));
  return lines.map((line) => {
    const m = line.match(/^-\s*\[(.+?)\]\s+(.*)$/);
    if (m) return { maddeId: m[1], maddeAdi: m[2] };
    return { maddeId: "", maddeAdi: line.replace(/^-\s*/, "") };
  });
}

export async function searchMevzuat(query: string, maxResults = 6) {
  const sessionId = await getSession();
  const isNumeric = /^\d+$/.test(query.trim());

  // Sayısal bir arama ise (ör. "5237"), hem isimde hem kanun numarasında
  // ara — TCK gibi kanunların adında sayı geçmez ama numarasında geçer.
  const searches = isNumeric
    ? [
        { name: "search_mevzuat", arguments: { mevzuat_no: query, page_size: maxResults } },
        { name: "search_mevzuat", arguments: { mevzuat_adi: query, page_size: maxResults } },
      ]
    : [{ name: "search_mevzuat", arguments: { mevzuat_adi: query, page_size: maxResults } }];

  const allResults: any[] = [];
  const seenIds = new Set<string>();

  for (const s of searches) {
    try {
      const callRes = await mcpRequest(
        { jsonrpc: "2.0", id: 2, method: "tools/call", params: s },
        sessionId
      );
      const raw = extractToolResult(callRes);
      const parsed = Array.isArray(raw) ? raw : parseMevzuatSearchText(raw);
      for (const item of parsed) {
        const id = item.mevzuatId || item.mevzuatNo;
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          allResults.push(item);
        }
      }
    } catch (e) {
      /* bu arama türü başarısız oldu, diğerine devam et */
    }
  }

  return allResults;
}

export async function getMevzuatArticleTree(mevzuatId: string): Promise<{ parsed: any[]; raw: any }> {
  const sessionId = await getSession();
  const callRes = await mcpRequest(
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_mevzuat_article_tree", arguments: { mevzuat_id: mevzuatId } },
    },
    sessionId
  );
  const raw = extractToolResult(callRes);
  const parsed = Array.isArray(raw) ? raw : parseMevzuatTreeText(raw);
  return { parsed, raw };
}

export async function getMevzuatArticleContent(mevzuatId: string, maddeId: string) {
  const sessionId = await getSession();
  const callRes = await mcpRequest(
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_mevzuat_article_content", arguments: { mevzuat_id: mevzuatId, madde_id: maddeId } },
    },
    sessionId
  );
  return extractToolResult(callRes); // burada ham metin zaten aradığımız şey
}
