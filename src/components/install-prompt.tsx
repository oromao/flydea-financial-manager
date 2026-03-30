"use client";

import { useEffect, useState } from "react";
import { X, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasDeclined, setHasDeclined] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasDeclined) return;

    // Detect if is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    
    setIsIOS(isIosDevice);

    if (isStandalone) {
      setShowPrompt(false);
      return;
    }

    // For Android/Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If iOS, show prompt manually after delay
    if (isIosDevice && !isStandalone) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [hasDeclined]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDecline = () => {
    setHasDeclined(true);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 md:bottom-auto md:top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-[200] max-w-sm w-[calc(100%-32px)] md:w-full mx-auto"
      >
        <div className="bg-surface/90 backdrop-blur-3xl border border-outline/20 p-4 rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-[14px] flex items-center justify-center text-on-primary font-black text-2xl shrink-0">
            F
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm tracking-tight text-on-background">Instalar Flydea</h4>
            {isIOS ? (
              <p className="text-[10px] text-on-surface-variant font-medium leading-[1.2] mt-0.5">
                Toque no ícone <Share className="w-3 h-3 inline mb-0.5" /> e depois em <strong>Adicionar à Tela de Início</strong>.
              </p>
            ) : (
              <p className="text-[10px] text-on-surface-variant font-medium leading-[1.2] mt-0.5">
                Adicione o App à tela inicial para acesso nativo e rápido.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0 items-center justify-center pr-1">
            {!isIOS && deferredPrompt && (
              <button onClick={handleInstallClick} className="bg-secondary text-on-secondary px-5 py-1.5 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-all outline-none">
                Instalar
              </button>
            )}
            <button onClick={handleDecline} className="text-on-surface-variant/60 text-[9px] uppercase font-bold tracking-widest hover:text-on-surface transition-all outline-none">
              Agora Não
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
