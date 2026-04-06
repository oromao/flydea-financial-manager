# 📊 Guia: Sistema de Fluxo de Caixa Semanal com Parcelamento

## O Que Foi Implementado

Um **motor de previsão de caixa baseado em realidade**, que mostra:
- Quanto dinheiro entra **realmente** cada semana
- Quanto já foi faturado vs quanto será recebido
- Se você pode gastar dinheiro agora
- Quando terá dinheiro novamente

## Princípios Fundamentais

### 1️⃣ Receita NÃO entra no caixa na emissão
```
Você fatura R$ 1.000 → MAS recebe R$ 0 imediatamente
Você recebe a parcela → AGORA entra no caixa
```

### 2️⃣ Parcelamento Real
```
Venda de R$ 4.000 em 4x:
- Parcela 1 (30/04): R$ 1.000
- Parcela 2 (31/05): R$ 1.000
- Parcela 3 (30/06): R$ 1.000
- Parcela 4 (31/07): R$ 1.000

Cada parcela entra no caixa apenas na sua data de vencimento
```

### 3️⃣ Semanas do Mês
```
Semana 1: dias 1-7
Semana 2: dias 8-14
Semana 3: dias 15-21
Semana 4: dias 22-31 (final do mês)
```

---

## API Reference

### 1. GET `/api/cashflow/weekly`

Retorna previsão semanal do mês atual.

**Response:**
```json
{
  "data": [
    {
      "week": 1,
      "weekStart": "2026-04-01",
      "weekEnd": "2026-04-07",
      "totalIncome": 2000,           // já recebido
      "projectedIncome": 1500,       // a receber
      "totalExpenses": 800,
      "balance": 1200,               // income - expenses
      "canSpend": true
    },
    {
      "week": 2,
      "weekStart": "2026-04-08",
      "weekEnd": "2026-04-14",
      "totalIncome": 3000,
      "projectedIncome": 2000,
      "totalExpenses": 1200,
      "balance": 1800,
      "canSpend": true
    }
    // ... semanas 3 e 4
  ],
  "metrics": {
    "totalIncome": 8000,             // recebido
    "totalExpenses": 3800,
    "totalProjectedIncome": 5500,    // a receber
    "monthBalance": 4200,            // saldo final
    "faturado": 13500,               // recebido + a receber
    "aReceber": 5500
  },
  "referenceDate": "2026-04-06"
}
```

### 2. GET `/api/cashflow/decision`

Determina se você pode gastar nesta semana.

**Response:**
```json
{
  "currentWeek": 2,
  "dayOfMonth": 6,
  "decision": {
    "status": "PODE_GASTAR",
    "motivo": "Saldo positivo esta semana e próxima",
    "saldoAtual": 1800,
    "saldoProximaSemana": 2100
  },
  "weeklyCashflow": [...]
}
```

**Status Possíveis:**
- `PODE_GASTAR`: Saldo positivo agora e semana que vem
- `ALERTA`: Saldo positivo agora, mas semana que vem em risco
- `NAO_PODE_GASTAR`: Saldo negativo ou zerado

### 3. POST `/api/revenues`

Cria uma receita com parcelamento automático.

**Request:**
```json
{
  "description": "Venda de projeto",
  "totalAmount": 4000,
  "emissionDate": "2026-04-01",
  "type": "PARCELADO",           // ou "AVISTA"
  "categoryId": "cat_123",
  "numberOfInstallments": 4,     // distribuir em 4 parcelas
  "observations": "Cliente: Acme Corp"
}
```

**Response:**
```json
{
  "revenue": {
    "id": "rev_123",
    "description": "Venda de projeto",
    "totalAmount": 4000,
    "type": "PARCELADO",
    "status": "EMITTED",
    "emissionDate": "2026-04-01",
    "createdAt": "2026-04-06"
  },
  "installments": [
    {
      "id": "inst_1",
      "revenueId": "rev_123",
      "installmentNumber": 1,
      "amount": 1000,
      "dueDate": "2026-05-01",
      "status": "PENDING"
    },
    // ... parcelas 2, 3, 4
  ]
}
```

