"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "E-mail ou senha incorretos.",
        default: "Erro ao autenticar. Tente novamente.",
      };
      setError(errorMessages[res.error] || errorMessages.default);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/");
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-5 py-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[30%] -left-[20%] h-[600px] w-[600px] rounded-full bg-primary/[0.03] blur-[100px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-accent/[0.03] blur-[80px]" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Logo & Brand */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/20"
          >
            <Wallet className="h-7 w-7 text-on-primary" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-2xl font-display font-bold tracking-tight text-on-background"
          >
            FlyDea
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-1.5 text-sm text-outline"
          >
            Seu assistente financeiro pessoal
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="card-elevated p-6 sm:p-7"
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2.5 rounded-lg bg-error/5 px-4 py-3 text-sm font-medium text-error ring-1 ring-error/10">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-error" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-outline ml-0.5">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  required
                  className="h-11 rounded-lg pl-10 bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-wider text-outline ml-0.5">
                Senha
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 rounded-lg pl-10 pr-10 bg-surface-container-low border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-on-surface-variant"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/esqueci-senha"
                className="text-[13px] font-medium text-primary transition-colors hover:text-primary-container"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit Button */}
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg gradient-primary text-on-primary text-sm font-semibold shadow-sm transition-all hover:brightness-110 hover:shadow-md disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 text-center text-[12px] text-outline"
        >
          © 2026 FlyDea. Todos os direitos reservados.
        </motion.p>
      </motion.div>
    </div>
  );
}
