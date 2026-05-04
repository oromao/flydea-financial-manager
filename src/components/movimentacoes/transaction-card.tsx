"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, CheckCircle2, Edit2, Trash2, Cloud, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TransactionCardProps {
  transaction: any;
  onEdit: (t: any) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  formatCurrency: (val: number) => string;
}

export function TransactionCard({ 
  transaction, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  formatCurrency 
}: TransactionCardProps) {
  const t = transaction;
  const isIncome = t.type === "INCOME";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-none shadow-sm bg-surface-container-lowest active:scale-[0.98] transition-all p-4 md:p-5">
        {/* Type Indicator */}
        <div className={cn(
          "absolute top-0 left-0 w-1.5 h-full",
          isIncome ? "bg-success" : "bg-destructive/40"
        )} />

        <div className="flex items-center gap-4">
          {/* Icon Circle */}
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
            isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {isIncome ? <ArrowUp className="w-6 h-6" strokeWidth={3} /> : <ArrowDown className="w-6 h-6" strokeWidth={3} />}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-black text-on-background truncate uppercase tracking-tight">
                {t.description}
              </h3>
              {t.blobUrl && (
                <Cloud className="w-3 h-3 text-success" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                {format(new Date(t.date), "dd MMM, yy")}
              </span>
              <div className="w-1 h-1 rounded-full bg-outline/20" />
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-black uppercase tracking-widest">
                {t.category?.name || "Outros"}
              </span>
            </div>
          </div>

          {/* Amount & Status */}
          <div className="text-right shrink-0">
            <p className={cn(
              "text-base font-black tracking-tighter",
              isIncome ? "text-success" : "text-on-background"
            )}>
              {!isIncome && "- "}{formatCurrency(t.amount)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              {t.frequency === "MONTHLY" && <RotateCcw className="w-2.5 h-2.5 text-secondary/60" />}
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                t.paymentStatus === "PENDING" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
              )}>
                {t.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Quick Actions - Always visible but subtle */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-outline/5">
          {t.type === "EXPENSE" && t.paymentStatus === "PENDING" && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onUpdateStatus(t.id, "PAID")} 
              className="h-9 w-9 rounded-xl bg-success/10 text-success hover:bg-success/20"
              aria-label="Marcar como pago"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(t)} 
            className="h-9 w-9 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20"
            aria-label="Editar transação"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(t.id)} 
              className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20"
            aria-label="Excluir transação"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
