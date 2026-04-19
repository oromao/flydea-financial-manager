import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import dynamic from "next/dynamic";

const CopilotSidebar = dynamic(() => import("@/components/copilot/copilot-sidebar").then(mod => ({ default: mod.CopilotSidebar })), { ssr: false });

export const metadata: Metadata = {
  title: "Flydea - Seu assistente financeiro",
  description: "Assistente financeiro pessoal que ajuda você a decidir melhor",
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
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
        <ErrorBoundary>
          <Providers>
            <Sidebar>{children}</Sidebar>
            <CopilotSidebar />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
