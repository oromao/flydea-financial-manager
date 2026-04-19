# 🚀 Production Deployment Guide

Guia completo para deployar Flydea em produção com segurança e confiabilidade.

---

## 📋 Checklist Pré-Deploy

### Código
- [ ] Todos os testes passando (`npm run test`)
- [ ] Build sem erros (`npm run build`)
- [ ] TypeScript type check limpo (`npm run type-check`)
- [ ] Sem console.log em produção
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets não commitados

### Banco de Dados
- [ ] PostgreSQL rodando
- [ ] Migrations aplicadas (`npx prisma db push`)
- [ ] Backups configurados
- [ ] Indexes otimizados

### Infraestrutura
- [ ] Vercel project criado
- [ ] Domain apontando corretamente
- [ ] CDN configurado (se needed)
- [ ] SSL/HTTPS ativo

### Segurança
- [ ] Senhas fortes geradas
- [ ] Rate limiting configurado
- [ ] CORS ajustado
- [ ] Environment variables secretas

---

## ✅ Step 1: Preparar Vercel

### 1.1 Criar/Configurar Projeto Vercel

```bash
# Se novo projeto
npm i -g vercel
vercel
# Follow prompts

# Se projeto existente
vercel --scope seu-username
```

### 1.2 Conectar Repositório

No dashboard Vercel:
1. Novo projeto
2. Importar do GitHub
3. Selecionar `oromao/flydea-financial-manager`
4. Configure build/deploy settings

---

## ✅ Step 2: Configurar Environment Variables

No **Vercel Dashboard → Settings → Environment Variables**, adicione:

### Database
```
DATABASE_URL = postgresql://user:password@host:5432/flydea
```

### Authentication
```
NEXTAUTH_SECRET = [resultado: openssl rand -hex 32]
NEXTAUTH_URL = https://seu-dominio.com
```

### Email
```
RESEND_API_KEY = [sua chave Resend]
```

### Storage
```
BLOB_READ_WRITE_TOKEN = [seu token Vercel Blob]
```

### Cron Security
```
CRON_SECRET = [resultado: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

### Feature Flags (Opcional)
```
ENABLE_OCR = true
ENABLE_AGENTS = true
ENABLE_COPILOT = true
```

### Gerar Secrets Seguras

```bash
# NEXTAUTH_SECRET
openssl rand -hex 32

# CRON_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ Step 3: Preparar Database

### 3.1 Provisionar PostgreSQL

**Opções Recomendadas:**
- **Supabase** (recomendado): https://supabase.com
- **Railway**: https://railway.app
- **NeonDB**: https://neon.tech
- **ElephantSQL**: https://www.elephantsql.com
- **AWS RDS**: https://aws.amazon.com/rds/

**Para Supabase (mais fácil):**
1. Crie conta em supabase.com
2. Crie novo project
3. Copie `postgresql://` URL
4. Use como `DATABASE_URL`

### 3.2 Aplicar Migrations

```bash
# Local (antes de fazer push)
npx prisma db push

# Ou em production (via Vercel terminal)
npx prisma db push --skip-generate
```

### 3.3 Criar Índices

Já estão no schema.prisma:
```prisma
@@index([userId])
@@index([status])
@@index([createdAt])
```

---

## ✅ Step 4: Deploy Inicial

### 4.1 Push para Main

```bash
git add .
git commit -m "chore: production ready"
git push origin main
```

### 4.2 Vercel Auto-Deploy

Vercel detecta push em `main` e faz deploy automaticamente:

```
1. Build
2. Prisma generate
3. DB push (se necessário)
4. Next.js build
5. Deploy para CDN global
```

### 4.3 Verificar Deploy

1. Acesse Vercel Dashboard → Deployments
2. Espere status ficar **Ready** (verde)
3. Clique em **Visit** para testar
4. Verifique logs se houver erro

---

## ✅ Step 5: Configurar Cron Jobs

### 5.1 Vercel Cron (Automático)

`vercel.json` já tem:
```json
{
  "crons": [
    {
      "path": "/api/cron/agent-scheduler",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Executa diariamente às 9 AM (UTC-3).

### 5.2 Monitorar Execução

1. Vercel Dashboard → Cron Jobs
2. Veja histórico de execuções
3. Logs de sucesso/erro

---

## ✅ Step 6: Monitoramento & Observabilidade

### 6.1 Logs

```bash
# Via Vercel CLI
vercel logs [project-name]

# Tempo real
vercel logs [project-name] --follow
```

### 6.2 Sentry (Opcional)

Integre error tracking:

```bash
npm install @sentry/nextjs
```

Em `next.config.js`:
```javascript
const withSentry = require("@sentry/nextjs");

