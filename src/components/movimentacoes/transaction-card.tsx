"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
      className="group relative"
    >
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 -mx-2 rounded-xl transition-colors cursor-default",
        "hover:bg-surface-container-low/50 active:bg-surface-container-low",
        showActions && "bg-surface-container-low/50"
      )}>
        {/* Type + Category */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          isIncome ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {isIncome 
            ? <ArrowUpRight className="w-4 h-4 stroke-[2.5px]" /> 
            : <ArrowDownRight className="w-4 h-4 stroke-[2.5px]" />
          }
        </div>

        {/* Description + Meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">
            {t.description}
          </p>
          <p className="text-[11px] text-on-surface-variant/60 mt-0.5 flex items-center gap-1.5">
            <span>
              {(() => {
                const d = new Date(t.date + "T12:00:00");
                return format(d, "dd MMM");
              })()}
            </span>
            {t.category?.name && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[100px]">{t.category.name}</span>
              </>
            )}
            {t.paymentStatus === "PENDING" && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-warning font-medium">Pendente</span>
              </>
            )}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <p className={cn(
            "text-sm font-bold tabular-nums",
            isIncome ? "text-success" : "text-on-surface"
          )}>
            {isIncome ? "+ " : "- "}{formatCurrency(t.amount)}
          </p>
        </div>

        {/* Quick action toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
          className="p-1 rounded-lg hover:bg-surface-container-high transition-colors shrink-0"
          aria-label="Acoes"
        >
          <MoreHorizontal className="w-4 h-4 text-on-surface-variant/40" />
        </button>
      </div>

      {/* Actions inline (expand on tap) */}
      {showActions && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex justify-end gap-1 px-4 pb-2 -mx-2"
        >
          {t.type === "EXPENSE" && t.paymentStatus === "PENDING" && (
            <Button 
              variant="ghost"
              size="xs"
              onClick={() => { onUpdateStatus(t.id, "PAID"); setShowActions(false); }}
              className="text-[11px] text-success"
              aria-label="Marcar como pago"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Pagar
            </Button>
          )}
          <Button 
            variant="ghost"
            size="xs"
            onClick={() => { onEdit(t); setShowActions(false); }}
            className="text-[11px] text-on-surface-variant"
            aria-label="Editar"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            Editar
          </Button>
          <Button 
            variant="ghost"
            size="xs"
            onClick={() => { onDelete(t.id); setShowActions(false); }}
            className="text-[11px] text-destructive"
            aria-label="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Excluir
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
