import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-black text-outline/20 mb-4">404</p>
        <h1 className="text-2xl font-black text-on-background mb-2">
          Pagina nao encontrada
        </h1>
        <p className="text-sm text-on-surface-variant mb-8">
          A pagina que voce tentou acessar nao existe ou foi removida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
