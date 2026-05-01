import { Metadata } from "next";
import { AgentsDashboard } from "@/components/agents/agents-dashboard";
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

export const metadata: Metadata = {
  title: "Agentes IA | Flydea",
  description: "Gerencie seus agentes de IA para automatizar ações financeiras",
};

export default function AgentsPage() {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <AgentsDashboard />
        </div>
      </div>
    </PageErrorBoundary>
  );
}
