"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PageLoading() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const prev = useRef(pathname);

  useEffect(() => {
    if (prev.current !== pathname) {
      prev.current = pathname;
      setShow(true);
      const t = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(t);
    }
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
              Carregando...
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