module.exports = withSentry(
  {
    // seu config
  },
  {
    org: "seu-org",
    project: "seu-projeto",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

### 6.3 Uptime Monitoring

Serviços grátis:
- **Uptimerobot**: https://uptimerobot.com
- **Pingdom**: https://www.pingdom.com
- **Healthchecks.io**: https://healthchecks.io

Configure para monitorar:
- GET `/api/cron/agent-scheduler` (health check)
- GET `/` (dashboard)

---

## 🔒 Security Checklist

### API Security
```typescript
// ✅ Rate limiting
import rateLimit from "express-rate-limit";

// ✅ Input validation
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

// ✅ SQL injection protection
// Prisma previne automaticamente

// ✅ CSRF protection
// NextAuth.js handle automaticamente
```

### Authentication
- [ ] NextAuth configurado
- [ ] Senhas com hash (bcryptjs)
- [ ] JWT secrets fortes
- [ ] Session timeout configurado

### Data Protection
- [ ] HTTPS/TLS ativo
- [ ] Dados sensíveis não em logs
- [ ] Backup automático do DB
- [ ] GDPR compliance (se EU)

### API Endpoints
- [ ] Rate limits
- [ ] CORS configurado
- [ ] Secret key validation
- [ ] Input sanitization

---

## 📊 Performance Optimization

### 1. Database
```sql
-- Índices críticos
CREATE INDEX idx_agent_user_active ON "AIAgent"(userId, isActive);
CREATE INDEX idx_transaction_date ON "Transaction"(date);
CREATE INDEX idx_execution_status ON "AgentExecution"(status);
```

### 2. Caching
```typescript
// SWR no frontend
const { data } = useSWR(`/api/agents`, fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
});
```

### 3. Image Optimization
```typescript
import Image from "next/image";

export default function Icon() {
  return (
    <Image
      src="/icon.png"
      alt="icon"
      width={32}
      height={32}
      priority={false}
    />
  );
}
```

---

## 🐛 Debugging em Produção

### Acessar Logs
```bash
vercel logs --tail
```

### Conectar ao Database em Produção
```bash
# Usar Prisma Studio
npx prisma studio

# Ou via cliente local
psql postgresql://user:pwd@host:5432/flydea
```

### Executar Cron Manualmente
```bash
# Via curl
curl -X GET \
  "https://seu-site.vercel.app/api/cron/agent-scheduler?secret=CRON_SECRET" \
  -H "Authorization: Bearer token"

# Resultado esperado
{
  "success": true,
  "duration": "2500ms",
  "results": {
    "executed": 5,
    "failed": 0,
    "queued": 0
  }
}
```

---

## 🚨 Incident Response

### Agent Scheduler Falhou

1. **Verificar logs**
   ```bash
   vercel logs --tail | grep agent-scheduler
   ```

2. **Testar manualmente**
   ```bash
   curl -X GET "https://seu-site/api/cron/agent-scheduler?secret=XXX"
   ```

3. **Verificar banco**
   ```bash
   npx prisma studio
   # Cheque tabela AIAgent e AgentExecution
   ```

4. **Rollback se necessário**
   ```bash
   vercel rollback
   ```

### Database Connection Erro

1. **Verificar CONNECTION_URL**
   ```bash
   echo $DATABASE_URL
   ```

2. **Testar conexão**
   ```bash
   npx prisma db execute --stdin
   SELECT 1;
   ```

3. **Reiniciar conexão**
   - Vercel redeploy automático reconecta

---

## 📈 Scaling

### Quando Escalar

| Métrica | Limite | Ação |
|---------|--------|------|
| Agents Ativos | 50+ | Usar batch processing (já implementado) |
| Users | 1000+ | DB read replicas |
| Requests/sec | 100+ | CDN caching |
| Storage | 10GB+ | Arquivar documentos antigos |

### Horizontal Scaling

1. **Database Read Replicas**
   - Supabase: Settings → Compute
   - Railway: Scale up

2. **Edge Functions**
   ```bash
   # Vercel Edge Functions
   # Coloca código mais perto do usuário
   export const config = {
     runtime: 'edge',
   };
   ```

3. **Background Jobs**
   - Usar Vercel Cron (já feito)
   - Ou Bull/BullMQ se processos longos

---

## 📋 Manutenção Contínua

### Daily
- [ ] Verificar logs
- [ ] Monitorar uptime
- [ ] Verificar alertas

### Weekly
- [ ] Review performance metrics
- [ ] Verificar failed agents
- [ ] Database health check

### Monthly
- [ ] Database backup test
- [ ] Dependency updates
- [ ] Security audit
- [ ] Cost review

---

## 🆘 Contato & Support

- **Documentação**: Veja README.md
- **Issues**: GitHub Issues
- **Vercel Support**: https://vercel.com/help
- **Banco dados**: Consulte provider support

---

**Seu app está ready para produção! 🎉**
