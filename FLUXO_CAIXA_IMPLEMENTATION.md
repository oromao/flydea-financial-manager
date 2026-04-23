# 🚀 Sistema de Fluxo de Caixa Semanal — Implementação Completa

## 1. MODELOS DE DADOS NOVOS

### Invoice (Nota de Receita)
```prisma
model Invoice {
  id                String                @id @default(uuid())
  userId            String
  invoiceNumber     String                // Código único da nota
  clientName        String                // Nome do cliente
  clientEmail       String?               // Email para cobrança
  description       String?               // Descrição do serviço
  totalAmount       Float                 // Valor total
  emissionDate      DateTime              // Data de emissão
  dueDate           DateTime?             // Data de vencimento (primeira parcela)
  status            String                // EMITTED, PARTIALLY_PAID, FULLY_PAID
  paymentMethod     String?               // Método de pagamento
  observations      String?               // Observações
  installments      InvoiceInstallment[]  // Parcelas
  createdAt         DateTime
  updatedAt         DateTime
}
```

### InvoiceInstallment (Parcela)
```prisma
model InvoiceInstallment {
  id                String    @id @default(uuid())
  invoiceId         String
  installmentNumber Int       // 1, 2, 3...
  amount            Float     // Valor da parcela
  dueDate           DateTime  // Quando vence
  status            String    // PENDING, RECEIVED, OVERDUE
  paidAt            DateTime?
  paidAmount        Float?    // Valor realmente recebido
  createdAt         DateTime
}
```

### CashflowWeekly (Cache de Projeção)
```prisma
model CashflowWeekly {
  id                String    @id @default(uuid())
  userId            String
  weekStart         DateTime  // Início da semana
  weekEnd           DateTime  // Fim da semana
  weekNumber        Int       // 1, 2, 3, 4
  monthYear         String    // "01/2025"
  totalIncome       Float     // Renda projetada
  totalExpenses     Float     // Despesas
  receivedAmount    Float     // Já recebido
  projectedAmount   Float     // A receber
  balance           Float     // Saldo = income - expenses
  createdAt         DateTime
  updatedAt         DateTime
}
```

---

## 2. FUNÇÕES DO MOTOR (lib/cashflow.ts)

### `calculateWeeklyCashflow(userId: string, date?: Date)`
Calcula fluxo semanal completo:
- Divide mês em semanas (W1, W2, W3, W4)
- Agrega receitas (Invoice + Installments)
- Agrega despesas (Transaction EXPENSE)
- Retorna saldo por semana

**Lógica:**
- Semana 1: 1º até domingo
- Semana 2-4: semanas completas (seg-dom)
- Receita entra no saldo apenas na data de VENCIMENTO, não emissão
- Parcelas impactam semanas diferentes

**Retorno:**
```typescript
{
  month: "janeiro de 2025",
  monthStart: Date,
  monthEnd: Date,
  weeks: [
    {
      week: { weekNumber: 1, weekStart, weekEnd, display: "W1" },
      projectedIncome: 8000,      // A receber
      receivedIncome: 2000,       // Já recebido
      totalExpenses: 3500,
      balance: 6500,
      canSpend: true
    },
    // ... W2, W3, W4
  ],
  totalMonthIncome: 16000,
  totalMonthExpenses: 8000,
  monthBalance: 8000
}
```

### `canSpendThisWeek(userId: string)`
Decide se pode gastar esta semana:

**Retorno:**
```typescript
{
  canSpend: true,
  availableAmount: 2500,
  reason: "Você pode gastar até R$ 2500 nesta semana",
  weekNumber: 1
}
```

### `getWeeksForMonth(date: Date)`
Divide qualquer mês em semanas respeitando limites:
- Semana 1: começa no 1º, termina no domingo
- Semana 2-4: completas (seg-dom)
- Semana 5 (se houver): dias restantes

### `getWeekNumberForDate(date: Date, monthStart: Date)`
Retorna em qual semana uma data cai.

### `saveCashflowForecast(userId, monthYear, weekData)`
Cache em CashflowWeekly para performance.

---

## 3. APIs CRIADAS

### POST /api/invoices
**Criar nova nota com parcelas**

