import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Talya — Hukuk Yapay Zekası",
  description: "Türkiye'nin en gelişmiş hukuk yapay zekası",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        {/* Ana stil dosyası artık burada, kök düzeyde — her sayfa kendi
            içinde ayrı ayrı yüklemek yerine, tarayıcı içerik boyanmadan
            ÖNCE bunu garanti şekilde indirmiş oluyor. Böylece "önce
            stilsiz, sonra renkli" titremesi (hem açık hem koyu modda)
            ortadan kalkıyor. */}
        <link rel="stylesheet" href="/talya-original.css" />
        {/* Karanlık mod VE renk paleti titremesini (flash) önler — ikisi
            de sayfa içeriği boyanmadan ÖNCE, senkron olarak uygulanır.
            engine.js'in geç yüklenmesini beklemezler. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('talya-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}var p=localStorage.getItem('talya-palette');if(p&&p!=='varsayilan'){document.documentElement.setAttribute('data-palette',p);}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
