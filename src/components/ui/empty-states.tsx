"use client";

import { Button } from "@/components/ui/button";
import { FileUp, Receipt, TrendingUp, Wallet, Plus } from "lucide-react";
import Link from "next/link";

interface EmptyTransactionsProps {
  onImportClick?: () => void;
}

export function EmptyTransactions({ onImportClick }: EmptyTransactionsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mb-6">
        <Receipt className="w-10 h-10 text-on-surface-variant/30" />
      </div>
      <h3 className="text-lg font-bold text-on-background mb-2">
        Nenhuma movimentação ainda
      </h3>
      <p className="text-sm text-on-surface-variant/70 max-w-xs mb-6">
        Comece imports suas transações bancárias ou adicione manualmente para ter o controle financeiro completo.
      </p>
      <div className="flex gap-3">
        {onImportClick && (
          <Button onClick={onImportClick} variant="outline" className="h-11">
            <FileUp className="w-4 h-4 mr-2" />
            Importar
          </Button>
        )}
        <Link href="/movimentacoes" className="apple-button-primary h-11">
          Adicionar manually
        </Link>
      </div>
    </div>
  );
}

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mb-6">
        <TrendingUp className="w-10 h-10 text-on-surface-variant/30" />
      </div>
      <h3 className="text-lg font-bold text-on-background mb-2">
        Bem-vindo ao FlyDea!
      </h3>
      <p className="text-sm text-on-surface-variant/70 max-w-xs mb-6">
        Sua jornada financeira começa aqui. Importe seu primeiro extrato ou adicione uma transação.
      </p>
      <div className="flex gap-3">
        <Link href="/movimentacoes" className="apple-button-primary h-11">
          <FileUp className="w-4 h-4 mr-2" />
          Importar extrato
        </Link>
      </div>
    </div>
  );
}

export function EmptyCategories() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4">
        <Wallet className="w-8 h-8 text-on-surface-variant/30" />
      </div>
      <h4 className="font-bold text-on-background mb-1">
        Nenhuma categoria
      </h4>
      <p className="text-xs text-on-surface-variant/60">
        Categorias aparecerão when você importar transactions
      </p>
    </div>
  );
}