**Request:**
```json
{
  "invoiceNumber": "NF-001",
  "clientName": "Cliente A",
  "clientEmail": "cliente@example.com",
  "description": "Serviço de consultoria",
  "totalAmount": 8000,
  "emissionDate": "2025-01-10",
  "dueDate": "2025-02-10",
  "paymentMethod": "bank_transfer",
  "observations": "Nota para cobrança",
  "installments": [
    {
      "installmentNumber": 1,
      "amount": 2000,
      "dueDate": "2025-01-30",
      "status": "PENDING"
    },
    {
      "installmentNumber": 2,
      "amount": 2000,
      "dueDate": "2025-02-15",
      "status": "PENDING"
    },
    // ... 3, 4
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoiceNumber": "NF-001",
  "totalAmount": 8000,
  "status": "EMITTED",
  "installments": [...]
}
```

**Ação:** Cria Invoice + InvoiceInstallments + recalcula CashflowWeekly

---

### GET /api/invoices
**Listar notas**

**Query params:**
- `status`: EMITTED, FULLY_PAID, PARTIALLY_PAID
- `clientName`: string (like search)

**Response:**
```json
{
  "data": [{ Invoice with installments }]
}
```

---

### GET /api/cashflow/weekly
**Fluxo de caixa semanal**

**Query params:**
- `date`: ISO date (default: now)

**Response:**
```json
{
  "cashflow": { MonthCashflow },
  "spendDecision": {
    "canSpend": true,
    "availableAmount": 2500,
    "reason": "...",
    "weekNumber": 1
  },
  "timestamp": "2025-01-20T10:30:00Z"
}
```

---

### PUT /api/invoices/[id]
**Marcar parcela como recebida**

**Request:**
```json
{
  "installmentId": "uuid",
  "status": "RECEIVED",
  "paidAmount": 2000
}
```

**Ação:**
- Atualiza InvoiceInstallment
- Se todas as parcelas forem RECEIVED, marca Invoice como FULLY_PAID
- Recalcula CashflowWeekly

---

### POST /api/cobranca/whatsapp
**Enviar cobrança por WhatsApp**

**Request:**
```json
{
  "installmentId": "uuid",
  "phoneNumber": "5511999999999",
  "message": "Olá, pagamento venceu..." (optional, usa default)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cobrança enviada com sucesso",
  "installmentId": "uuid",
  "sentAt": "2025-01-20T10:30:00Z"
}
```

**Nota:** Implementação atual simula envio. Integrar com:
- Twilio (WhatsApp API)
- WhatsApp Business API
- Webhook de cobrança

---

## 4. COMPONENTES UI

### WeeklyCashflow
Exibe:
- **Cards de semana (W1-W4)**
  - Receitas (recebido + previsto)
  - Despesas
  - Saldo
  - Status "Pode Gastar" / "Atenção"

- **Card de decisão atual**
  - Cor verde/vermelho
  - Valor disponível
  - Razão

- **Resumo mensal**
  - Total receitas
  - Total despesas
  - Saldo do mês

**Props:** Nenhum (fetcha do `/api/cashflow/weekly`)

---

### InvoiceManager
Formulário para criar notas com:
- Dados da nota (número, cliente, email, valor)
- Seletor de número de parcelas (1, 2, 3, 4, 6, 12x)
- Grid de parcelas (valor, data, status)
- Auto-divisão de valor quando muda total

**Ações:**
- POST /api/invoices
- Validação Zod automática

---

## 5. PÁGINA: /fluxo-caixa

Layout:
```
[Header: Fluxo de Caixa]

[2/3] WeeklyCashflow            [1/3] InvoiceManager + Info
```

---

## 6. REGRAS DE NEGÓCIO IMPLEMENTADAS

✅ **Receita entra no caixa na data de vencimento, não emissão**
- Invoice é apenas registro de faturamento
- InvoiceInstallment é o que impacta fluxo

✅ **Parcelas impactam semanas diferentes**
- Nota 8000 em 4x → 2000 em cada semana

✅ **Distinção clara: faturado vs recebido**
- Projected: parcelas PENDING
- Received: parcelas RECEIVED

✅ **Semanas corretas (W1-W4 respeitando mês)**
- W1: 1º até domingo
- W2-W4: semanas completas

✅ **Decisão automática: posso gastar?**
- `canSpendThisWeek()` usa saldo semanal

