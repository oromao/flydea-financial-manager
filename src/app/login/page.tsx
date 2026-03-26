"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "E-mail ou senha incorretos." : res.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 selection:bg-primary selection:text-on-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(208,228,255,0.05)_0%,transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] space-y-8 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary text-on-primary shadow-2xl shadow-primary/20"
          >
            <Wallet className="h-10 w-10" aria-hidden="true" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-on-background">
              Controle FLY DEA
            </h1>
            <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em]">
              Gestão Corporativa • M3 Edition
            </p>
          </div>
        </div>

        <div className="glass-card p-8 md:p-12 border-white/10 overflow-hidden relative group rounded-[40px]">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/40 transition-all duration-700" />

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                role="alert"
                aria-live="assertive"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-2xl mb-8 text-sm font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                E-mail Corporativo
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@flydea.com"
                required
                disabled={loading}
                className="h-16 rounded-2xl bg-white/[0.05] border-white/10 text-on-surface placeholder:text-on-surface-variant/30 focus:bg-white/[0.08] transition-all text-base px-6"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                Senha de Acesso
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-16 rounded-2xl bg-white/[0.05] border-white/10 text-on-surface focus:bg-white/[0.08] transition-all text-base px-6 pr-14"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="m3-button-premium w-full h-16 text-lg border-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Autenticando...
                </span>
              ) : (
                <>
                  ACESSAR SISTEMA
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-3 text-on-surface-variant/40 text-[10px] font-black tracking-widest uppercase">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            <span>Infraestrutura FLY DEA Segura</span>
          </div>
        </div>

        <p className="text-center text-on-surface-variant/30 text-[9px] font-bold uppercase tracking-widest">
          Copyright © 2026 FLY DEA • Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
}
