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
  try {
    return JSON.parse(textPart.text);
  } catch (e) {
    return textPart.text;
  }
}

export async function searchMevzuat(query: string, maxResults = 6) {
  const sessionId = await getSession();
  const callRes = await mcpRequest(
    {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "search_mevzuat",
        arguments: { mevzuat_adi: query, page_size: maxResults },
      },
    },
    sessionId
  );
  return extractToolResult(callRes);
}

export async function getMevzuatArticleTree(mevzuatId: string) {
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
  return extractToolResult(callRes);
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
  return extractToolResult(callRes);
}
