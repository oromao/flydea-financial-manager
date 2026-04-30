# FlyDea Financial Manager — Regras de Domínio

## Visão Geral

Este documento contém as definições financeiras oficiais do projeto — a **fonte da verdade** para qualquer implementação, dúvida ou decisão relacionada a como dados financeiros são calculados, exibidos e interpretados no sistema.

Todas as definições aqui são **obrigatórias** e devem ser respeitadas em qualquer parte do código, UI ou documentação.

---

## Conceitos Financeiros Fundamentais

### Saldo Geral

**Definição:** `Σ(INCOME) - Σ(EXPENSE)` de todas as transações de todos os tempos.

- **Onde usado:** Dashboard card "Saldo Geral"
- **Fórmula:** `sum(transactions.where(type = "INCOME").amount) - sum(transactions.where(type = "EXPENSE").amount)`
- **Considerações:** Não considera paymentStatus; considera todas as transações confirmadas.

### Saldo do Mês

**Definição:** `Σ(INCOME do mês específico) - Σ(EXPENSE do mês específico)`.

- **Onde usado:** Fechamento, Weekly forecast
- **Fórmula:** `sum(transactions.where(type = "INCOME" AND month = X AND year = Y).amount) - sum(transactions.where(type = "EXPENSE" AND month = X AND year = Y).amount)`
- **Considerações:** Agregação mensal, independente do dia específico.

### Receita do Mês

**Definição:** Todas as transações com `type = "INCOME"` no mês, **independentemente do paymentStatus**.

- **Onde usado:** Dashboard, Fechamento
- **Regra:** `type = "INCOME"` AND `month = currentMonth` → inclui PENDING e PAID
- **Nota:** Esta é a receita "esperada" ou "faturada", não necessariamente recebida.

### Despesa do Mês

**Definição:** Todas as transações com `type = "EXPENSE"` no mês, **independentemente do paymentStatus**.

- **Onde usado:** Dashboard, Fechamento
- **Regra:** `type = "EXPENSE"` AND `month = currentMonth` → inclui PENDING e PAID
- **Nota:** Esta é a despesa "esperada" ou "consumida", não necessariamente paga.

### Despesas Pendentes (Desp. Pendentes)

**Definição:** Transações `EXPENSE` com `paymentStatus = "PENDING"`.

- **Onde usado:** Dashboard, Fechamento, Movimentações
- **Regra:** `type = "EXPENSE"` AND `paymentStatus = "PENDING"`
- **Significado:** Despesas que o usuário prometeu pagar mas ainda não foram quitadas.

### Total Pendente

**Definição:** `INCOME PENDING + EXPENSE PENDING`.

- **Onde usado:** Contas a Pagar (label explícito)
- **Regra:** Soma de todas as transações com `paymentStatus = "PENDING"`, independentemente do type.

### Despesas Atrasadas

**Definição:** Despesas PENDING onde `dueDate < hoje`.

- **Onde usado:** Fechamento, Contas a Pagar
- **Regra:** `type = "EXPENSE"` AND `paymentStatus = "PENDING"` AND `dueDate < currentDate`
- **Significado:** Compromissos de pagamento que já passaram da data de vencimento.

### Vence em 7 Dias

**Definição:** Despesas PENDING onde `dueDate` está entre hoje e hoje + 7 dias.

- **Onde usado:** Contas a Pagar
- **Regra:** `type = "EXPENSE"` AND `paymentStatus = "PENDING"` AND `dueDate >= today` AND `dueDate <= today + 7`

### Faturado (Receita Recebida)

**Definição:** Parcelas de Revenue com `status = "RECEIVED"` neste mês.

- **Onde usado:** Weekly cashflow forecast
- **Regra:** `RevenueInstallment.status = "RECEIVED"` AND `dueDate.month = currentMonth`

### A Receber (Receita Pendente)

**Definição:** Parcelas de Revenue com `status = "PENDING"` com vencimento neste mês.

- **Onde usado:** Weekly cashflow forecast
- **Regra:** `RevenueInstallment.status = "PENDING"` AND `dueDate.month = currentMonth`

---

## Semântica de Transação

