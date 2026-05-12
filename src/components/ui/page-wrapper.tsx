"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function PageWrapper({ children, className, delay = 0 }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn("space-y-6 md:space-y-10 max-w-7xl mx-auto pb-24 md:pb-8", className)}
    >
      {children}
    </motion.div>
  );
}

export function PageHeaderWrapper({ 
  children, 
  title, 
  subtitle,
  className 
}: { 
  children?: ReactNode; 
  title: string; 
  subtitle?: string;
  className?: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6", className)}
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-background">
          {title}
        </h1>
        {subtitle && (
          <p className="text-on-surface-variant font-medium text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  );
}