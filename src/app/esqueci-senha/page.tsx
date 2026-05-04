"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar");
        return;
      }

      setSent(true);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-on-background">Email enviado!</h1>
          <p className="text-on-surface-variant">
            Se existe uma conta com este email, você receberá um link de recuperação em breve.
          </p>
          <Link href="/login">
            <Button className="w-full">Voltar para Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <Card className="max-w-md w-full p-8 space-y-6">
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-background transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-black text-on-background">Esqueci a Senha</h1>
          <p className="text-on-surface-variant mt-2">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="h-12 pl-12 rounded-2xl bg-surface-variant/20 border-outline/10"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 text-base font-bold rounded-2xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Link de Recuperação"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}