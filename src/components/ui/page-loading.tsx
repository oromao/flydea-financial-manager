"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PageLoading() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setShowLoader(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowLoader(false), 300);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              Carregando...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}