import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5 text-rose-400 text-xs font-medium mt-1.5 ml-2"
        >
          <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
