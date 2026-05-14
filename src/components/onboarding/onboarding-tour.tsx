"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  TrendingUp,
  Wallet,
  Receipt,
  Bot,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "flydea_onboarding_complete";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo ao FlyDea",
    description:
      "Seu cérebro financeiro pessoal. Vamos mostrar como funciona em 5 passos.",
    icon: <Sparkles className="w-8 h-8 text-primary" />,
  },
  {
    title: "Dashboard",
    description:
      "Aqui você vê seu saldo, receitas, despesas e gráficos. Tudo num só lugar.",
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
  },
  {
    title: "Contas",
    description:
      "Cadastre suas contas corrente, poupança, cartões e investimentos.",
    icon: <Wallet className="w-8 h-8 text-primary" />,
  },
  {
    title: "Transações",
    description:
      "Registre receitas e despesas. Importe extratos bancários automaticamente.",
    icon: <Receipt className="w-8 h-8 text-primary" />,
  },
  {
    title: "Agentes IA",
    description:
      "Automatize seu controle financeiro com agentes de inteligência artificial.",
    icon: <Bot className="w-8 h-8 text-primary" />,
  },
  {
    title: "Relatórios",
    description:
      "Acompanhe gráficos, tendências e fechamentos mensais detalhados.",
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -200 : 200,
    opacity: 0,
  }),
};

export function OnboardingTour() {
  const { status } = useSession();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;

    const complete = localStorage.getItem(STORAGE_KEY);
    if (complete === "true") return;

    fetch("/api/transactions?page=1")
      .then((res) => res.json())
      .then((data) => {
        if (data.total === 0) {
          setVisible(true);
        }
      })
      .catch(() => {});
  }, [status]);

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, tourSteps.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  if (!visible) return null;

  const step = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 text-sm text-white/70 hover:text-white transition-colors"
      >
        Pular tour
      </button>

      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center p-8"
          >
            <span className="text-xs font-medium text-muted-foreground mb-4">
              Passo {currentStep + 1} de {tourSteps.length}
            </span>

            <div className="mb-6">{step.icon}</div>

            <h2 className="text-xl font-bold mb-2">{step.title}</h2>

            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mb-6">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between px-8 pb-8">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={isFirst}
            className="gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          {isLast ? (
            <Button onClick={dismiss} className="gap-1">
              Concluir
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-1">
              Avançar
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
