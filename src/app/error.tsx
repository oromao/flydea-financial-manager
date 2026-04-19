"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service in production
    console.error("[FlyDea Error]", error.message, error.digest);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-on-background">
          Algo deu errado
        </h2>
        <p className="text-sm text-on-surface-variant">
          Ocorreu um erro ao carregar esta página. Tente recarregar ou volte ao
          início.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-outline/30 rounded-lg text-sm font-semibold hover:bg-surface-variant/50"
          >
            Voltar ao início
          </Link>
        </div>
        {process.env.NODE_ENV === "development" && error.message && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-on-surface-variant/50 cursor-pointer">
              Detalhes técnicos (dev)
            </summary>
            <pre className="mt-2 text-xs bg-surface-variant/30 p-3 rounded-lg overflow-auto max-h-40">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
