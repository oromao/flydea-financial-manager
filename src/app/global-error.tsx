"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FlyDea GlobalError]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-5xl">🚨</div>
            <h1 className="text-2xl font-bold">Erro inesperado</h1>
            <p className="text-sm text-muted-foreground">
              O sistema encontrou um erro crítico. Recarregue a página para tentar
              recuperar a sessão.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
            >
              Recarregar
            </button>
            {process.env.NODE_ENV === "development" && error.message && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs bg-surface-variant p-3 rounded max-h-60 overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
