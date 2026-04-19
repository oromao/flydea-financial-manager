# Sistema de Agentes IA - Flydea

## Visão Geral

O sistema de Agentes IA permite que usuários automatizem análises financeiras e recebam notificações inteligentes baseadas em seus padrões de gasto, receita e orçamentos.

## Recursos Implementados

### 1. Dashboard de Agentes (`/agents`)

Interface completa para gerenciamento de agentes com:
- **Lista de Agentes**: Visualizar todos os agentes criados
- **Criar Agente**: Form wizard com 4 passos
- **Executar Agente**: Executar agente manualmente com um clique
- **Histórico**: Ver todos as execuções do agente com detalhes
- **Deletar**: Remover agentes não utilizados

**Localização**: `/src/components/agents/agents-dashboard.tsx`

### 2. Criação de Agentes (AgentForm)

Wizard completo com 4 passos:

**Passo 1: Seleção de Tipo**
- Budget Review: Revisa orçamentos contra limites
- Expense Alert: Detecta gastos anormais
- Income Check: Verifica receita
- Cashflow Forecast: Projeta fluxo de caixa
- Savings Goal: Monitora metas de poupança
- Custom: Agente personalizado

**Passo 2: Detalhes**
- Nome do agente
- Descrição (opcional)
- Timezone (padrão: America/Sao_Paulo)

**Passo 3: Schedule**
- Presets rápidos (a cada hora, diário, semanal, mensal)
- Expressão CRON customizada

**Passo 4: Ações**
- Email via Resend (configurável)
- SMS (estrutura pronta)
- In-App Notifications (estrutura pronta)
- Webhook (estrutura pronta)

**Localização**: `/src/components/agents/agent-form.tsx`

### 3. Histórico de Execuções

Componente para visualizar todas as execuções de um agente:
- Status (Pendente, Executando, Sucesso, Falha)
- Timestamps (criado, iniciado, concluído)
- Duração da execução
- Output da análise (JSON formatado)
- Mensagens de erro (se falha)

**Localização**: `/src/components/agents/agent-execution-history.tsx`

### 4. Integração com Resend (Email)

Envio automático de notificações por email após execução de agentes:

**Setup**:
```bash
# Adicione ao .env.local:
RESEND_API_KEY=sua_chave_api_resend
```

**Funcionamento**:
- Email automaticamente formatado com resultado da análise
- Inclui status, tipo de agente, output e erros
- Design responsivo e profissional
- Enviado automaticamente após execução bem-sucedida

**Localização**: 
- Cliente: `/src/lib/resend.ts`
- Serviço: `/src/infrastructure/services/EmailService.ts`

### 5. Agendamento Automático

Sistema de agendamento com CRON baseado em:
- Expressões CRON padrão Unix
- Timezone configurável por agente
- Execução automática via Vercel Cron

**Configuração Vercel** (`vercel.json`):
```json
{
  "path": "/api/cron/agent-scheduler",
  "schedule": "*/5 * * * *"  // A cada 5 minutos
}
```

**Localização**:
- Serviço: `/src/infrastructure/services/AgentScheduler.ts`
- Endpoint: `/src/app/api/cron/agent-scheduler/route.ts`

## Arquitetura

### Domain Layer (Entidades)

```
src/domain/agent/
├── entities/
│   ├── AIAgent.ts                 # Entidade principal
│   ├── AgentAction.ts             # Ações a executar
│   └── AgentExecution.ts          # Registro de execução
├── value-objects/
│   └── AgentType.ts               # Tipos de agentes (enum)
└── repositories/
    ├── IAgentRepository.ts        # Interface para agentes
    └── IAgentExecutionRepository.ts
```

### Application Layer (Use Cases)

```
src/application/agent/use-cases/
├── CreateAgentUseCase.ts          # Criar agente
├── ListAgentsUseCase.ts           # Listar agentes
├── ExecuteAgentUseCase.ts         # Executar agente
└── DeleteAgentUseCase.ts          # Deletar agente
```

### Infrastructure Layer (Implementação)

```
src/infrastructure/
├── repositories/
│   ├── PrismaAgentRepository.ts
│   └── PrismaAgentExecutionRepository.ts
└── services/
    ├── EmailService.ts            # Envio de emails
    └── AgentScheduler.ts          # Agendamento
```

### API Endpoints

```
POST   /api/agents                 # Criar agente
GET    /api/agents                 # Listar agentes
GET    /api/agents/[id]            # Obter agente
DELETE /api/agents/[id]            # Deletar agente
POST   /api/agents/[id]            # Executar agente
GET    /api/agents/[id]/executions # Histórico de execuções
GET    /api/cron/agent-scheduler   # Trigger agendador
```

## Schema do Banco de Dados

