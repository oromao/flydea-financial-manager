import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WeeklyCashflow } from "@/components/weekly-cashflow";
import { InvoiceManager } from "@/components/invoice-manager";

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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Seu fluxo de caixa
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Previsão das próximas semanas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Coluna principal: Fluxo semanal */}
          <div className="md:col-span-2">
            <WeeklyCashflow />
          </div>

          {/* Sidebar: Gerenciar notas */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 md:sticky md:top-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Receitas esperadas
              </h2>
              <InvoiceManager />

              {/* Info */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">💡 Dica</h4>
                <p className="text-xs sm:text-sm text-blue-800">
                  Adicione suas receitas programadas para ver a previsão das próximas semanas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