---

## Exemplo Prático: Cálculo Real

### Cenário
```
Data: 6 de Abril de 2026 (Quarta, Semana 2)

RECEITAS (Parcelas):
- 02/04 (Semana 1): R$ 500 ✓ RECEBIDO
- 08/04 (Semana 2): R$ 1.500 (PENDING - vai receber)
- 15/04 (Semana 3): R$ 800 (PENDING)
- 22/04 (Semana 4): R$ 800 (PENDING)

DESPESAS:
- 05/04 (Semana 1): R$ 300 ✓ PAGO
- 10/04 (Semana 2): R$ 600 (PENDING)
- 20/04 (Semana 3): R$ 400 (PENDING)
- 28/04 (Semana 4): R$ 200 (PENDING)
```

### Cálculo por Semana

**Semana 1 (01-07 de Abril):**
```
Entradas:     R$ 500 (recebido em 02/04)
Saídas:       R$ 300 (despesa em 05/04)
─────────────────────────
SALDO:        R$ 200 ✅ PODE_GASTAR
Projetado:    R$ 0 a receber nesta semana
```

**Semana 2 (08-14 de Abril) ← VOCÊ ESTÁ AQUI**
```
Entradas:     R$ 1.500 (vai receber em 08/04)
Saídas:       R$ 600 (despesa em 10/04)
─────────────────────────
SALDO:        R$ 900 ✅ PODE_GASTAR
Projetado:    R$ 1.500 a receber
```

**Semana 3 (15-21 de Abril):**
```
Entradas:     R$ 800 (vai receber em 15/04)
Saídas:       R$ 400 (despesa em 20/04)
─────────────────────────
SALDO:        R$ 400 ✅ PODE_GASTAR
Projetado:    R$ 800 a receber
```

**Semana 4 (22-30 de Abril):**
```
Entradas:     R$ 800 (vai receber em 22/04)
Saídas:       R$ 200 (despesa em 28/04)
─────────────────────────
SALDO:        R$ 600 ✅ PODE_GASTAR
Projetado:    R$ 800 a receber
```

### Decisão de Gasto (AGORA - Semana 2)
```
Semana atual:      R$ 900 positivo ✓
Próxima semana:    R$ 400 positivo ✓
───────────────────────────────────
DECISÃO:           🟢 PODE_GASTAR

Motivo: Saldo positivo esta semana e próxima
```

### Métricas do Mês
```
Recebido:          R$ 500
Faturado:          R$ 3.900 (500 + 1500 + 800 + 800)
A Receber:         R$ 3.900
Despesas:          R$ 1.500
─────────────────────────
SALDO DO MÊS:      R$ 2.400

Conclusão: Excelente fluxo! Receitas > Despesas
```

---

## Como Usar no Frontend

### Dashboard
Ao acessar `/` (tela inicial), você verá:

1. **Indicador de Decisão** (🟢 🟡 🔴)
   - Status: Pode gastar / Atenção / Não pode gastar
   - Saldo desta semana + próxima

2. **Previsão Semanal** (4 cards)
   - Semana 1, 2, 3, 4
   - Entradas + Saídas + Saldo de cada semana
   - Cores: Verde (positivo) / Vermelho (negativo)

3. **Resumo do Mês**
   - Faturado (total faturado)
   - A Receber (parcelas pendentes)
   - Saldo do Mês

---

## Integração com Sistema Existente

### Receitas vs Invoices
Atualmente, o sistema suporta **Invoices** (faturas).
Estamos migrando para **Revenues** (receitas genéricas).

**Plano de migração:**
```
Invoices (para clientes)
    ↓
Revenues (modelo unificado)
    ↓
RevenueInstallments (parcelas)
    ↓
calculateWeeklyCashflow()
```

### Despesas (Transactions)
Continuam usando o modelo existente:
- `type: "EXPENSE"`
- `dueDate`: data de vencimento
- `paymentStatus`: PAID / PENDING

---

## Criando sua Primeira Receita com Parcelamento

