"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface ApprovalConfig {
  threshold: number;
  criticalActions?: string[];
}

const DEFAULT_THRESHOLD = 5000; // R$ 5.000

const CRITICAL_ACTIONS = [
  "DELETE_ACCOUNT",
  "EXPORT_ALL_DATA",
  "CHANGE_USER_ROLE",
  "BULK_DELETE",
];

export function useApprovalThreshold(config?: ApprovalConfig) {
  const { data: session } = useSession();
  const confirm = useConfirm();
  const toast = useToast();
  
  const threshold = config?.threshold ?? DEFAULT_THRESHOLD;
  const criticalActions = config?.criticalActions ?? CRITICAL_ACTIONS;

  const [pendingApproval, setPendingApproval] = useState<string | null>(null);

  const checkAndRequestApproval = useCallback(async (
    action: string,
    amount?: number,
    onExecute: () => Promise<boolean>
  ) => {
    const isAdmin = session?.user?.role === "ADMIN";
    if (isAdmin) {
      return await onExecute();
    }

    const isCriticalAction = criticalActions.includes(action);
    const isHighValue = amount !== undefined && amount >= threshold;

    if (!isCriticalAction && !isHighValue) {
      return await onExecute();
    }

    const actionLabel = isCriticalAction 
      ? `ação crítica: ${action}` 
      : `valor alto: R$ ${amount?.toLocaleString("pt-BR")}`;
    
    const needsApproval = await confirm({
      title: "Esta ação requer aprovação",
      message: `Esta ${actionLabel} excede o limite de R$ ${threshold.toLocaleString("pt-BR")} e será enviada para revisão de um administrador. Continuar?`,
      confirmLabel: "Enviar para aprovação",
      variant: "warning",
    });

    if (!needsApproval) return false;

    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          entity: "TRANSACTION",
          entityId: `pending-${Date.now()}`,
          amount,
          reason: `Exige aprovação: ${actionLabel}`,
        }),
      });

      if (res.ok) {
        toast.success("Solicitação enviada para aprovação");
        return false;
      }
    } catch (e) {
      toast.error("Erro ao enviar para aprovação");
    }

    return false;
  }, [session, criticalActions, threshold, confirm, toast]);

  return {
    checkAndRequestApproval,
    pendingApproval,
    threshold,
  };
}