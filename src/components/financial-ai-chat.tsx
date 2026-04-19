"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FinancialAIChatProps {
  className?: string;
}

export function FinancialAIChat({ className }: FinancialAIChatProps) {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      type: "assistant",
      content:
        "Olá! 👋 Sou seu assistente financeiro IA. Posso ajudar você com:\n\n💰 Análise de despesas\n📊 Previsão de fluxo de caixa\n💡 Sugestões de economia\n🎯 Planejamento financeiro\n\nO que gostaria de saber sobre suas finanças?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/rag/local-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Falha ao processar pergunta");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao processar";
      toast.error(msg);

      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        type: "assistant",
        content: `❌ ${msg}. Por favor, tente novamente.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    setInput(question);
    // Trigger send after input is set
    setTimeout(() => {
      handleSendMessage({
        preventDefault: () => {},
      } as React.FormEvent);
    }, 0);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-surface rounded-2xl border border-outline/10 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/10 to-blue-500/10 border-b border-outline/10 p-4 sm:p-6 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-secondary/20">
          <Brain className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-bold text-on-background">Assistente Financeiro IA</h3>
          <p className="text-xs text-on-surface-variant">
            Análise inteligente de seus gastos
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "flex gap-3",
                msg.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.type === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-secondary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-xs sm:max-w-md lg:max-w-lg rounded-xl p-3 sm:p-4 text-sm leading-relaxed",
                  msg.type === "user"
                    ? "bg-secondary text-on-secondary rounded-br-none"
                    : "bg-surface-variant/50 text-on-background rounded-bl-none border border-outline/10"
                )}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
                <p className="text-xs opacity-60 mt-2">
                  {msg.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {msg.type === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Check className="w-4 h-4 text-on-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-secondary animate-spin" />
            </div>
            <div className="bg-surface-variant/50 rounded-xl p-4 rounded-bl-none">
              <p className="text-sm text-on-surface-variant">
                Analisando seus dados financeiros...
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 sm:px-6 pb-4 space-y-2">
          <p className="text-xs font-semibold text-on-surface-variant">
            Perguntas rápidas:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "Como posso economizar mais?",
              "Qual meu padrão de gastos?",
              "Devo aumentar minha renda?",
              "Como otimizar meu fluxo de caixa?",
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                disabled={loading}
                className="text-left text-xs p-2 rounded-lg bg-surface-variant/30 hover:bg-surface-variant/50 text-on-surface-variant hover:text-on-background transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-outline/10 p-4 sm:p-6 bg-surface space-y-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta sobre suas finanças..."
          disabled={loading}
          className="h-11 rounded-xl"
        />

        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full h-11 rounded-xl gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
