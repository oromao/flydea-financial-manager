"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function RetryButton() {
  const router = useRouter();
  return (
    <Button onClick={() => router.refresh()} className="mx-auto">
      Recarregar página
    </Button>
  );
}

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-on-background">Algo deu errado</h1>
            <p className="text-on-surface-variant text-sm">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <RetryButton />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
