"use client";

import { useState } from "react";
import { Database, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SeedDataPromptProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function SeedDataPrompt({ onComplete, onSkip }: SeedDataPromptProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar dados");
      setDone(true);
      setTimeout(onComplete, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card p-8 max-w-md mx-auto text-center">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        {done ? (
          <CheckCircle2 className="w-8 h-8 text-success" />
        ) : (
          <Database className="w-8 h-8 text-primary" />
        )}
      </div>

      {done ? (
        <>
          <h2 className="text-xl font-bold text-on-background mb-2">Dados gerados!</h2>
          <p className="text-sm text-on-surface-variant/70">
            Seus dados de demonstração estão prontos. Explore o app à vontade!
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-on-background mb-2">Começar com dados de exemplo?</h2>
          <p className="text-sm text-on-surface-variant/70 mb-6">
            Que tal explorar o FlyDea com 3 meses de transações, contas e orçamentos prontos?
            Você pode apagar tudo depois se preferir.
          </p>

          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={onSkip} variant="outline" className="h-11 px-6" disabled={loading}>
              Prefiro começar vazio
            </Button>
            <Button onClick={handleGenerate} className="h-11 px-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Sim, gerar dados!"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
