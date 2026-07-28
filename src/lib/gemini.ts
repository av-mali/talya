// Tüm Gemini API çağrıları için ORTAK yardımcı fonksiyon. Ücretsiz Gemini
// API planı çok düşük istek sınırlarına sahiptir (ör. "429
// RESOURCE_EXHAUSTED ... free_tier_requests, limit: 20") — bu SIK
// karşılaşılan, geçici bir durum olabileceğinden, isteğin türüne göre TEK
// bir kısa bekleme + yeniden deneme yapılır (Vercel sunucusuz fonksiyon
// süre sınırını aşmamak için Google'ın önerdiği bekleme süresi olduğu
// gibi DEĞİL, kısa bir tavanla sınırlı kullanılır). Bu da başarısız
// olursa, kullanıcıya ham Google hata JSON'u yerine AÇIK bir Türkçe
// mesaj döndürülür.

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_RETRY_WAIT_MS = 4000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google'ın 429 gövdesindeki "google.rpc.RetryInfo" detayında yer alan
// önerilen bekleme süresini (ör. "14.217331306s") okumaya çalışır;
// bulamazsa veya çok uzunsa, MAX_RETRY_WAIT_MS ile sınırlar.
function retryWaitMs(errorBody: any): number {
  try {
    const details = errorBody?.error?.details;
    if (Array.isArray(details)) {
      for (const d of details) {
        if (typeof d?.retryDelay === "string") {
          const match = d.retryDelay.match(/^([\d.]+)s$/);
          if (match) return Math.min(Math.ceil(parseFloat(match[1]) * 1000), MAX_RETRY_WAIT_MS);
        }
      }
    }
  } catch {
    // yoksay, varsayılana düş
  }
  return MAX_RETRY_WAIT_MS;
}

export type GeminiResult = {
  ok: boolean;
  status: number;
  data: any;
  // İstek başarısız olduysa, kullanıcıya GÖSTERİLEBİLECEK Türkçe mesaj.
  friendlyError?: string;
};

// body: Gemini generateContent isteğinin GÖVDESİ (contents, system_instruction, tools, generationConfig, ...)
export async function callGemini(body: Record<string, any>): Promise<GeminiResult> {
  let lastData: any = null;
  let lastStatus = 500;

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (res.ok) {
      return { ok: true, status: res.status, data };
    }
    lastData = data;
    lastStatus = res.status;

    // Sadece geçici olabilecek hatalarda (kota/aşırı yük) VE elimizde hâlâ
    // deneme hakkı varken bekleyip tekrar dene; diğer hatalarda (geçersiz
    // istek, geçersiz API anahtarı vb.) tekrar denemek zaman kaybıdır.
    const isRetryable = res.status === 429 || res.status === 503;
    if (!isRetryable || attempt === 1) break;
    await sleep(retryWaitMs(data));
  }

  const rawMsg = lastData?.error?.message || `HTTP ${lastStatus}`;
  let friendlyError: string;
  if (lastStatus === 429) {
    friendlyError =
      "Yapay zeka servisinin (Gemini) kullanım sınırına ulaşıldı. Ücretsiz plan dakikalık/günlük istek sayısını sınırlar — birkaç dakika sonra tekrar deneyin. Sorun sık tekrarlıyorsa, Google AI Studio hesabınızda ücretli (paid) bir plana geçerek bu sınırı yükseltebilirsiniz.";
  } else if (lastStatus === 503) {
    friendlyError = "Yapay zeka servisi şu anda yoğun/erişilemez durumda. Lütfen birazdan tekrar deneyin.";
  } else {
    friendlyError = `Yapay zeka servisi bir hata döndürdü: ${rawMsg}`;
  }

  return { ok: false, status: lastStatus, data: lastData, friendlyError };
}
