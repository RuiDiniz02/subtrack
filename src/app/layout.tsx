import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext"; // Importar
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ['700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: "Subtrack",
  description: "Your application to manage subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          <SettingsProvider> {/* Adicionado */}
            {children}
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}