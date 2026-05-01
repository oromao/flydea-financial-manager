"use client";

import { Wallet, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuickAdd } from "@/components/quick-add";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  balance: number;
  loading: boolean;
  categories: any[];
}

export function DashboardHero({ balance, loading, categories }: DashboardHeroProps) {
  const router = useRouter();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <section className="relative">
      <div className="bg-primary overflow-hidden rounded-[28px] md:rounded-[40px] p-6 md:p-12 shadow-2xl text-white relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-secondary/20 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col gap-8 md:gap-12">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Saldo Disponível</span>
                <div className="w-1 h-1 rounded-full bg-secondary animate-pulse" />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl md:text-7xl font-black tracking-tighter">
                  {loading ? (
                    <span className="inline-block h-10 md:h-16 w-32 md:w-64 bg-white/10 animate-pulse rounded-2xl" />
                  ) : (
                    formatCurrency(balance)
                  )}
                </p>
              </div>
            </div>
            <div className="p-3 md:p-5 rounded-2xl md:rounded-[24px] bg-white/10 backdrop-blur-md border border-white/10 shadow-inner group transition-all hover:bg-white/20">
              <Wallet className="w-5 h-5 md:w-8 md:h-8 text-white transition-transform group-hover:scale-110" />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <QuickAdd 
              categories={categories} 
              onSuccess={() => router.refresh()} 
            />
            <Link 
              href="/movimentacoes" 
              className="h-11 md:h-14 px-5 md:px-8 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-sm md:text-base font-bold text-white flex items-center gap-2 backdrop-blur-sm border border-white/5 shadow-lg active:scale-95"
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
              Extrato
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
