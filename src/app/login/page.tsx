"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wallet, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(res.error);
      setLoading(false);
    } else {
      // Reset loading state before redirecting
      setLoading(false);
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 selection:bg-secondary selection:text-on-secondary relative overflow-hidden">
      {/* Dynamic Background Noise/Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] space-y-10 relative z-10"
      >
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-secondary text-white shadow-sm"
          >
            <Wallet className="h-9 w-9" />
          </motion.div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-on-background">
              Flydea
            </h1>
            <p className="text-on-surface-variant font-medium text-xs uppercase tracking-[0.2em] opacity-70">
              Financial Manager System
            </p>
          </div>
        </div>

        <Card className="premium-card p-8 md:p-12 relative overflow-hidden">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl mb-8 text-xs text-center font-bold tracking-tight"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3.5">
              <Label htmlFor="email" className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] ml-1">E-mail</Label>
              <Input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                required 
                className="h-14 rounded-2xl bg-surface-variant/40 border-outline/20 text-on-surface placeholder:text-on-surface-variant/60 focus:bg-surface-variant/60 transition-all text-sm px-6"
              />
            </div>
            
            <div className="space-y-3.5">
              <Label htmlFor="password" className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Senha</Label>
              <Input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-14 rounded-2xl bg-surface-variant/40 border-outline/20 text-on-surface focus:bg-surface-variant/60 transition-all text-sm px-6"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              variant="default"
              className="w-full h-14 text-sm font-bold tracking-tight rounded-2xl group flex items-center justify-center gap-2"
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-outline/10 flex items-center justify-center gap-3 text-on-surface-variant/60 text-[9px] font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Infraestrutura Segura</span>
          </div>
        </Card>
        
        <div className="text-center space-y-4">
          <p className="text-on-surface-variant/50 text-[8px] font-bold uppercase tracking-[0.3em]">
            Copyright © 2026 Flydea • Todos os direitos reservados
          </p>
        </div>
      </motion.div>
    </div>
  );
}
