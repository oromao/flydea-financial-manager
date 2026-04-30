import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { CopilotWrapper } from "@/components/copilot/copilot-wrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-on-background selection:bg-secondary/30 selection:text-secondary">
        <ErrorBoundary>
          <Providers session={session}>
            <Sidebar>{children}</Sidebar>
            <CopilotWrapper />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
