"use client";

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-on-background mb-2">Algo deu errado</h2>
          <p className="text-sm text-on-surface-variant/70 max-w-sm mb-6">
            Não foi possível carregar esta página. Tente novamente ou volte mais tarde.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} variant="outline" className="h-11">
              Tentar novamente
            </Button>
            <Button onClick={() => window.history.back()} className="h-11">
              Voltar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
