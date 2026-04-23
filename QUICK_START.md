# 🎯 GUIA RÁPIDO - Como Acessar Todos os Recursos

## ✅ Tudo Está Integrado no Frontend!

---

## 📍 **ONDE ENCONTRAR CADA RECURSO**

### 1️⃣ **Dashboard Principal** (Home Page)
**URL**: `http://localhost:3010`

✅ **4 Novos Cards Integrados:**
- **🤖 Agentes IA** - Card roxo (quick access para criar/gerenciar agentes)
- **📄 Importar Comprovante** - Card verde (quick access para OCR)
- **IA Insights** - Card azul (quick access para chat com IA)
- **Registrar Movimento** - Card branco (quick add tradicional)

---

### 2️⃣ **Página de Agentes IA**
**URL**: `http://localhost:3010/agents`

✅ **O que fazer:**
1. Clique no card roxo "🤖 Agentes IA" no dashboard
2. OU acesse diretamente via menu lateral (sidebar)
3. Verá a lista de agentes e botão "Novo Agente"

**Funcionalidades:**
- ✅ Criar agentes (4-step wizard)
- ✅ Listar agentes ativos
- ✅ Executar agente manualmente
- ✅ Ver histórico de execuções
- ✅ Deletar agentes

---

### 3️⃣ **Copiloto IA (Floating Button)**
**Aparece em**: Todas as páginas

✅ **Como usar:**
1. Procure o **botão redondo roxo** com ícone de cérebro na parte inferior direita
2. Clique para abrir o painel de chat
3. Escreva sua pergunta sobre finanças
4. O IA responde com análise em tempo real

**Exemplos de perguntas:**
- "Qual foi meu gasto maior este mês?"
- "Como está meu fluxo de caixa?"
- "Qual é minha categoria de maior despesa?"
- "Quantopreciso economizar para atingir minha meta?"

---

### 4️⃣ **AI Chat Completo (Insights)**
**URL**: `http://localhost:3010/insights`

✅ **Como acessar:**
1. Clique no card azul "IA Insights" no dashboard
2. OU acesse via menu lateral → "Insights"
3. Interface grande de chat com histórico

**Diferenciais:**
- Chat em fullscreen
- Histórico de conversas
- Análises mais detalhadas
- Sugestões de perguntas

---

### 5️⃣ **Importação de Comprovantes (OCR)**
**URL**: `http://localhost:3010/movimentacoes`

✅ **Como usar:**
1. Clique no card verde "📄 Importar Comprovante" no dashboard
2. OU clique no botão "Importar Comprovante" em qualquer lugar
3. Arraste ou clique para selecionar arquivo (PDF, PNG, JPG, etc)

**O que acontece automaticamente:**
- ✅ OCR extrai o texto (múltiplas estratégias)
- ✅ Detecta valores monetários
- ✅ Identifica datas
- ✅ Extrai nomes das partes
- ✅ Classifica tipo de documento
- ✅ Mostra preview para edição
- ✅ Salva em Vercel Blob
- ✅ Cria transação no sistema

---

## 🔧 **REQUISITOS PARA FUNCIONAR 100%**

### Variáveis de Ambiente (.env.local)
```bash
# Obrigatório para Email (Resend)
RESEND_API_KEY=re_xxxxx

# Obrigatório para Storage (Blob)
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Recomendado para segurança
CRON_SECRET=seu_secret_muito_seguro
```

---

## 📊 **FLUXOS DE TESTE**

### Teste 1: Copiloto IA (Mais Fácil)
1. Abra a home page
2. Clique no botão roxo redondo (canto inferior direito)
3. Pergunte algo como: "Qual foi minha maior despesa?"
4. Veja a resposta IA em tempo real ✅

### Teste 2: Criar um Agente
1. Vá para `/agents`
2. Clique "Novo Agente"
3. Siga o wizard:
   - Selecione tipo (ex: Budget Review)
   - Adicione nome e descrição
   - Configure schedule (ex: "todo dia às 9:00")
   - Configure ação de email
4. Clique "Criar Agente" ✅

### Teste 3: Importar Comprovante
1. Vá para `/movimentacoes`
2. Clique "Importar Comprovante"
3. Selecione uma imagem ou PDF
4. Sistema extrai dados automaticamente
5. Edite se necessário
6. Clique "Importar" ✅

---

## 🎨 **INTERFACES VISUAIS**

### Dashboard (Home)
```
[Header com data e notificações]
[4 cards de resumo financeiro]
[Gráfico de fluxo mensal]
[4 CARDS NOVOS COM LINKS]:
  - 🤖 Agentes IA (roxo)
  - 📄 Importar (verde)
  - IA Insights (azul)
  - Registrar (branco)
```

### Agents Page
```
[Header "Agentes IA"]
[Botão "Novo Agente"]
[Lista de agentes com]:
  - Nome, tipo, schedule
  - Botão executar
  - Botão histórico
  - Botão deletar
```

### Copiloto Sidebar (todas páginas)
```
[Botão flutuante roxo no canto inferior direito]
  ↓ Clique
[Painel desliza da direita]:
  [Header com fechar/minimizar]
  [Área de chat com histórico]
  [Input para nova pergunta]
```

---

## ✨ **FEATURES ATIVAS**

| Feature | Status | Acesso | Funciona |
|---------|--------|--------|----------|
| Copiloto IA | ✅ | Botão flutuante | Sim |
| RAG Engine | ✅ | /api/rag/local-query | Sim |
| Agentes IA | ✅ | /agents | Sim |
| OCR Docs | ✅ | /movimentacoes | Sim |
| Blob Storage | ✅ | Automático | Sim |
| Email (Resend) | ⚠️ | Agentes | Se configurado |
| Scheduler (Cron) | ✅ | Vercel | Sim |

---

## 🚀 **PRÓXIMOS PASSOS**

1. Rode o app:
```bash
npm run dev
```

2. Abra no navegador:
```
http://localhost:3010
```

3. Teste na ordem:
   - Copiloto (botão flutuante)
   - Dashboard cards
   - /agents
   - /movimentacoes
   - /insights

4. Configure `.env.local` com:
   - `RESEND_API_KEY` (para email)
   - `VERCEL_BLOB_READ_WRITE_TOKEN` (para upload)

---

## 🐛 **TROUBLESHOOTING**

### "Copiloto não aparece"
- Verifique se está em página autenticada
- Procure botão roxo no canto inferior direito
- Atualize a página (F5)

### "Agentes não carregam"
- Verifique `/api/agents` endpoint
- Confirme autenticação
- Verifique logs do console

### "OCR não funciona"
- Tente imagem mais clara
- Máximo 10MB
- Formatos: PDF, JPG, PNG, WEBP

### "Email não envia"
- Configure `RESEND_API_KEY`
- Confirme email no agente
- Verifique logs de execução

---

## 📚 **DOCUMENTAÇÃO COMPLETA**

- `AGENTS_SYSTEM.md` - Guia de agentes
- `COMPLETION_STATUS.md` - Status detalhado
- `RAG.md` - Sistema RAG (se existir)

---

**Tudo está pronto para usar!** 🎉
