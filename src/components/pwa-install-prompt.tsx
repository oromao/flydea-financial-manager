"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    checkUsage();

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShow(false);
      localStorage.setItem("flydea_pwa_installed", "true");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function checkUsage() {
    const dismissed = localStorage.getItem("flydea_pwa_dismissed_at");
    if (dismissed) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) return;
    }

    const installed = localStorage.getItem("flydea_pwa_installed");
    if (installed === "true") return;

    const visits = parseInt(localStorage.getItem("flydea_pwa_visits") || "0") + 1;
    localStorage.setItem("flydea_pwa_visits", visits.toString());

    const firstVisit = parseInt(localStorage.getItem("flydea_pwa_first_visit") || Date.now().toString());
    localStorage.setItem("flydea_pwa_first_visit", firstVisit.toString());

    const daysSinceFirstVisit = (Date.now() - firstVisit) / (1000 * 60 * 60 * 24);

    if (visits >= 3 || daysSinceFirstVisit >= 2) {
      setTimeout(() => setShow(Boolean(deferredPrompt)), 2000);
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setIsInstalled(true);
      localStorage.setItem("flydea_pwa_installed", "true");
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("flydea_pwa_dismissed_at", Date.now().toString());
  };

  useEffect(() => {
    if (show && !deferredPrompt) {
      setShow(false);
    }
  }, [show, deferredPrompt]);

  if (isInstalled || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-card border shadow-xl rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-on-background">Instale o FlyDea</h4>
              <p className="text-xs text-on-surface-variant/70">Acesso rápido direto da tela inicial</p>
            </div>
            <Button onClick={handleInstall} size="sm" className="shrink-0 h-9 px-4">
              Instalar
            </Button>
            <button onClick={handleDismiss} className="shrink-0 p-2 text-on-surface-variant/50 hover:text-on-surface-variant" aria-label="Fechar">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
