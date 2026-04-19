"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, X, ChevronDown, ChevronUp } from "lucide-react";
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

export function CopilotSidebar() {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show intro on first load
  useEffect(() => {
    if (!hasShown && isOpen) {
      setMessages([
        {
          id: "intro",
          type: "assistant",
          content:
            "Olá! 👋 Sou seu assistente financeiro IA. Faça perguntas sobre:\n\n💰 Gastos e receitas\n📊 Tendências financeiras\n💡 Oportunidades de economia\n🎯 Metas e planejamento",
          timestamp: new Date(),
        },
      ]);
      setHasShown(true);
    }
  }, [isOpen, hasShown]);

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
        error instanceof Error ? error.message : "Erro ao processar pergunta";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={cn(
          "fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all",
          isOpen
            ? "bg-secondary text-white shadow-lg"
            : "bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl"
        )}
        title="Assistente IA"
      >
        <Brain className="w-6 h-6" />
      </motion.button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full sm:w-96 bg-surface border-l border-outline/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline/10 bg-gradient-to-r from-secondary/10 to-secondary/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Brain className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-on-background text-sm">
                    Copiloto IA
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Assistente financeiro
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-surface-variant rounded transition-colors"
                >
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4 text-on-surface-variant" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-on-surface-variant" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-surface-variant rounded transition-colors"
                >
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "flex gap-2",
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {message.type === "assistant" && (
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <Brain className="w-3 h-3 text-secondary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-xs px-3 py-2 rounded-lg text-sm leading-relaxed",
                            message.type === "user"
                              ? "bg-secondary text-white rounded-br-none"
                              : "bg-surface-variant/50 text-on-background rounded-bl-none"
                          )}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Loader2 className="w-3 h-3 text-secondary animate-spin" />
                      </div>
                      <div className="bg-surface-variant/50 text-on-background px-3 py-2 rounded-lg rounded-bl-none">
                        <span className="text-sm">Analisando...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-outline/10 bg-gradient-to-t from-surface to-surface/80">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Pergunte sobre suas finanças..."
                      disabled={loading}
                      className="text-sm"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={loading || !input.trim()}
                      className="flex-shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