```prisma
model AIAgent {
  id        String   @id
  userId    String
  name      String
  description String?
  type      String   // AgentType enum
  schedule  String   // CRON expression
  isActive  Boolean  @default(true)
  timezone  String   @default("America/Sao_Paulo")
  config    Json     // Action configurations
  actions   AgentAction[]
  executions AgentExecution[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User @relation(fields: [userId], references: [id])

  @@index([userId])
}

model AgentAction {
  id        String   @id
  agentId   String
  type      String   // EMAIL, SMS, IN_APP_NOTIFICATION, WEBHOOK
  recipient String   // Email, phone, etc
  template  String?  // Template de mensagem
  order     Int      // Ordem de execução
  agent     AIAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([agentId])
}

model AgentExecution {
  id            String   @id
  agentId       String
  status        String   // PENDING, RUNNING, SUCCESS, FAILED
  output        Json?    // Resultado da análise
  actionResults Json?    // Resultado das ações
  error         String?  // Mensagem de erro
  scheduledAt   DateTime
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime @default(now())
  agent         AIAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([agentId])
  @@index([status])
}
```

## Tipos de Agentes Disponíveis

### 1. Budget Review
**Objetivo**: Revisar orçamentos e alertar quando ultrapassam limites
**Query RAG**: "Revise os orçamentos e me diga se algum está acima do limite"

### 2. Expense Alert
**Objetivo**: Detectar gastos anormais no mês
**Query RAG**: "Quais foram meus gastos anormais este mês?"

### 3. Income Check
**Objetivo**: Monitorar receita total e comparativo
**Query RAG**: "Qual foi minha receita total e como está se comparado ao mês anterior?"

### 4. Cashflow Forecast
**Objetivo**: Projetar fluxo de caixa futuro
**Query RAG**: "Qual é minha projeção de fluxo de caixa para os próximos 30 dias?"

### 5. Savings Goal
**Objetivo**: Monitorar progresso em metas de poupança
**Query RAG**: "Como está meu progresso em relação às metas de poupança?"

### 6. Custom
**Objetivo**: Agente personalizado configurável pelo usuário

## Fluxo de Execução

```
1. Usuário cria agente (AgentForm)
   ↓
2. CreateAgentUseCase persiste no banco
   ↓
3. Dois caminhos possíveis:
   
   a) Execução Manual:
      - Usuário clica "Executar" no dashboard
      - ExecuteAgentUseCase executa
      - Envia email se configurado
      
   b) Execução Automática:
      - AgentScheduler verifica a cada 5 minutos
      - Se CRON due, executa automaticamente
      - Envia email se configurado
   ↓
4. Execução cria AgentExecution record
   ↓
5. RAG query engine gera insights
   ↓
6. Ações são executadas (email via Resend)
   ↓
7. Resultado persisted no agentExecution
   ↓
8. Usuário pode visualizar no histórico
```

## Configuração para Desenvolvimento

### 1. Variáveis de Ambiente

```bash
# .env.local
RESEND_API_KEY=sua_chave_aqui
CRON_SECRET=seu_secret_aqui_para_producao
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

### 2. Prisma Migrations

```bash
npx prisma migrate dev --name add_agents_system
npx prisma generate
```

### 3. Testar Agendador (Desenvolvimento)

```bash
# POST para trigger manual
curl -X POST http://localhost:3000/api/cron/agent-scheduler

# Ou com query param para produção
curl "https://seu-site.com/api/cron/agent-scheduler?secret=SEU_CRON_SECRET"
```

## Próximos Passos / TODO

- [ ] SMS com Twilio
- [ ] Webhooks customizados
- [ ] In-app notifications
- [ ] Templates de email customizados
- [ ] Integração com Copiloto para sugestões
- [ ] Dashboard de analytics de agentes
- [ ] Export de relatórios dos agentes
- [ ] Testes unitários e e2e
- [ ] Rate limiting para agentes
- [ ] Auditoria de execuções

## Troubleshooting

### Email não é enviado
- Verifique se `RESEND_API_KEY` está configurada em `.env.local`
- Verifique o email configurado no agente
- Verifique logs da execução no histórico

### Agente não executa automaticamente
- Verifique se agente está ativo (isActive = true)
- Verifique expressão CRON (use cron-parser.com para validar)
- Verifique timezone configurada
- Verifique logs do cron endpoint em production

### Database schema out of sync
```bash
npx prisma db push --force-reset  # ⚠️ Apenas dev!
npx prisma generate
```

## Recursos Adicionais

- **CRON Syntax**: https://crontab.guru/
- **Timezone List**: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
- **Resend Docs**: https://resend.com/docs
- **Vercel Cron**: https://vercel.com/docs/cron-jobs

## Arquivos Chave

### Componentes Frontend
- `/src/components/agents/agents-dashboard.tsx` - Dashboard principal
- `/src/components/agents/agent-form.tsx` - Form de criação
- `/src/components/agents/agent-execution-history.tsx` - Histórico

### API
- `/src/app/api/agents/route.ts` - CRUD principal
- `/src/app/api/agents/[id]/route.ts` - Detalhes e execução
- `/src/app/api/agents/[id]/executions/route.ts` - Histórico

### Lógica
- `/src/application/agent/use-cases/` - Use cases
- `/src/infrastructure/repositories/` - Repositories
- `/src/infrastructure/services/` - Serviços (Email, Scheduler)
- `/src/domain/agent/` - Domain entities e value objects

### Página
- `/src/app/agents/page.tsx` - Página de agentes
