"use client";

import { useEffect, useState, useMemo } from "react";
import { trackEvent } from "@/lib/use-metrics";
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, Flame, Target, Clock, CalendarCheck, BrainCircuit, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DailyInsightProps {
  metrics: {
    balance: number;
    income: number;
    expenses: number;
    projectedExpenses: number;
    projectedIncome: number;
    pendingExpenses: number;
    savingsRate: number;
    monthIncome: number;
    monthExpenses: number;
    copilot?: {
      insights: Array<{
        id: string;
        type: "URGENTE" | "IMPACTO" | "INFORMAÇÃO";
        title: string;
        message: string;
        actionLabel?: string;
        actionUrl?: string;
      }>;
      aiStats?: {
        accuracy: number;
        level: string;
      }
    };
  };
}

interface Insight {
  id?: string;
  type: "success" | "warning" | "info" | "action" | "error";
  title: string;
  description: string;
  icon: "trend" | "warning" | "success" | "action" | "info";
  action?: string;
  actionHref?: string;
}

interface HabitCheckin {
  lastCheckin: string;
  streak: number;
  longestStreak: number;
}

export function DailyInsight({ metrics }: DailyInsightProps) {
  const router = useRouter();
  const [habitData, setHabitData] = useState<HabitCheckin>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("flydea_habit_checkin");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {
      lastCheckin: "",
      streak: 0,
      longestStreak: 0
    };
  });

  const checkinToday = useMemo(() => {
    const today = new Date().toDateString();
    return habitData.lastCheckin === today;
  }, [habitData]);

  const handleCheckin = () => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const newStreak = habitData.lastCheckin === yesterday.toDateString()
      ? habitData.streak + 1
      : 1;

    const newData = {
      lastCheckin: today,
      streak: newStreak,
      longestStreak: Math.max(newStreak, habitData.longestStreak)
    };
    
    setHabitData(newData);
    localStorage.setItem("flydea_habit_checkin", JSON.stringify(newData));
    trackEvent("habit_checkin", { streak: newStreak });
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getDayMessage = () => {
    const day = new Date().getDay();
    const date = new Date().getDate();
    
    if (day === 1) return { title: "Nova semana", description: "Dia de planejar!" };
    if (day === 5) return { title: "Sextou!", description: "Fim de semana chegando" };
    if (date <= 5) return { title: "Início de mês", description: "Hora de revisar gastos" };
    if (date >= 25) return { title: "Fim de mês", description: "Falta pouco para fechar" };
    return null;
  };

  const insights = useMemo<Insight[]>(() => {
    const result: Insight[] = [];

    if (!metrics) return result;

    // 1. Load Copilot Intelligent Insights (Highest Priority from DB)
    if (metrics.copilot?.insights) {
      metrics.copilot.insights.forEach(ci => {
        result.push({
          id: ci.id,
          type: ci.type === "URGENTE" ? "warning" : ci.type === "IMPACTO" ? "action" : "success",
          title: ci.title,
          description: ci.message,
          icon: ci.type === "URGENTE" ? "warning" : ci.type === "IMPACTO" ? "trend" : "info",
          action: ci.actionLabel,
          actionHref: ci.actionUrl
        });
      });
    }

    // 2. Legacy/Fallback Heuristics (if result is not full)
    if (result.length < 3) {
      const monthProgress = metrics.monthIncome > 0 
        ? ((metrics.monthExpenses / metrics.monthIncome) * 100).toFixed(0)
        : "0";

      const projectedOverIncome = metrics.projectedExpenses > metrics.projectedIncome + metrics.balance;

      if (metrics.pendingExpenses > 0 && metrics.pendingExpenses > metrics.balance * 0.5) {
        result.push({
          type: "warning",
          title: `${metrics.pendingExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} em contas próximas`,
          description: "Você tem contas para pagar. Revise em Pendências.",
          icon: "warning",
          action: "Ver pendências",
          actionHref: "/contas-a-pagar"
        });
      }

      if (parseFloat(monthProgress) > 90) {
        result.push({
          type: "warning",
          title: `${monthProgress}% do orçamento usado`,
          description: "Você está perto do limite do mês.",
          icon: "warning"
        });
      }

      if (projectedOverIncome) {
        result.push({
          type: "warning",
          title: "Fluxo negativo",
          description: "Seus projetos indicam que o caixa pode ficar negativo.",
          icon: "warning",
          action: "Ver fluxo de caixa",
          actionHref: "/fluxo-caixa"
        });
      }

      if (metrics.balance > metrics.projectedExpenses * 0.3 && metrics.balance > 0) {
        result.push({
          type: "success",
          title: "Reserva sólida",
          description: `Você tem ${metrics.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} disponível.`,
          icon: "success"
        });
      }

      if (metrics.income > metrics.expenses) {
        const diff = metrics.income - metrics.expenses;
        result.push({
          type: "success",
          title: "Saldo positivo",
          description: `Este mês você já tem R$ ${diff.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de folga.`,
          icon: "success"
        });
      }

      if (metrics.savingsRate > 20) {
        result.push({
          type: "success",
          title: "Taxa de economia excepcional",
          description: `Você está guardando ${metrics.savingsRate}% das receitas!`,
          icon: "success"
        });
      }

      const dayMsg = getDayMessage();
      if (dayMsg) {
        result.unshift({
          type: "info",
          title: dayMsg.title,
          description: dayMsg.description,
          icon: "action"
        });
      }

      if (result.length === 0) {
        result.push({
          type: "info",
          title: "Tudo em ordem",
          description: "Nenhum alerta hoje. Continue assim!",
          icon: "success"
        });
      }
    }

    return result.slice(0, 3);
  }, [metrics]);

  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  // Track view when insights load
  useEffect(() => {
    insights.forEach(insight => {
      if (insight.id && !dismissedInsights.has(insight.id)) {
        fetch(`/api/insights/${insight.id}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'VIEWED' })
        }).catch(() => {});
      }
    });
  }, [insights, dismissedInsights]);

  const handleInsightClick = async (insight: Insight, e: React.MouseEvent) => {
    if (insight.id) {
      await fetch(`/api/insights/${insight.id}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CLICKED' })
      }).catch(() => {});
      
      // Also register as ACTED if it has a specific action URL
      if (insight.actionHref) {
         fetch(`/api/insights/${insight.id}/interact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'ACTED' })
        }).catch(() => {});
      }
    }
  };

  const handleDismiss = async (insightId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDismissedInsights(prev => new Set(prev).add(insightId));
    
    await fetch(`/api/insights/${insightId}/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'DISMISSED' })
    }).catch(() => {});
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case "trend": return <TrendingUp className="w-5 h-5" />;
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "success": return <CheckCircle2 className="w-5 h-5" />;
      case "action": return <ArrowRight className="w-5 h-5" />;
      case "info": return <Lightbulb className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success": return "bg-success/10 border-success/30 text-success";
      case "warning": return "bg-warning/10 border-warning/30 text-warning";
      case "action": return "bg-primary/10 border-primary/30 text-primary";
      case "error": return "bg-destructive/10 border-destructive/30 text-destructive";
      default: return "bg-surface-variant/50 border-outline/20 text-on-surface";
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case "success": return "text-success bg-success/20";
      case "warning": return "text-warning bg-warning/20";
      case "action": return "text-primary bg-primary/20";
      case "error": return "text-destructive bg-destructive/20";
      default: return "text-secondary bg-surface";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-on-background">
            {getTimeBasedGreeting()}!
          </p>
          <p className="text-xs text-on-surface-variant">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {metrics.copilot?.aiStats && (
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-semibold border border-primary/10">
               <BrainCircuit className="w-4 h-4" />
               Nível {metrics.copilot.aiStats.level} • {metrics.copilot.aiStats.accuracy.toFixed(0)}% de Precisão
             </div>
          )}
          
          {!checkinToday && (
            <button
              onClick={handleCheckin}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Check-in
            </button>
          )}
          {checkinToday && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-semibold">
              <Flame className="w-4 h-4" />
              {habitData.streak} dias
            </div>
          )}
        </div>
      </div>
      
      {habitData.streak > 0 && (
        <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/30 rounded-lg">
          <Flame className="w-6 h-6 text-warning" />
          <div>
            <p className="text-sm font-bold text-warning">
              Sequência: {habitData.streak} dias
            </p>
            <p className="text-xs text-warning/70">
              Recorde: {habitData.longestStreak} dias
            </p>
          </div>
          <Target className="w-5 h-5 text-warning ml-auto" />
        </div>
      )}

      <div className="grid gap-3">
        {insights.map((insight, index) => {
          if (insight.id && dismissedInsights.has(insight.id)) return null;

          return (
            <div key={index} className="relative group">
              <Link 
                href={insight.actionHref || "#"}
                onClick={(e) => handleInsightClick(insight, e)}
                className={cn(
                  "block p-4 rounded-xl border transition-all hover:scale-[1.01] cursor-pointer",
                  getColors(insight.type)
                )}
              >
                <div className="flex items-start gap-3 pr-6">
                  <div className={cn("p-2 rounded-lg shrink-0", getIconColors(insight.type))}>
                    {getIcon(insight.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {insight.title}
                    </p>
                    <p className="text-xs opacity-80 mt-1 line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                  {insight.action && insight.actionHref && (
                    <ArrowRight className="w-4 h-4 opacity-50 shrink-0 self-center" />
                  )}
                </div>
              </Link>
              
              {insight.id && (
                <button
                  onClick={(e) => handleDismiss(insight.id!, e)}
                  className="absolute top-3 right-3 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted/5 transition-all text-current"
                  title="Descartar insight"
                >
                  <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}