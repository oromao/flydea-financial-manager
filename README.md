# 💰 Flydea Financial Manager

Uma plataforma de gerenciamento financeiro pessoal inteligente com IA, processamento de documentos via OCR e agentes autônomos.

**🌐 Live**: https://flydea-financial-manager.vercel.app

---

## ✨ Features

### 🧠 Copiloto IA Inteligente
- **Context-Aware**: Entende em qual página você está e oferece ajuda contextualizada
- **RAG Local**: Busca por sua documentação financeira sem enviar dados para APIs externas
- **Conversation History**: Mantém histórico para respostas mais precisas
- **Source Attribution**: Mostra fontes dos dados usados nas respostas

### 📊 Dashboard Completo
- Visão geral das finanças
- Gráficos de gastos por categoria
- Projeção de fluxo de caixa
- Status de orçamentos
- Alertas de anomalias

### 📱 Importação Inteligente
- **OCR com Tesseract.js**: Extrai dados de comprovantes fotografados
- **Múltiplas Estratégias**: Otimização de imagem para melhor reconhecimento
- **Validação de Duplicatas**: Detecta documentos repetidos
- **Suporte a Múltiplos Formatos**: JPEG, PNG, PDF

### 🤖 Agentes IA Autônomos
Crie agentes que rodam automaticamente:
- **Revisão de Orçamento**: Alerta quando orçamentos atingem limites
- **Alerta de Despesas**: Detecta gastos anormais
- **Verificação de Receita**: Monitora entrada de recursos
- **Projeção de Fluxo de Caixa**: Previsões futuras
- **Meta de Poupança**: Acompanhamento de objetivos

### 📧 Notificações
- Email via Resend
- Notificações in-app
- Webhooks customizados
- Agendamento via Cron

### 💼 Gestão Completa
- **Contas Bancárias**: Múltiplas contas com saldos
- **Categorias**: Organize gastos por tipo
- **Transações**: Entrada/saída com recorrências
- **Orçamentos**: Limites por categoria com alertas
- **Tags**: Marque e organize transações
- **Relatórios**: Análise detalhada de padrões

---

## 🚀 Quick Start

### Pré-requisitos
```bash
Node.js 18+
PostgreSQL
npm ou yarn
```

### 1. Clone e Setup
```bash
git clone https://github.com/oromao/flydea-financial-manager.git
cd flydea-financial-manager
npm install
```

### 2. Variáveis de Ambiente
Crie `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flydea"

# Auth
NEXTAUTH_SECRET="gere_uma_secret_aleatoria"
NEXTAUTH_URL="http://localhost:3010"

# Email
RESEND_API_KEY="sua_chave_resend"

# Storage
BLOB_READ_WRITE_TOKEN="seu_token_vercel_blob"

# Cron (para production)
CRON_SECRET="sua_secret_random"
```

### 3. Setup Banco de Dados
```bash
npx prisma generate
npx prisma db push
npx prisma db seed # Opcional: dados de exemplo
```

### 4. Rodando Localmente
```bash
npm run dev
```

