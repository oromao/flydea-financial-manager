"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Brain, X, ChevronDown, ChevronUp, Lightbulb, MessageSquare, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; category: string }>;
}

export function IntelligentCopilot() {
  const pathname = usePathname();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean>>({});
  const [hasShown, setHasShown] = useState(false);
  const [pageContext, setPageContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detectar contexto da página
  useEffect(() => {
    const getPageContext = () => {
      if (pathname?.includes("agents")) return "Agentes IA";
      if (pathname?.includes("movimentacoes")) return "Transações & Importação";
      if (pathname?.includes("insights")) return "Insights Financeiros";
      if (pathname?.includes("orcamentos")) return "Orçamentos";
      if (pathname?.includes("contas")) return "Contas";
      if (pathname?.includes("relatorios")) return "Relatórios";
      return "Dashboard";
    };
    setPageContext(getPageContext());
  }, [pathname]);

  // Show intro on first open
  useEffect(() => {
    if (!hasShown && isOpen) {
      const contextMessage: Message = {
        id: "intro",
        type: "system",
        content: `Olá! 🧠 Sou seu copiloto financeiro inteligente. Estou aqui na página de ${pageContext} para ajudá-lo com análises e insights.

Posso:
💡 Responder perguntas sobre suas finanças
📊 Analisar padrões de gastos
🎯 Sugerir otimizações
📈 Prever tendências
🤔 Explicar conceitos financeiros

O que você gostaria de saber?`,
        timestamp: new Date(),
      };
      setMessages([contextMessage]);
      setHasShown(true);
    }
  }, [isOpen, hasShown, pageContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get suggested questions based on context
  const getSuggestedQuestions = useCallback(() => {
    const suggestions: Record<string, string[]> = {
      "Agentes IA": [
        "Como criar um agente para alerta de gastos?",
        "Qual é a melhor configuração de schedule?",
        "Como funciona a notificação por email?",
      ],
      "Transações & Importação": [
        "Como importar comprovantes de PIX?",
        "O OCR funciona com quais formatos?",
        "Como são extraídos os dados?",
      ],
      "Insights Financeiros": [
        "Quais são meus padrões de gasto?",
        "Onde posso economizar?",
        "Como está meu fluxo de caixa?",
      ],
      "Orçamentos": [
        "Qual orçamento está acima do limite?",
        "Como otimizar meus orçamentos?",
        "Qual categoria gasta mais?",
      ],
      "Dashboard": [
        "Qual é minha situação financeira atual?",
        "Quais são as tendências este mês?",
        "Devo me preocupar com algo?",
      ],
    };
    return suggestions[pageContext] || suggestions["Dashboard"];
  }, [pageContext]);

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
        body: JSON.stringify({
          query: input,
          context: pageContext,
          conversationHistory: messages.slice(-5), // Context das últimas 5 mensagens
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Falha ao processar pergunta");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        type: "assistant",
        content: data.answer || data.response || "Sem resposta.",
        timestamp: new Date(),
        sources: data.context?.insights?.slice(0, 2).map((s: { title: string; type?: string; category?: string }) => ({
          title: s.title,
          category: s.type || s.category,
        })),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erro ao processar pergunta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    if (feedbackSent[messageId]) return;
    
    try {
      setFeedbackSent(prev => ({ ...prev, [messageId]: true }));
      toast.success("Obrigado pelo feedback!");
      
      // Feedback tracking integration
      if (messageId.includes("-ai")) {
        // Logic for backend persistence could go here
      }
    } catch (e) {
      toast.error("Erro ao enviar feedback");
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const clearHistory = () => {
    setMessages([]);
    setHasShown(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed bottom-6 right-6 z-40 h-14 rounded-full flex items-center gap-3 px-4 transition-all shadow-2xl group",
          isOpen
            ? "bg-white text-primary border border-primary/20"
            : "bg-gradient-to-br from-primary to-primary/80 text-white"
        )}
      >
        <div className="relative">
          <Brain className="w-6 h-6" />
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive border-2 border-white rounded-full animate-bounce" />
          )}
        </div>
        <span className="font-bold text-sm tracking-tight pr-2">
          {isOpen ? "Fechar" : "Copiloto IA"}
        </span>
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full sm:w-96 bg-gradient-to-br from-surface via-surface to-surface/95 border-l border-primary/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-primary/20">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-on-background text-sm">
                    Copiloto IA
                  </h3>
                  <p className="text-xs text-primary/60">
                    {pageContext} • Contexto ativo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                  title={isMinimized ? "Expandir" : "Minimizar"}
                >
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Fechar copiloto"
                  className="p-1 hover:bg-destructive/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message, idx) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "flex gap-3",
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {message.type !== "user" && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {message.type === "system" ? (
                              <Lightbulb className="w-4 h-4 text-primary" />
                            ) : (
                              <Brain className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-xs px-3 py-2 rounded-lg text-sm leading-relaxed",
                            message.type === "user"
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-surface-variant/60 text-on-background rounded-bl-none border border-primary/20"
                          )}
                        >
                          {message.content}

                          {message.type === "assistant" && !feedbackSent[message.id] && (
                            <div className="flex gap-2 mt-2 pt-2 border-t border-on-surface-variant/10 justify-end">
                              <button 
                                onClick={() => handleFeedback(message.id, true)}
                                className="p-1 hover:text-success transition-colors text-on-surface-variant/50"
                                title="Útil"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleFeedback(message.id, false)}
                                className="p-1 hover:text-destructive transition-colors text-on-surface-variant/50"
                                title="Não útil"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-on-surface-variant/20 text-xs text-on-surface-variant">
                              <p className="font-semibold mb-1">Fontes:</p>
                              {message.sources.map((source, i) => (
                                <p key={i}>• {source.title}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      </div>
                      <div className="bg-surface-variant/60 text-on-background px-3 py-2 rounded-lg rounded-bl-none border border-primary/20">
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length <= 1 && !loading && (
                    <div className="px-4 py-3 border-t border-primary/10">
                    <p className="text-xs font-semibold text-on-surface-variant mb-2">
                      💡 Sugestões:
                    </p>
                    <div className="space-y-2">
                      {getSuggestedQuestions().map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="w-full text-left text-xs p-2 rounded border border-primary/20 hover:bg-primary/10 transition-colors text-on-background"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-surface to-surface/80 space-y-2">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Pergunte sobre suas finanças..."
                      disabled={loading}
                      className="text-sm bg-surface-variant/40 border-primary/20"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      aria-label="Enviar mensagem"
                      disabled={loading || !input.trim()}
                      className="flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                  {messages.length > 1 && (
                    <button
                      onClick={clearHistory}
                      className="w-full text-xs text-on-surface-variant hover:text-on-background flex items-center justify-center gap-1 py-1 hover:bg-surface-variant/30 rounded transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Limpar conversa
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
