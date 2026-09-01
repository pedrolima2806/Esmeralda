import type { Metadata } from "next";
import { Cinzel, Ubuntu, Ubuntu_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ubuntu",
});

const ubuntuMono = Ubuntu_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu-mono",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Esmeralda",
  description: "Informação financeira com contexto e clareza.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${ubuntu.variable} ${ubuntuMono.variable} ${cinzel.variable}`}>
      <body><SiteHeader />{children}</body>
    </html>
  );
}