Abra [http://localhost:3010](http://localhost:3010)

---

## 📦 Stack Tecnológico

### Frontend
- **Next.js 16+**: Framework React/SSR
- **React**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animações
- **Lucide Icons**: Ícones

### Backend
- **Next.js API Routes**: Backend serverless
- **Prisma ORM**: Database abstraction
- **PostgreSQL**: Database
- **NextAuth.js**: Autenticação

### IA & Processamento
- **Local RAG**: Busca em documentação local com TF-IDF
- **Tesseract.js**: OCR browser-side
- **Sharp**: Otimização de imagens
- **Cron-Parser**: Parsing de cron expressions

### Infraestrutura
- **Vercel**: Hosting
- **Vercel Blob**: Storage de documentos
- **Resend**: Email service

---

## 🏗️ Arquitetura

### Domain-Driven Design + Clean Architecture

```
src/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   │   ├── agents/               # Agent management
│   │   ├── cron/                 # Cron jobs
│   │   └── rag/                  # RAG queries
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Dashboard
│
├── domain/                       # Entidades e Regras de Negócio
│   ├── agent/
│   │   ├── entities/             # AIAgent, AgentAction, AgentExecution
│   │   └── value-objects/        # AgentType, ExecutionStatus
│   ├── transaction/              # Transaction entities
│   └── ...
│
├── application/                  # Use Cases & Orchestration
│   ├── agent/
│   │   └── use-cases/            # CreateAgentUseCase, ExecuteAgentUseCase
│   └── ...
│
├── infrastructure/               # Implementações técnicas
│   ├── repositories/             # Prisma repositories
│   ├── services/                 # Queue, Scheduler, Email, Storage
│   └── ...
│
└── lib/                          # Utilitários
    ├── prisma.ts                 # Prisma client
    ├── utils.ts                  # Helper functions
    └── ...
```

### Fluxo de Execução de Agentes

```
1. Vercel Cron (0 9 * * *)
   ↓
2. GET /api/cron/agent-scheduler
   ↓
3. AgentQueue.enqueueAllActive()
   └─ Encontra todos os agentes ativos
   ↓
4. AgentQueue.processQueue()
   └─ Processa até 5 em paralelo
   └─ Retry automático (3x)
   ↓
5. ExecuteAgentUseCase.execute()
   ├─ Coleta dados financeiros
   ├─ Analisa padrões
   ├─ Cria insights
   └─ Executa ações (email, notificação, etc)
   ↓
6. Response com métricas
   └─ Sucesso/falha/queued
```

---

## 🧠 Sistema de IA

### Copiloto Inteligente

O copiloto detecta sua localização na app e oferece ajuda contextualizada:

```typescript
// Detecção automática de página
if (pathname.includes("agents")) → "Agentes IA"
if (pathname.includes("movimentacoes")) → "Transações & Importação"
if (pathname.includes("insights")) → "Insights Financeiros"
...

// Sugestões contextuais
Agentes IA: "Como criar um agente de alerta?"
Insights: "Quais são meus padrões de gasto?"
```

### RAG Local (Retrieval-Augmented Generation)

```
Pergunta do usuário
  ↓
TF-IDF Search (busca documentação local)
  ↓
Ranking de relevância
  ↓
Contexto financeiro da página
  ↓
Construção de prompt
  ↓
Resposta + Sources
```

**Sem enviar dados para APIs externas - tudo local!**

---

## 🤖 Sistema de Agentes

### Criar um Agente

```typescript
const agent = AIAgent.create({
  userId: "user-123",
  name: "Alerta de Gastos",
  type: AgentType.EXPENSE_ALERT,
  schedule: "0 9 * * *", // Diariamente 9 AM
  timezone: "America/Sao_Paulo",
  config: {
    threshold: 100, // Alerta acima de R$100
    categories: ["FOOD", "ENTERTAINMENT"]
  }
});
```

### Execução Automática

Todos os dias às **9 AM**, a função executa:

1. **Enfileira** todos os agentes ativos
2. **Processa em batch** (máx 5 paralelos)
3. **Retry automático** em caso de falha
4. **Executar ações** (email, notificação, webhook)
5. **Registrar resultado** no banco de dados

### Ações Suportadas

- 📧 **EMAIL**: Via Resend
- 🔔 **IN_APP_NOTIFICATION**: No dashboard
- 📱 **SMS**: Futura integração
- 🔗 **WEBHOOK**: POST em URL customizada

---

## 📱 OCR & Document Processing

### Como Funciona

1. **Upload de Comprovante**
   - Suporta JPEG, PNG, PDF
   - Até 5MB por arquivo

2. **Otimização de Imagem**
   - Greyscale + Normalize
   - Contrast Enhancement
   - Resize para melhor reconhecimento

3. **Extração de Dados**
   - OCR via Tesseract.js
   - Parsing de valores monetários
   - Detecção de duplicatas

4. **Validação & Review**
   - Usuário revisa antes de importar
   - Edita valores se necessário
   - Confirma categoria

5. **Import**
   - Cria transaction
   - Armazena documento em Blob Storage
   - Registra no histórico

### Formatos Suportados

```
✅ JPEG, JPG
✅ PNG
✅ PDF (single page)
✅ Comprovantes de PIX
✅ Recibos
✅ Notas Fiscais
```

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# 1. Push para main
git push origin main

# 2. Vercel auto-deploy acontece

# 3. Configure env vars em Vercel Dashboard
```

**Variáveis necessárias:**
```
DATABASE_URL
NEXTAUTH_SECRET
RESEND_API_KEY
BLOB_READ_WRITE_TOKEN
CRON_SECRET
```

### Cron Jobs

Vercel executa automaticamente:
```
GET /api/cron/agent-scheduler
Horário: 9:00 AM (UTC-3)
Frequência: Daily
```

Processa todos os agentes ativos em uma única chamada.

---

## 📊 Monitoramento

### Verificar Saúde do Sistema

**Endpoint de Métricas** (requer auth):
```
GET /api/agents/health
```

Resposta:
```json
{
  "totalActive": 12,
  "totalExecutions": 156,
  "lastExecutionTime": "2024-04-19T09:15:00Z",
  "failureRate": 0.05
}
```

### Logs

Logs estão em:
- **Vercel Dashboard** → Deployments → Logs
- **Local**: `console.log()` em desenvolvimento

---

## 🔒 Segurança

### Proteção de Endpoints

Todos os cron endpoints protegidos por `CRON_SECRET`:

```
GET /api/cron/agent-scheduler?secret=seu_secret
```

Verificação em production:
```typescript
if (secret !== CRON_SECRET && process.env.NODE_ENV === "production") {
  return 401 Unauthorized
}
```

### Autenticação

- **NextAuth.js** com credentials
- Session storage
- CSRF protection

### Dados Pessoais

- Usuário só vê seus próprios dados
- Row-level security em queries
- Criptografia de emails sensíveis

---

## 📈 Performance

### Otimizações

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Lazy loading de componentes
- **Database Indexes**: Principais queries indexadas
- **Caching**: SWR no frontend
- **Batch Processing**: Agentes executam em paralelo

### Benchmarks

- **Dashboard**: < 2s load time
- **Upload OCR**: < 5s processing
- **Agent Execution**: < 30s por agente

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type check
npm run type-check

# Build check
npm run build
```

---

## 📚 Documentação Adicional

- **[AGENTS_SYSTEM.md](./AGENTS_SYSTEM.md)** - Documentação completa de agentes
- **[CRON_ALTERNATIVES.md](./CRON_ALTERNATIVES.md)** - Usar cron externo (EasyCron, etc)
- **[EASYCRON_SETUP.md](./EASYCRON_SETUP.md)** - Setup passo a passo EasyCron
- **[COMPLETION_STATUS.md](./COMPLETION_STATUS.md)** - Status do sistema
- **[QUICK_START.md](./QUICK_START.md)** - Guia rápido

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

MIT License - veja LICENSE.md

---

## 👤 Autor

**Seu Nome**
- GitHub: [@oromao](https://github.com/oromao)
- Email: seu.email@example.com

---

## 🙏 Agradecimentos

- Vercel pelo hosting excelente
- Prisma pela ORM incrível
- Comunidade Next.js

---

## 📞 Suporte

Tem dúvidas ou encontrou um bug?

1. Verifique a [documentação](./docs)
2. Veja [issues existentes](https://github.com/oromao/flydea-financial-manager/issues)
3. [Crie uma nova issue](https://github.com/oromao/flydea-financial-manager/issues/new)

---

**Built with ❤️ using Next.js + TypeScript + Tailwind CSS**
