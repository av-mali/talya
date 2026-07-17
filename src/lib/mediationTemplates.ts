// Arabuluculuk belgelerinin (Davet Mektubu, İlk Oturum Tutanağı, Son
// Tutanak) SABİT/DEĞİŞMEYEN kısımları — gerçek örnek belgelerden BİREBİR
// alınmıştır. Bu metinler AI'a hiç yazdırılmaz (halüsinasyon/hata riski
// olmasın diye) — sadece değişken alanlar (taraf bilgileri, tarihler) ve
// kısa anlatı paragrafları AI ile doldurulur, geri kalanı burada.

export type MediationCaseData = {
  dosyaNo?: string | null;
  basvurucuAd?: string | null;
  basvurucuAdres?: string | null;
  basvurucuVekilAd?: string | null;
  basvurucuBaroSicil?: string | null;
  basvurucuTelefon?: string | null;
  karsiTarafAd?: string | null;
  karsiTarafAdres?: string | null;
  karsiTarafVergiMersis?: string | null;
  karsiTarafYetkiliAd?: string | null;
  karsiTarafVekilAd?: string | null;
  karsiTarafTelefon?: string | null;
  uyusmazlikKonusu?: string | null;
  basvuruTarihi?: string | null;
  gorevlendirmeTarihi?: string | null;
};

export type ArabulucuProfile = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  arabuluculukBurosu?: string | null;
  arabulucuSicilNo?: string | null;
  arabulucuUets?: string | null;
};

function v(val?: string | null, fallback = "……………") {
  return val && val.trim() ? val.trim() : fallback;
}

// Üç belgede de ortak olan başlık bloğu (Arabuluculuk Bürosu, Arabulucu,
// Başvurucu, Karşı Taraf, Uyuşmazlık Konusu, tarihler).
export function buildHeaderBlock(
  c: MediationCaseData,
  a: ArabulucuProfile,
  arabulucuLabel: string, // "ARABULUCU" veya "ARABULUCUNUN"
  extraLine?: string // ör. "Arabuluculuk Sonucu\t\t\t: ANLAŞMA"
): string {
  return `ARABULUCULUK BÜROSU\t\t\t\t  
 
\tArabuluculuk Bürosu\t: ${v(a.arabuluculukBurosu)}
 \tDosya Numarası\t: ${v(c.dosyaNo)}

${arabulucuLabel}\t\t\t\t\t
\t
\tAdı ve Soyadı\t: ${v(a.name)}
\tSicil Numarası\t: ${v(a.arabulucuSicilNo)}
\tTelefon\t: ${v(a.phone)}
\tUETS\t: ${v(a.arabulucuUets)}
\tE-Posta\t: ${v(a.email)}

BAŞVURUCU\t\t\t
\t
\tAdı Soyadı\t: ${v(c.basvurucuAd)}
\tAdresi\t: ${v(c.basvurucuAdres)}
\tVekili\t: ${v(c.basvurucuVekilAd, "")}
\tBaro / Sicil Numarası\t: ${v(c.basvurucuBaroSicil, "")}
\tTelefon\t: ${v(c.basvurucuTelefon)}

KARŞI TARAF\t\t\t

\tAdı ve Soyadı\t: ${v(c.karsiTarafAd)}
\tAdres\t: ${v(c.karsiTarafAdres)}
\tVergi/Mersis/Detsis No\t: ${v(c.karsiTarafVergiMersis, "")}
\tŞirket Yetkilisi\t: ${v(c.karsiTarafYetkiliAd, "")}
\tTelefon\t: ${v(c.karsiTarafTelefon)}

ARABULUCULUK KONUSU UYUŞMAZLIK
 
${v(c.uyusmazlikKonusu)}
 
Arabuluculuk Bürosuna Başvuru Tarihi\t\t: ${v(c.basvuruTarihi)}
Arabulucunun Görevlendirildiği Tarih\t\t: ${v(c.gorevlendirmeTarihi)}
Tutanağının Düzenlendiği Tarih\t\t: ${v(c.gorevlendirmeTarihi)}${extraLine ? "\n" + extraLine : ""}
`;
}

