import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Game Dev Lab — 34 Playable Concepts", template: "%s | Game Dev Lab" },
  description: "Explore 34 game development concepts with live interactive examples, TypeScript snippets, and practical AI prompt starters.",
};
export const viewport: Viewport = { themeColor: "#090c14" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