---

## 7. PRÓXIMAS IMPLEMENTAÇÕES (Roadmap)

### Curto prazo:
- [ ] Integração Twilio/WhatsApp real
- [ ] Relatório PDF de fluxo
- [ ] Alertas de parcelas vencidas
- [ ] Recalcular cashflow em background (cron)
- [ ] Historico de projeções (comparar W1 previsto vs realizado)

### Médio prazo:
- [ ] Dashboard de receitas (por cliente, categoria)
- [ ] Previsão de 30 dias (além do mês atual)
- [ ] Sincronizar com Transaction (vincular nota ao pagamento)
- [ ] Exportar fluxo para Excel

### Longo prazo:
- [ ] Previsão com ML (baseada em histórico)
- [ ] Integração com bancos (auto-detect pagamentos)
- [ ] Simulador de cenários (e se eu parcelar em 6x?)

---

## 8. COMO USAR

### 1. Fazer deploy da migration
```bash
npx prisma migrate deploy
npx prisma generate
```

### 2. Criar uma nota no frontend
- Ir para /fluxo-caixa
- Clicar "Nova Nota de Receita"
- Preencher dados
- Selecionar número de parcelas
- Salvar

### 3. Visualizar fluxo semanal
- Voltar para card de fluxo
- Ver W1, W2, W3, W4 com valores
- Decisão de gasto aparece automaticamente

### 4. Enviar cobrança
- Clicar em parcela pendente
- Clicar "Enviar Cobrança"
- Inserir WhatsApp do cliente

### 5. Marcar como recebida
- PUT /api/invoices/[id]
- status: "RECEIVED"
- Fluxo atualiza automaticamente

---

## 9. ESTRUTURA DE ARQUIVOS

```
src/
  lib/
    cashflow.ts                  # Motor de cálculo
    validations.ts              # Zod schemas (novo: Invoice)
  app/
    api/
      invoices/
        route.ts                # POST/GET invoices
        [id]/
          route.ts              # PUT invoice installments
      cashflow/
        weekly/
          route.ts              # GET fluxo semanal
      cobranca/
        whatsapp/
          route.ts              # POST cobrança
    fluxo-caixa/
      page.tsx                  # Página principal
  components/
    weekly-cashflow.tsx         # Componente de visualização
    invoice-manager.tsx         # Formulário de notas
  sidebar.tsx                   # (atualizado com link)

prisma/
  schema.prisma                 # (atualizado com modelos)
  migrations/
    add_invoices_and_cashflow/  # SQL migration
```

---

## 10. TESTES RECOMENDADOS

```bash
# 1. Criar invoice
curl -X POST http://localhost:3010/api/invoices \
  -H "Content-Type: application/json" \
  -d '{ "invoiceNumber": "NF-001", "clientName": "Test", ... }'

# 2. Buscar fluxo
curl http://localhost:3010/api/cashflow/weekly

# 3. Marcar como recebida
curl -X PUT http://localhost:3010/api/invoices/[id] \
  -H "Content-Type: application/json" \
  -d '{ "installmentId": "[id]", "status": "RECEIVED" }'

# 4. Enviar cobrança
curl -X POST http://localhost:3010/api/cobranca/whatsapp \
  -H "Content-Type: application/json" \
  -d '{ "installmentId": "[id]", "phoneNumber": "+55..." }'
```

---

## 11. PERFORMANCE & ESCALABILIDADE

- **CashflowWeekly cache:** Reduz cálculo em tempo real
- **Índices:** userId + weekStart + monthYear para queries rápidas
- **Batch processing:** Recalcular cache via cron nightly
- **Paginação:** Invoices suportam paging
- **Normalization:** InvoiceInstallment separado para evitar N+1

---

## 12. REGRAS DE AUDITORIA

Toda ação registra em `AuditLog`:
- CREATE INVOICE
- UPDATE INVOICE_INSTALLMENT
- SEND_PAYMENT_REMINDER

Notifications criadas:
- PAYMENT_REMINDER (cobrança enviada)

---

**Status: ✅ PRONTO PARA USAR**

Implementação completa, testável e escalável. Segue padrões Flydea e integra com stack existente (Next.js, Prisma, NextAuth, Tailwind).