### Campos Obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| type | string | "INCOME" ou "EXPENSE" |
| description | string | Descrição da transação |
| amount | float | Valor monetário |
| date | DateTime | Data da transação |
| categoryId | string | FK para Category |
| userId | string | FK para User |

### Campos Opcionais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| dueDate | DateTime | Data de vencimento (para contas a pagar) |
| paidAt | DateTime | Data em que foi paga |
| amountPaid | float | Valor pago (para pagamentos parciais) |
| paymentStatus | string | "PENDING" (default) ou "PAID" |
| accountId | string | FK para Conta |
| recurrenceId | string | FK para Recorrência que gerou esta transação |
| recurrenceDate | DateTime | Data específica da recorrência |
| attachmentUrl | string | URL do comprovante |
| blobUrl | string | URL do Vercel Blob |
| observations | string | Observações adicionais |

### Status vs PaymentStatus

- **paymentStatus:** Indica se a transação foi paga ("PAID") ou não ("PENDING").
- **status:** Indica o status de confirmação da transação ("CONFIRMED", etc.).
- **Regra:** `paymentStatus` é a fonte da verdade para cálculos de pendências.

---

## Recorrências

### Modelo

```prisma
model Recurrence {
  id          String    @id @default(uuid())
  description String
  amount      Float
  type        String    @default("EXPENSE")  // INCOME ou EXPENSE
  frequency   String    // MONTHLY, WEEKLY
  startDate   DateTime
  nextDate    DateTime?
  dayOfMonth  Int?
  categoryId  String
  userId      String
  isActive    Boolean   @default(true)
}
```

### Geração de Transações

1. **Cron job** (`/api/cron/recurrence`) executa periodicamente
2. Para cada recurrência ativa:
   - Verifica se já existe transação para `(userId, recurrenceId, recurrenceDate)`
   - Se não existe, cria nova Transaction com `recurrenceId` e `recurrenceDate`
3. **Idempotência:** Usa `format(date, "yyyy-MM-dd")` para evitar time false negatives
4. **nextDate:** Avança 1 mês (MONTHLY) ou 1 semana (WEEKLY) após cada geração

### Frequências Suportadas

| Frequência | Avanço | Suportado |
|-----------|--------|-----------|
| WEEKLY | +7 dias | ✅ Sim |
| MONTHLY | +1 mês | ✅ Sim |
| BIWEEKLY | +14 dias | ⚠️ Não implementado (R-05) |
| YEARLY | +1 ano | ⚠️ Não implementado (R-05) |

---

## Orçamentos

### Modelo

```prisma
model Budget {
  id         String   @id @default(uuid())
  categoryId String
  userId     String
  amount     Float
  period     String   @default("MONTHLY")  // MONTHLY ou YEARLY
  alertAt    Float    @default(80)  // Porcentagem (80 = 80%)
  createdAt  DateTime @default(now())
}
```

### Cálculo de Uso

- **Fórmula:** `(gasto no mês pela categoria / orçamento) * 100`
- **Alerta:** Se uso >= alertAt (default 80%), exibir notificação no dashboard
- **Regra:** Categoria do orçamento deve ser do tipo EXPENSE

### Períodos Suportados

| Período | Comportamento |
|---------|---------------|
| MONTHLY | Reseta todo dia 1º do mês |
| YEARLY | Reseta todo dia 1º de janeiro |

---

## Fechamento Mensal

### Definição

Fechamento mensal é o resumo financeiro de um mês específico,，包含:
- Receita do mês
- Despesa do mês
- Saldo do mês
- Despesas pendentes
- Despesas atrasadas
- Comparativo com mês anterior

### Processo de Cálculo

```typescript
function computeClosingSummary(transactions, start, end) {
  // Alias para computeMonthlySummary com estrutura de fechamento
  return computeMonthlySummary(transactions, start, end);
}
```

### Exportação

| Formato | Endpoint | Biblioteca |
|---------|----------|-----------|
| CSV | `/api/fechamento/export` | UTF-8 com BOM |
| PDF | `/api/fechamento/export/pdf` | jsPDF + autoTable |
| XLSX | `/api/transactions/export` | xlsx |

**Importante:** Todos os exports usam `computeExportSummary()` compartilhado de `src/lib/export-helpers.ts`.

