"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Approval = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  requestedBy?: { name?: string | null; email?: string | null };
};

export default function AprovacoesPage() {
  const [items, setItems] = useState<Approval[]>([]);

  const load = async () => {
    const res = await fetch("/api/approvals");
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const handle = async (approvalId: string, action: "APPROVE" | "REJECT") => {
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId, action }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-background">Aprovações</h1>
        <p className="text-on-surface-variant">Fila de ações críticas pendentes.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="premium-card">
            <CardContent className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.entity}</span>
                  <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-semibold text-secondary">{item.action}</span>
                  <span className="rounded-full bg-surface-variant px-2 py-0.5 text-xs font-semibold text-on-surface-variant">{item.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.reason || item.entityId}</p>
                <p className="text-xs text-muted-foreground">{item.requestedBy?.name || item.requestedBy?.email || "Usuário"}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handle(item.id, "APPROVE")}>Aprovar</Button>
                <Button variant="outline" onClick={() => handle(item.id, "REJECT")}>Rejeitar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
