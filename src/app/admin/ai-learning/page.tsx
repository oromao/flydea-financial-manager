"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ExternalLearningEngine, LearningStats } from "@/lib/ai/learning/external/external-learning-engine"

import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

const engine = new ExternalLearningEngine()

export default function AILearningDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<LearningStats | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  async function loadData() {
    const [statsData, candidatesData] = await Promise.all([
      engine.getStats(),
      engine.getCandidates("PENDING")
    ])
    setStats(statsData)
    setCandidates(candidatesData)
  }

  async function runLearningCycle() {
    setRunning(true)
    try {
      const result = await engine.executeDailyCycle()
      if (result.success) {
        await loadData()
      }
    } finally {
      setRunning(false)
    }
  }

  async function handleApprove(id: string) {
    await engine.approveCandidate(id)
    await loadData()
  }

  async function handleReject(id: string) {
    await engine.rejectCandidate(id)
    await loadData()
  }

  if (status === "loading" || !session) {
    return (
      <PageErrorBoundary>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    </PageErrorBoundary>
    )
  }

  return (
    <PageErrorBoundary>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">IA Learning</h1>
          <p className="text-muted-foreground">Aprendizado externo automático</p>
        </div>
        <button
          onClick={runLearningCycle}
          disabled={running}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {running ? "Executando..." : "Executar Ciclo"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Aprovados</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejeitados</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{stats.avgConfidence.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Confiança Média</div>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Candidatos Pendentes ({candidates.length})</h2>
        </div>
        {candidates.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            Nenhum candidato pendente
          </div>
        ) : (
          <div className="divide-y">
            {candidates.map(candidate => (
              <div key={candidate.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{candidate.title}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                        {candidate.category}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {candidate.url}
                    </div>
                    <div className="mt-1 text-sm">
                      {Array.isArray(candidate.insights) && candidate.insights.length > 0 ? (
                        candidate.insights.map((i: any, idx: number) => (
                          <span key={idx} className="inline-block bg-muted rounded px-2 py-1 mr-1 mb-1 text-xs">
                            {i.insight}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">Sem insights extraídos</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Domínio: {candidate.domain}</span>
                      <span>Confiança: {candidate.confidence}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(candidate.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(candidate.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageErrorBoundary>
  )
}