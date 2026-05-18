"use client";

import { FileUp, Receipt, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "./empty-state";

interface EmptyTransactionsProps {
  onImportClick?: () => void;
}

export function EmptyTransactions({ onImportClick }: EmptyTransactionsProps) {
  return (
    <EmptyState
      icon={Receipt}
      title="Nenhuma movimentação ainda"
      description="Importe suas transações bancárias ou adicione manualmente para ter o controle financeiro completo."
      ctaLabel={onImportClick ? undefined : "Importar extrato"}
      onCta={undefined}
      secondaryCta={onImportClick ? { label: "Importar", onClick: onImportClick } : undefined}
    />
  );
}

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5">
        <TrendingUp className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1.5">
        Bem-vindo ao FlyDea!
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
        Sua jornada financeira começa aqui. Importe seu primeiro extrato ou adicione uma transação.
      </p>
      <Link href="/movimentacoes" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-on-primary text-sm font-medium hover:brightness-110 active:scale-[0.97] transition-all">
        <FileUp className="w-4 h-4 mr-2" />
        Importar extrato
      </Link>
    </div>
  );
}

export function EmptyCategories() {
  return (
    <div className="flex flex-col items-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Wallet className="w-7 h-7 text-muted-foreground/40" />
      </div>
      <h4 className="font-semibold text-foreground mb-1">Nenhuma categoria</h4>
      <p className="text-xs text-muted-foreground">Categorias aparecerão quando você importar transações</p>
    </div>
  );
}
