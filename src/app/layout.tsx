import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Subtrack",
  description: "A sua aplicação para gerir subscrições.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <head>
        {/* A LINHA MAIS IMPORTANTE ESTÁ AQUI */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Outras tags podem estar aqui, como a dos ícones */}
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <meta name="theme-color" content="#1f2937" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}