---

## Fluxo de Caixa Semanal

### Definição de Semanas

| Semana | Dias | Propósito |
|--------|------|-----------|
| W1 | 1-7 | Primeira semana do mês |
| W2 | 8-14 | Segunda semana do mês |
| W3 | 15-21 | Terceira semana do mês |
| W4 | 22-fim | Última semana do mês |

**Nota:** W4 varia conforme o número de dias do mês (28, 29, 30 ou 31).

### Projeção Semanal

```typescript
function computeWeeklyForecast(date, installments, expenses) {
  // distribui RevenueInstallments e Expenses pelas 4 semanas
  // retorna: { weeks: [{ income, expenses, balance }], monthlySummary }
}
```

### Componentes Considered

- **RevenueInstallments:** Parcelas de receita (recebidas e pendentes)
- **InvoiceInstallments:** Parcelas de fatura ⚠️ **NÃO** incluídas no forecast atual
- **Transaction (EXPENSE):** Despesas do mês

---

## Spend Decision (Quanto Posso Gastar?)

### Definição

Indicador em tempo real que mostra ao usuário quanto ele pode gastar baseado no fluxo de caixa.

### Tipos de Decisão

| Decisão | Condição |
|---------|----------|
| **PODE_GASTAR** | Saldo do mês + Pendentes > 0 e projecão positiva |
| **ALERTA** | Saldo do mês + Pendentes > 0 mas projeção negativa ou próximo de zero |
| **NAO_PODE_GASTAR** | Saldo do mês + Pendentes <= 0 |

### Implementação

```typescript
function computeSpendDecision(forecast, date) {
  // usa computeWeeklyForecast para determinar projeção
  // retorna: "PODE_GASTAR" | "ALERTA" | "NAO_PODE_GASTAR"
}
```

### Onde Usado

- Dashboard: `SpendDecisionIndicator` component
- API: `/api/decision`

---

## Auditoria e Rastreabilidade

### AuditLog

Todas as operações críticas criam entrada em `AuditLog`:

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  action    String   // CREATE, UPDATE, DELETE, IMPORT
  entity    String   // Transaction, Account, Budget, etc.
  entityId  String
  details   String?  // JSON com detalhes
  userId    String
  createdAt DateTime @default(now())
}
```

### Behavioral Log

Mudanças comportamentais são rastreadas:

```prisma
model UserBehavioralLog {
  id          String   @id @default(uuid())
  userId      String
  changeType  String   // SPENDING_INCREASE, NEW_CATEGORY, FREQUENCY_SHIFT
  description String?
  severity    Float    @default(0)  // 0-100
  createdAt   DateTime @default(now())
}
```

---

## Timezone

- **Servidor:** UTC (armazena datas em midnight UTC)
- **Display:** America/Sao_Paulo (BRT/BRST)
- **Regra:** Datas de input usam `type="date"` (YYYY-MM-DD string) → armazenamento em UTC midnight
- **Risco:** Display pode variar ±1 dia se servidor e usuário em timezones diferentes
- **Mitigação:** Agregação mensal não é afetada; dia específico pode variar

---

## Regras de Nomenclatura

| Conceito | Nome no UI | Nome no Código | Nome no Banco |
|----------|------------|----------------|----------------|
| Dinheiro positivo | Receita | INCOME | INCOME |
| Dinheiro negativo | Despesa | EXPENSE | EXPENSE |
| Não pago | Pendente | PENDING | PENDING |
| Pago | Pago | PAID | PAID |
| Atrasado | Atrasado | OVERDUE | dueDate < today |
| Saldo geral | Saldo Geral | GENERAL_BALANCE | calculado |
| Saldo do mês | Saldo do Mês | MONTHLY_BALANCE | calculado |

---

## Links de Referência

- Engine financeira: `src/lib/financial-engine.ts` (567 linhas)
- Testes da engine: `__tests__/financial-engine.test.ts` (28 testes)
- Export helpers: `src/lib/export-helpers.ts`
- Definições de termos: `src/lib/financial-labels.ts`

---

*Última atualização: 2026-04-30 — Fonte: financial-architecture.md consolidado*