### Via API (cURL)
```bash
curl -X POST http://localhost:3000/api/revenues \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Consultoria - 3 meses",
    "totalAmount": 6000,
    "emissionDate": "2026-04-06",
    "type": "PARCELADO",
    "categoryId": "cat_vendas",
    "numberOfInstallments": 3,
    "observations": "Cliente: Tech Corp"
  }'
```

### Resultado
```json
{
  "revenue": {
    "id": "rev_abc123",
    "description": "Consultoria - 3 meses",
    "totalAmount": 6000,
    "status": "EMITTED"
  },
  "installments": [
    {
      "installmentNumber": 1,
      "amount": 2000,
      "dueDate": "2026-05-06",
      "status": "PENDING"
    },
    {
      "installmentNumber": 2,
      "amount": 2000,
      "dueDate": "2026-06-06",
      "status": "PENDING"
    },
    {
      "installmentNumber": 3,
      "amount": 2000,
      "dueDate": "2026-07-06",
      "status": "PENDING"
    }
  ]
}
```

### Próximo Passo
Agora, quando você chamar `/api/cashflow/weekly`, essas parcelas aparecerão na previsão:
- Maio: +R$ 2.000 (Semana 2, 8-14)
- Junho: +R$ 2.000 (Semana 1 ou 2)
- Julho: +R$ 2.000 (Semana 1 ou 2)

---

## Interpretando o Dashboard

### 🟢 Pode Gastar
Você tem saldo positivo **esta semana E a próxima**.
Seguro gastar, terá dinheiro novamente.

### 🟡 Atenção
Você tem saldo positivo **agora**, mas a próxima semana é apertada.
Gaste, mas com cautela.

### 🔴 Não Pode Gastar
Seu saldo **está negativo ou zerado**.
Evite gastos, espere receitas chegarem.

---

## Diferenças Importantes

### FATURADO vs RECEBIDO
```
FATURADO = Você emitiu a nota
├─ R$ 500 ✓ Recebido (parcela 1 chegou)
└─ R$ 1.500 (pendente, vai chegar em 08/04)
   TOTAL: R$ 2.000 faturado

RECEBIDO = Dinheiro que já caiu na conta
═> R$ 500 apenas

A RECEBER = Dinheiro que ainda vai chegar
═> R$ 1.500 (em 08/04)
```

### Exemplo de Cenário
```
Se você gasta R$ 600 hoje (semana 1):
  Saldo antes:  R$ 200
  Gasto:       -R$ 600
  ─────────────────────
  Saldo após:   -R$ 400 ❌ NEGATIVO

MAS você sabe que em 08/04 entra R$ 1.500
  -R$ 400 + R$ 1.500 = R$ 1.100 ✓

Por isso o sistema avisa:
  "Semana 1: ⚠️ Saldo negativo"
  "Semana 2: ✅ Saldo recupera para R$ 1.100"
```

---

## Próximas Implementações

- [ ] UI para criar/editar receitas
- [ ] Converter invoices existentes para revenues
- [ ] Histórico de parcelas recebidas
- [ ] Notificações de parcelas vencendo
- [ ] Relatório de receivables (contas a receber)
- [ ] Projeção de 90 dias ahead
- [ ] Integração com banco de dados real

---

## Troubleshooting

### "Nenhum dado disponível"
- Verifique se existem receitas/despesas no mês
- Crie uma receita teste via API
- Atualize a página

### "Saldo sempre zero"
- Confirme que há parcelas com dueDate no mês atual
- Verifique status: PENDING ou RECEIVED

### Discrepâncias nos cálculos
- Confirme que as despesas têm `dueDate` preenchido
- Verifique timezone (datas devem estar em UTC/Brasília)
- Veja os logs do servidor

---

## Suporte

Para dúvidas ou bugs, consulte:
- `/src/lib/cashflow-calculator.ts` - Lógica de cálculo
- `/src/app/api/cashflow/` - Endpoints da API
- `/src/components/weekly-cashflow-forecast.tsx` - Component visual
