# Monitoring & Observability Plan

> FlyDea Financial Manager — Sprint 2 (FLY-008)
> Última atualização: 2026-05-12

---

## 1. Objetivo

Estabelecer observabilidade mínima para detectar problemas de performance, erros e uso do sistema antes que impactem usuários.

---

## 2. Stack Atual

| Ferramenta | Uso | Status |
|------------|-----|--------|
| Vercel Analytics | Web Vitals, page views | ✅ Ativo |
| Logger (`src/lib/logger.ts`) | Logs estruturados JSON | ✅ Ativo |
| Upstash Redis | Rate limiting, cache | ✅ Ativo |
| Monitoring (`src/lib/monitoring.ts`) | Métricas customizadas | 🆕 Criado |
| Monitoring Middleware (`src/lib/monitoring-middleware.ts`) | Response time tracking | 🆕 Criado |

---

## 3. Métricas Coletadas

### 3.1 API Performance
- `api_request_duration_ms` — histograma de latência por rota/método
- `api_request_total` — contador de requisições por rota
- `api_error_total` — contador de erros por rota

### 3.2 Eventos de Negócio
- Login, cadastro, logout
- Criação/edição/exclusão de transações
- Geração de relatórios
- Exportação de dados
- Execução de agentes IA

### 3.3 Infraestrutura
- Uso de memória (se disponível no runtime)
- Tamanho do buffer de métricas
- Taxa de rate limiting acionado

---

## 4. Estratégia de Implementação

### 4.1 Fase 1 — Instrumentação Básica (atual)
- [x] Logger estruturado (`src/lib/logger.ts`, `src/lib/logger-service.ts`)
- [x] Monitoramento de API routes (`src/lib/monitoring.ts`)
- [x] Wrapper de middleware para tracking (`src/lib/monitoring-middleware.ts`)

### 4.2 Fase 2 — Vercel + Dashboard
- [ ] Configurar Vercel Analytics para métricas custom
- [ ] Criar dashboard interno de métricas em `/admin/monitoring`
- [ ] Alertas no Slack/Discord para P0 errors

### 4.3 Fase 3 — Serviço Externo (Opcional)
- [ ] Integrar com Sentry para error tracking
- [ ] Integrar com DataDog ou New Relic para APM
- [ ] Logs centralizados (Axiom, Better Stack)

---

## 5. Alertas Sugeridos

| Condição | Severidade | Ação |
|----------|-----------|------|
| Erro 5xx > 5% em 5 min (qualquer rota) | Critical | Notificar equipe |
| P95 API latency > 3s | High | Investigar bottleneck |
| Rate limit > 80% capacity | Medium | Escalar rate limit |
| Zero login por 1h (horário comercial) | Medium | Investigar autenticação |

---

## 6. Boas Práticas

- **Nunca** incluir PII ou dados financeiros em métricas
- Usar tags para segmentação (path, method, status code)
- Coletar métricas em buffer e enviar em batch
- Não bloquear a requisição principal para registrar métrica
- Em dev, logar métricas no console; em prod, enviar para serviço externo

---

## 7. Como Usar

### Em API routes:

```typescript
import { withMonitoring } from "@/lib/monitoring-middleware";

export const GET = withMonitoring(async (req, context) => {
  // Sua lógica aqui
  return NextResponse.json({ ok: true });
});
```

### Em qualquer lugar:

```typescript
import { trackEvent, reportError } from "@/lib/monitoring";

trackEvent("transaction_created", { category: "alimentacao" });

reportError({
  message: "Falha ao processar OCR",
  severity: "medium",
  context: { fileSize: 1024 },
  timestamp: new Date().toISOString(),
});
```

---

## 8. Próximos Passos

1. Integrar `withMonitoring` nas API routes críticas (transações, auth, relatórios)
2. Configurar Vercel Analytics → custom events
3. Decidir sobre Sentry para error tracking
4. Criar dashboard interno de health check
