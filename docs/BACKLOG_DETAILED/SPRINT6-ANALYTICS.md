# Sprint 6 — Analytics & Observabilidade

> **Origem:** Brainstorming Estratégico 2026-05-14 (e011-e020)
> **Gap identificado:** Zero dados sobre como usuários usam o produto

---

## Problema

Todas as decisões de produto são baseadas em intuição. Não sabemos:
- Quais páginas são mais visitadas?
- Onde os usuários desistem?
- Quais features são mais usadas?
- Qual a retenção semanal/mensal?

---

## Tasks

### M2-T1 — Eventos de Navegação (P0, Média)
- **Implementação:** `useAnalytics` hook que dispara eventos em:
  - Page view (path, referrer, timestamp)
  - Ações principais (criar transação, editar, deletar)
  - Erros (console.error, error boundary)
- **Storage:** Buffer local → flush periódico para `/api/metrics/usage`
- **Privacidade:** Sem PII, apenas dados anônimos de uso
- **Critério de aceite:** Toda navegação e ação principal geram evento

### M2-T2 — Eventos de Engajamento (P0, Média)
- **Métricas coletadas:**
  - DAU (Daily Active Users)
  - MAU (Monthly Active Users)
  - Feature adoption rate (quantos % usaram cada feature)
  - Session duration (tempo médio por sessão)
  - Feature frequency (vezes que cada feature é usada/semana)
- **Critério de aceite:** Dashboard de produto exibe estas métricas

### M2-T3 — Dashboard de Produto (P1, Alta)
- **Implementação:** Página `/admin/analytics` com:
  - Gráfico DAU/MAU (30 dias)
  - Funil de conversão (login → criar conta → primeira transação → recorrência)
  - Feature adoption matrix
  - Session duration trend
- **Critério de aceite:** PO consegue ver tendências de uso em 1 minuto

### M2-T4 — Identificar Drop-off Points (P1, Média)
- **Análise:** Cruzar eventos de navegação para identificar onde usuários desistem
- **Output:** Relatório automático com top 3 páginas de maior abandono
- **Critério de aceite:** Relatório identifica páginas com bounce rate > 50%