// İmza bloğu — Başvurucu tarafında vekil varsa vekil adı + "Başvurucu
// Vekili", yoksa başvurucunun kendisi; karşı tarafta da aynı mantık
// (şirket yetkilisi / vekil / kendisi).
export function buildSignatureBlock(c: MediationCaseData, a: ArabulucuProfile): string {
  const basvurucuSign = c.basvurucuVekilAd
    ? { name: c.basvurucuVekilAd, role: "Başvurucu Vekili" }
    : { name: v(c.basvurucuAd), role: "Başvurucu" };

  const karsiSign = c.karsiTarafVekilAd
    ? { name: c.karsiTarafVekilAd, role: "Karşı Taraf Vekili" }
    : c.karsiTarafYetkiliAd
    ? { name: c.karsiTarafYetkiliAd, role: "Karşı Taraf (Şirket Yetkilisi)" }
    : { name: v(c.karsiTarafAd), role: "Karşı Taraf" };

  return `        ${basvurucuSign.name}\t\t${karsiSign.name}\tArb. ${v(a.name)}
       ${basvurucuSign.role}                         ${karsiSign.role}                        (Sicil No: ${v(a.arabulucuSicilNo)})
      ¸\t                      ¸                  \t     ¸
 

   
 Bu evrak 5070 sayılı Elektronik İmza Kanunu hükümlerine uygun olarak elektronik imza ile imzalanmıştır.
`;
}

