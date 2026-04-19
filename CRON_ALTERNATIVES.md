# 🔄 Alternativas de Cron Externo Free

Se você quer rodar agentes com frequência MAIOR que 1x por dia, aqui estão opções grátis:

---

## ✅ Opção 1: EasyCron (Recomendado)

**URL**: https://www.easycron.com

### Setup rápido:
1. Acesse https://www.easycron.com
2. Crie conta (free)
3. Clique em "Cron Jobs" → "Add"
4. Preencha:
   - **URL**: `https://seu-site.vercel.app/api/cron/agent-scheduler?secret=sua_secret`
   - **Cron Expression**: `*/5 * * * *` (a cada 5 minutos)
   - Ou qualquer frequência que quiser

### Limites do plano free:
- ✅ Frequência mínima: **5 minutos**
- ✅ Até **10 jobs**
- ✅ Histórico de execuções
- ✅ Notificações por email

---

## ✅ Opção 2: Cron-job.org

**URL**: https://cron-job.org

### Setup rápido:
1. Crie conta (free)
2. Dashboard → "Create Cronjob"
3. Preencha:
   - **URL**: `https://seu-site.vercel.app/api/cron/agent-scheduler?secret=sua_secret`
   - **Schedule**: `*/5 * * * *`
   - **Execution Timezone**: America/Sao_Paulo

### Limites do plano free:
- ✅ Frequência mínima: **1 minuto**
- ✅ Até **10 jobs**
- ✅ Logs completos

---

## ✅ Opção 3: AWS EventBridge (Para Avançados)

Se você tiver AWS account, use **EventBridge** (grátis no free tier):
- 0 custo no free tier
- Suporta expressões cron sofisticadas
- Integration com HTTP endpoints

---

## 🔐 Segurança: Defina uma Secret

Seu código já verifica a `CRON_SECRET`:

```typescript
// src/app/api/cron/agent-scheduler/route.ts
const secret = request.nextUrl.searchParams.get("secret");
if (secret !== CRON_SECRET && process.env.NODE_ENV === "production") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Faça isso:**
1. Gere uma secret aleatória:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Configure no Vercel:
   - Projeto → Settings → Environment Variables
   - Adicione: `CRON_SECRET=sua_secret_gerada`
3. Use a secret na URL:
   ```
   https://seu-site.vercel.app/api/cron/agent-scheduler?secret=sua_secret_gerada
   ```

---

## 📋 Comparação

| Serviço | Freq Mín | Jobs Free | Custo | Recomendado |
|---------|----------|-----------|-------|------------|
| **EasyCron** | 5 min | 10 | Free | ✅ Sim |
| **Cron-job.org** | 1 min | 10 | Free | ✅ Sim |
| **AWS EventBridge** | 1 min | ∞ | Free tier | 🔧 Avançado |
| **Vercel Free** | 1x/dia | 1 | Free | ❌ Limitado |

---

## 🚀 Próximos Passos

### Se ficar com Vercel Free:
✅ Feito! Seu cron roda **1x por dia às 9:00 AM**

### Se quiser frequência maior:
1. Escolha **EasyCron** ou **Cron-job.org**
2. Configure a URL com secret
3. Remova a config de crons do `vercel.json`

---

**Qual você prefere?** 🤔
