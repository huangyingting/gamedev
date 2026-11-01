import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LocaleProvider } from "@/components/LocaleProvider";
import { messages, type Locale } from "@/lib/i18n";
import "@/app/globals.css";

export const viewport: Viewport = { themeColor: "#090c14" };
export const siteMetadata = (locale: Locale): Metadata => ({
  metadataBase: new URL("https://huangyingting.github.io"),
  title: { default: messages[locale].siteTitle, template: `%s | ${messages[locale].siteName}` },
  description: messages[locale].siteDescription,
});

export function SiteLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <LocaleProvider locale={locale}>
          <a className="skip-link" href="#main">{messages[locale].skipContent}</a>
          <Header />
          {children}
          <Footer locale={locale} />
        </LocaleProvider>
      </body>
    </html>
  );
}