// İlk Oturum Tutanağı'nda değişmeyen, uzun yasal bilgilendirme metni —
// örnek belgeden birebir alınmıştır.
export const ILK_OTURUM_BILGILENDIRME = `\tTaraflara arabuluculuğun temel ilkeleri olan, arabuluculuk sürecinin iradi olduğu; arabuluculuk sürecinde her iki tarafın da eşit haklara sahip olduğu; taraflarca aksi kararlaştırılmadıkça arabulucunun arabuluculuk faaliyeti çerçevesinde kendisine sunulan veya diğer bir şekilde elde ettiği bilgi ve belgeler ile diğer kayıtları gizli tutmakla yükümlü olduğu ve tarafların ve görüşmelere katılan diğer kişilerin de bu konudaki gizliliğe uymak zorunda olduğu; tarafların, arabulucunun veya arabuluculuğa katılanlar da dâhil üçüncü bir kişinin, uyuşmazlıkla ilgili hukuk davası açıldığında yahut tahkim yoluna başvurulduğunda, tarafların arabuluculuk sürecine katılma isteğini, arabuluculuk sürecinde taraflarca ileri sürülen görüşleri, önerileri ya da herhangi bir vakıanın veya iddianın kabulünü ve sadece arabuluculuk faaliyeti dolayısıyla hazırlanan belgeleri delil olarak ileri süremeyeceği ve bunlar hakkında tanıklık yapamayacağı hususları hakkında bilgi verildi.

\tTaraflara arabulucunun görevini özenle, tarafsız bir biçimde ve şahsen yerine getireceği, arabulucunun taraflar arasında eşitliği gözetmekle yükümlü olduğu, arabuluculuk müzakerelerine tarafların bizzat, kanuni temsilcileri veya vekâletnamesinde özel yetki bulunan avukatları aracılığıyla katılabileceği, arabuluculuk sürecinde arabulucunun rolünün, hâkim veya hakem olmadığı, kimin haklı ya da haksız olduğu konusunda karar vermeyeceği, yargısal bir yetkinin kullanımı olarak sadece hâkim tarafından yapılabilecek işlemleri yapamayacağı, taraflara hukuki tavsiyelerde bulunamayacağı, tarafların çözüm üretemediklerinin ortaya çıkması hâlinde arabulucunun bir çözüm önerisinde bulunabileceği, yaşanılan uyuşmazlık ile ilgili çözüm seçeneklerini üreterek bir anlaşmaya ulaşabilmelerinde taraflara yardımcı olacak iletişimin ortamını sağlayacağı, bilgileri dâhilinde taraflarla ayrı ayrı veya birlikte görüşebileceği ve iletişim kurabileceği, arabulucu olarak tarafsız bir konumda olduğu, arabuluculuk sürecinin sonunda her iki tarafın da kabul edeceği bir anlaşmaya varılamaması hâlinde açılabilecek olası bir davada, daha sonra avukat olarak görev üstlenemeyeceği, arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar geçen sürede zamanaşımının duracağı ve hak düşürücü sürenin işlemeyeceği, arabuluculuk sürecinin sonunda her iki tarafın da kabul edeceği bir anlaşmaya varılamaması hâlinde yargı organlarına başvuru haklarının bulunduğu hususları hakkında bilgi verildi.

\tTaraflara arabuluculuk sürecinde düzenlenecek oturum tutanaklarına ve sürecin sonunda düzenlenecek son tutanağa, oturumların ve faaliyetin sonuçlanması ile arabulucunun son çözüm önerisi dışında hangi hususların yazılacağına tarafların karar vereceği; bununla beraber, bu hususta tarafların birlikte karar verememesi halinde son tutanağın içeriğinin tarafların karşılıklı teklif ve kabulleri dahil olmak üzere arabulucu tarafından düzenleneceği, arabuluculuk sürecinin sonunda varılan anlaşmanın kapsamının taraflarca belirleneceği, anlaşma belgesi düzenlenmesi hâlinde bu belgenin taraflar veya avukatları ve arabulucu tarafından imzalanacağı, tarafların bu anlaşma belgesinin icra edilebilirliğine ilişkin mahkemeden şerh verilmesini talep edebileceği ve bu şerhi içeren anlaşmanın ilâm niteliğinde belge sayılacağı, taraflar ve avukatları ile arabulucunun birlikte imzaladıkları anlaşma belgesinin icra edilebilirlik şerhi aranmaksızın ilâm niteliğinde belge sayılacağı, arabuluculuk faaliyeti sonunda anlaşmaya varılması hâlinde üzerinde anlaşılan hususlar hakkında taraflarca dava açılamayacağı hususları hakkında bilgi verildi.

\tTaraflara arabuluculuk faaliyeti sonunda anlaşmaları hâlinde, arabuluculuk ücretinin, Arabuluculuk Asgari Ücret Tarifesinin eki Arabuluculuk Ücret Tarifesinin İkinci Kısmına göre yüzdelik dilim üzerinden nispi olarak, aksi kararlaştırılmadıkça taraflarca eşit şekilde karşılanacağı, bu durumda ücretin Tarifenin Birinci Kısmında belirlenen iki saatlik ücret tutarından az olamayacağı; arabuluculuk faaliyeti sonunda iki saatten az süren görüşmeler sonunda tarafların anlaşamamaları hâllerinde iki saatlik ücret tutarının Tarifenin Birinci Kısmına göre Adalet Bakanlığı bütçesinden ödeneceği, iki saatten fazla süren görüşmeler sonunda tarafların anlaşamamaları hâlinde ise iki saati aşan kısma ilişkin ücretin aksi kararlaştırılmadıkça taraflarca eşit şekilde uyuşmazlığın konusu dikkate alınarak Tarifenin Birinci Kısmına göre karşılanacağı, Adalet Bakanlığı bütçesinden ödenen ve taraflarca karşılanan arabuluculuk ücretinin yargılama giderlerinden sayılacağı hususları hakkında bilgi verildi.

\tAyrıca, taraflara, kendilerinden arabuluculuk sürecinde birbirlerine karşı "siz"li hitap şeklini kullanmalarının ve söz verildiği zaman, sırayla ve sözleri kesilmeden konuşmalarının beklendiği, birbirlerinin sözünü kesmelerinin, söz veya hareketle diğer tarafı tahkir etmelerinin yasak olduğu, daha sonra eklemek istedikleri hususlar hakkında kendilerine konuşma olanağı tanınacağı, arabulucu tarafından da kendilerine sorular sorulabileceği hususları belirtilmiş; arabuluculuk sürecinde olabildiğince açık ve dürüst olunmasının ve işbirliği hâlinde hareket edilmesinin önemi vurgulanmış; arabuluculuk sürecinde belirtilen kurullara uymayı kabul edip etmedikleri kendilerine sorulmuştur.

\tTaraflar söz alarak arabuluculuğun temel ilkelerini, arabuluculuk sürecini ve arabuluculuk süreci sonunda hazırlanan arabuluculuk son tutanağının ve anlaşma belgesinin hukuki ve mali yönlerden bütün sonuçlarını anladık, arabuluculuk sürecinde ve bu tutanakta belirtilen kurullara uymayı kabul ediyoruz dediler.`;

