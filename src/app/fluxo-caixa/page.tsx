import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WeeklyCashflow } from "@/components/weekly-cashflow";
import { InvoiceManager } from "@/components/invoice-manager";
import { BarChart3, ReceiptText, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Fluxo de Caixa",
  description: "Previsão semanal de caixa e controle de receitas"
};

export default async function CashflowPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <PageErrorBoundary>
    <div className="space-y-10 max-w-7xl mx-auto pb-24 md:pb-8 px-4 md:px-0">
      <PageHeader icon={BarChart3} title="Fluxo de Caixa" subtitle="Previsão e controle de liquidez" iconClassName="bg-secondary text-on-secondary shadow-secondary/20" />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-12 gap-8 items-start">
        {/* Coluna principal: Fluxo semanal */}
        <div className="lg:col-span-8">
          <WeeklyCashflow />
        </div>

        {/* Sidebar: Gerenciar notas */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 md:sticky md:top-8">
            <CardHeader>
              <CardTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2 mb-6">
                <ReceiptText className="w-5 h-5 text-secondary" />
                Receitas Esperadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InvoiceManager />
            </CardContent>

            <Separator className="mx-6" />

            {/* Info */}
            <CardContent>
              <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                <h4 className="text-sm font-black uppercase tracking-widest text-secondary mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Dica da IA
                </h4>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Adicione suas notas de receita futuras para que o PicoClaw possa prever com precisão seu saldo nos proximos 30 dias.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PageErrorBoundary>
  );
}
