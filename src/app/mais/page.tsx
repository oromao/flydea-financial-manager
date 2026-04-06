"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Bell, CalendarRange, ChartColumn, ShieldAlert, Target, ArrowRight, Camera, ShieldCheck } from "lucide-react";

const shortcuts = [
  { title: "Fechamento", desc: "Resumo mensal com exportação CSV e PDF.", href: "/fechamento", icon: CalendarRange },
  { title: "Alertas", desc: "Central de notificações in-app e ações em lote.", href: "/alertas", icon: Bell },
  { title: "Relatórios", desc: "Visão analítica do que está acontecendo.", href: "/relatorios", icon: ChartColumn },
  { title: "Orçamentos", desc: "Metas e acompanhamento por categoria.", href: "/orcamentos", icon: Target },
  { title: "Logs", desc: "Auditoria operacional para administradores.", href: "/admin/logs", icon: ShieldAlert },
  { title: "Aprovações", desc: "Fila de ações críticas aguardando decisão.", href: "/admin/aprovacoes", icon: ShieldCheck },
  { title: "Perfil", desc: "Atualize sua foto e dados do usuário logado.", href: "/perfil", icon: Camera },
];

export default function MaisPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 md:pb-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 px-4 md:px-0">
        <p className="text-xs sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-on-surface-variant/80">Navegação secundária</p>
        <h1 className="text-3xl font-bold tracking-tight text-on-background">Mais</h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">Concentra as áreas menos usadas para manter a navegação principal limpa no mobile.</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-4 md:px-0">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="premium-card p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-secondary/10 text-secondary shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-on-background">{item.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center justify-center mt-4 rounded-xl h-10 px-4 bg-secondary text-on-secondary font-semibold transition-colors hover:bg-secondary/90"
                  >
                    Abrir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