// Anlaşma Son Tutanağı'nda yer alan, kısa standart kapanış paragrafları.
export const ANLASMA_KAPANIS = `\tTaraflara arabuluculuğun temel ilkeleri, arabuluculuk süreci ile arabuluculuk süreci sonunda hazırlanan son tutanağın hukuki ve mali sonuçları hakkında gerekli bilgiler verilmiştir.\t

\tTaraflar, yapılan görüşmeler sırasında arabuluculuğun temel ilkelerini, arabuluculuk sürecini ve arabuluculuk son tutanağının hukuki ve mali sonuçlarını anladıklarını beyan etmişlerdir.`;

// Davet Mektubu'nda hiç değişmeyen, uzun HUAK bilgilendirme metni —
// örnek belgeden birebir alınmıştır.
export const DAVET_MEKTUBU_BILGILENDIRME = `Başvuruya konu hukuki uyuşmazlığınızın 6325 Sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu kapsamında, tarafların üzerinde serbestçe tasarruf edebileceği iş ve işlemlerden doğan özel hukuk uyuşmazlığı olduğu anlaşılmaktadır.
Bu bağlamda, gerçekleştirilecek arabuluculuk sürecinin daha verimli geçmesi için, arabuluculukla ilgili şu hususları bilgilerinize sunmak isterim
Arabulucu taraflar arasındaki hukuki uyuşmazlığın çözümünde tarafsız ve bağımsız bir üçüncü kişi olarak yer alır ve taraflar arasındaki iletişim ortamını kolaylaştırarak kendi çözümlerini kendilerinin üretmeleri konusunda onlara yardımcı olur. Tarafların çözüm üretemediklerinin ortaya çıkması halinde arabulucu bir çözüm önerisinde de bulunabilir.
Arabuluculuk yoluyla uyuşmazlığın çözümü gönüllülük esasına dayalıdır. Taraflar, süreci devam ettirmek, sonuçlandırmak veya bu süreçten vazgeçmek konusunda serbesttirler.
Arabuluculuk yoluyla uyuşmazlığın çözümü ekonomik, sosyal ve psikolojik bakımdan faydalıdır. Arabuluculuk süreci taraflar arasındaki ilişkilerin korunmasına yardımcı olur ve toplumsal barışa hizmet eder.
Taraflarca aksi kararlaştırılmadıkça arabuluculuk görüşmelerinde gizlilik ilkesine uyulması esastır. Bu durum, ticari, mesleki ve kişisel sırlarınızın korunmasını sağlayacağı gibi ticari, mesleki ve kişisel itibarınızın zarar görmesini de engelleyecektir.
Arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar geçen sürede zamanaşımı durur ve hak düşürücü süre işlemez (HUAK m. 18A/15).
Dava açılmadan önce ihtiyati tedbir kararı verilmesi hâlinde 6100 sayılı Kanunun 397.maddesinin birinci fıkrasında, ihtiyati haciz kararı verilmesi hâlinde ise 9/6/1932 tarihli ve 2004 sayılı İcra ve İflas Kanununun 264'üncü maddesinin birinci fıkrasında düzenlenen dava açma süresi, arabuluculuk bürosuna başvurulmasından son tutanağın düzenlendiği tarihe kadar işlemez (HUAK m. 18A/16).
Davacı, arabuluculuk faaliyeti sonunda anlaşmaya varılamadığına ilişkin son tutanağın aslını veya arabulucu tarafından onaylanmış bir örneğini dava dilekçesine eklemek zorundadır. Bu zorunluluğa uyulmaması hâlinde mahkemece davacıya, son tutanağın bir haftalık kesin süre içinde mahkemeye sunulması gerektiği, aksi takdirde davanın usulden reddedileceği ihtarını içeren davetiye gönderilir. İhtarın gereği yerine getirilmez ise dava dilekçesi karşı tarafa tebliğe çıkarılmaksızın davanın usulden reddine karar verilir. Arabulucuya başvurulmadan dava açıldığının anlaşılması hâlinde herhangi bir işlem yapılmaksızın davanın, dava şartı yokluğu sebebiyle usulden reddine karar verilir. (HUAK m. 3/2).
Arabulucu, yapılan başvuruyu görevlendirildiği tarihten itibaren üç hafta içinde sonuçlandırır. Bu süre zorunlu hâllerde arabulucu tarafından en fazla bir hafta uzatılabilir (HUAK m. 18A/9).
Arabulucu, taraflara ulaşılamaması, taraflar katılmadığı için görüşme yapılamaması yahut yapılan görüşmeler sonucunda anlaşmaya varılması veya varılamaması hâllerinde arabuluculuk faaliyetini sona erdirir ve son tutanağı düzenleyerek durumu derhâl arabuluculuk bürosuna bildirir (HUAK m.18A/10).
Tarafların arabuluculuk faaliyeti sonunda anlaşmaları hâlinde, arabuluculuk ücret, Arabuluculuk Asgari Ücret Tarifesinin eki Arabuluculuk Ücret Tarifesinin İkinci Kısmına göre karşılanır. Bu durumda ücret, Tarifenin Birinci Kısmında belirlenen iki saatlik ücret tutarından az olamaz. (HUAK m. 18A/12)
Arabuluculuk faaliyeti sonunda taraflara ulaşılamaması, taraflar katılmadığı için görüşme yapılamaması veya iki saatten az süren görüşmeler sonunda tarafların anlaşamamaları hâllerinde, iki saatlik ücret tutarı Tarifenin Birinci Kısmına göre Adalet Bakanlığı bütçesinden ödenir. İki saatten fazla süren görüşmeler sonunda tarafların anlaşamamaları hâlinde ise iki saati aşan kısma ilişkin ücret aksi kararlaştırılmadıkça taraflarca eşit şekilde uyuşmazlığın konusu dikkate alınarak Tarifenin Birinci Kısmına göre karşılanır. Adalet Bakanlığı bütçesinden ödenen ve taraflarca karşılanan arabuluculuk ücret, yargılama giderlerinden sayılır. (HUAK m. 18A/13)
Arabuluculuk müzakerelerine taraflar bizzat, kanuni temsilcileri veya avukatları aracılığıyla katılabilirler. Uyuşmazlığın çözümüne katkı sağlayabilecek uzman kişiler de müzakerelerde hazır bulundurulabilir (HUAK m. 15/6).
Arabuluculuk görüşmeleri, taraflarca aksi kararlaştırılmadıkça, arabulucuyu görevlendiren büronun bağlı bulunduğu adli yargı ilk derece mahkemesi adalet komisyonunun yetki alanı içinde yürütülür (HUAK m. 18A/17).
Yukarıda belirtilen tarihte yapılacak ilk toplantıya taraflardan birinin geçerli bir mazeret göstermeksizin katılmaması sebebiyle arabuluculuk faaliyetinin sona ermesi durumunda toplantıya katılmayan taraf, son tutanakta belirtilir ve bu taraf davada kısmen veya tamamen haklı çıksa bile yargılama giderinin tamamından sorumlu tutulur. Ayrıca bu taraf lehine vekâlet ücretine hükmedilmez. Her iki tarafın da ilk toplantıya katılmaması sebebiyle sona eren arabuluculuk faaliyeti üzerine açılacak davalarda tarafların yaptıkları yargılama giderleri kendi üzerlerinde bırakılır. (HUAK m.18A/11)
Arabuluculuk görüşmelerine, gerçek kişilerin kimlik belgesi, şirket yetkililerinin kimlik belgesi ve imza sirküleri, avukatların kimlik belgesi ve arabuluculuk görüşmelerine katılma konusunda özel yetki bulunan vekâletname ile toplantıya katılması gerekmektedir. Arabuluculuk görüşmelerinde, idarenin taraf olduğu uyuşmazlıklarda idareyi, üst yönetici tarafından belirlenen iki üye ile hukuk birimi amiri veya onun belirleyeceği bir avukat ya da hukuk müşavirinden oluşan komisyon temsil eder (HUAK m. 15/8). Komisyon kendisini vekil ile temsil ettiremez (HUAK Yönetmeliği m. 18/1).
Katılımınızı bekler, arabuluculuk sürecinin barışçıl bir çözümle sonuçlanmasını dilerim.`;

