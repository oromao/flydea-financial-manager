import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { InstallPrompt } from "@/components/install-prompt";

export const metadata: Metadata = {
  title: "Flydea Financial",
  description: "Controle financeiro inteligente",
  appleWebApp: {
    capable: true,
    title: "Flydea",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1D1D1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
        <Providers>
          <InstallPrompt />
          <Sidebar>{children}</Sidebar>
        </Providers>
      </body>
    </html>
  );
}
