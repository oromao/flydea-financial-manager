"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Bell, CalendarRange, ChartColumn, ShieldAlert, Target, ArrowRight, Camera, ShieldCheck } from "lucide-react";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

const shortcuts = [
  { title: "Fechamento", desc: "Resumo mensal com exportação CSV e PDF.", href: "/fechamento", icon: CalendarRange, color: "bg-secondary/10 text-secondary" },
  { title: "Alertas", desc: "Central de notificações in-app e ações em lote.", href: "/alertas", icon: Bell, color: "bg-warning/10 text-warning" },
  { title: "Relatórios", desc: "Visão analítica do que está acontecendo.", href: "/relatorios", icon: ChartColumn, color: "bg-success/10 text-success" },
  { title: "Orçamentos", desc: "Metas e acompanhamento por categoria.", href: "/orcamentos", icon: Target, color: "bg-primary/10 text-primary" },
  { title: "Logs", desc: "Auditoria operacional para administradores.", href: "/admin/logs", icon: ShieldAlert, color: "bg-surface-variant text-on-surface-variant" },
  { title: "Aprovações", desc: "Fila de ações críticas aguardando decisão.", href: "/admin/aprovacoes", icon: ShieldCheck, color: "bg-success/10 text-success" },
  { title: "Perfil", desc: "Atualize sua foto e dados do usuário logado.", href: "/perfil", icon: Camera, color: "bg-secondary/10 text-secondary" },
];

export default function MaisPage() {
  return (
    <PageErrorBoundary>
    <div className="space-y-8 max-w-6xl mx-auto pb-20 md:pb-0">
      <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-on-background">Mais opções</h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">Acesso rápido às demais áreas do seu assistente</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block">
              <Card className="premium-card p-4 sm:p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${item.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-on-background">{item.title}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
                    <span
                      className="inline-flex items-center justify-center mt-4 rounded-xl h-10 px-4 bg-secondary text-on-secondary font-semibold"
                    >
                      Abrir
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
    </PageErrorBoundary>
  );
}