export function buildDavetMektubu(
  c: MediationCaseData,
  a: ArabulucuProfile,
  davetEdilenAd: string,
  davetEdilenVekil: string,
  davetEdilenBaroSicil: string,
  davetEdilenTelefon: string,
  gunSaat: string,
  toplantiYeri: string,
  uyusmazlikOzeti: string,
  today: string
): string {
  return `ARABULUCULUK SÜRECİNE DAVET MEKTUBUDUR
DAVETTE BULUNAN\t
Arabulucu\t\t: Arb. ${v(a.name)}
TELFON\t\t: ${v(a.phone)}
E-Mail\t\t\t: ${v(a.email)}
Adres\t\t\t: ${v(a.arabuluculukBurosu)}

DAVET EDİLEN      \t\t
Adı / Soyadı\t\t: ${v(davetEdilenAd)}
Vekili\t\t\t: ${v(davetEdilenVekil, "")}
Baro / Sicil \t\t: ${v(davetEdilenBaroSicil, "")}
Telefon\t\t: ${v(davetEdilenTelefon)}
GÜN VE SAAT\t\t: ${v(gunSaat)}
TOPLANTI YERİ\t\t: ${v(toplantiYeri)}
AÇIKLAMALAR VE BİLGİLENDİRMELER: 
Sayın ${v(davetEdilenAd)}${davetEdilenVekil ? " ve vekili Sayın " + davetEdilenVekil : ""},
Tarafınızca ${v(a.arabuluculukBurosu)}'na yapılan başvuru üzerine UYAP Arabulucu Portal tarafından görevlendirilmiş Türkiye Cumhuriyeti Adalet Bakanlığı'ndaki resmi sicile kayıtlı ${v(a.arabulucuSicilNo)} sicil numaralı arabulucuyum.
${v(uyusmazlikOzeti)} uyuşmazlığının, barışçıl olarak arabuluculuk yoluyla çözümlenmesine olanak sağlamak üzere, sizi tüm tarafların katılımıyla gerçekleşmeyi dilediğimiz arabuluculuk ilk oturumuna davet ediyorum.
${DAVET_MEKTUBU_BILGILENDIRME}
Saygılarımla… ${today}`;
}
