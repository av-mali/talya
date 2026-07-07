// Aynı dosyada (ör. bir icra/dava dosyasında) birden fazla müvekkil temsil
// edilebilir — UYAP'tan aktarım yapıldığında bu, aynı duruşma/ödeme
// tarihi için birden fazla ayrı kayıt (her müvekkil için bir tane)
// oluşturur. Bildirimlerde ve ana sayfada bunları TEK satırda,
// müvekkil isimleri birleştirilmiş halde göstermek için kullanılır.

type RawEvent = {
  id: string;
  type: string;
  title: string;
  dueDate: Date;
  case: { title: string; client: { name: string } };
};

export type GroupedEvent = {
  ids: string[];
  combinedId: string;
  caseTitle: string;
  type: string;
  title: string;
  dueDate: Date;
  clientNames: string[];
  clientNamesDisplay: string;
};

export function groupEventsByCaseAndDate(events: RawEvent[]): GroupedEvent[] {
  const map = new Map<string, GroupedEvent>();

  for (const e of events) {
    // Aynı dosya + aynı tarih + aynı tür = tek olay, birden fazla müvekkil olabilir.
    const key = `${e.dueDate.getTime()}|${e.case.title}|${e.type}`;
    if (!map.has(key)) {
      map.set(key, {
        ids: [],
        combinedId: "",
        caseTitle: e.case.title,
        type: e.type,
        title: e.title,
        dueDate: e.dueDate,
        clientNames: [],
        clientNamesDisplay: "",
      });
    }
    const g = map.get(key)!;
    g.ids.push(e.id);
    if (!g.clientNames.includes(e.case.client.name)) {
      g.clientNames.push(e.case.client.name);
    }
  }

  return Array.from(map.values()).map((g) => {
    g.combinedId = g.ids.join(",");
    g.clientNamesDisplay =
      g.clientNames.length > 2
        ? `${g.clientNames.slice(0, 2).join(", ")} +${g.clientNames.length - 2} diğer`
        : g.clientNames.join(", ");
    return g;
  });
}
