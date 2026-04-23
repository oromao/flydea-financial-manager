# ✅ Deployment Checklist - Flydea Financial Manager

Use este checklist antes de fazer deploy para produção.

---

## 🔍 PRÉ-DEPLOYMENT

### Código
- [ ] Todos testes passando: `npm run test`
- [ ] Build sem erros: `npm run build`
- [ ] Type check limpo: `npm run type-check`
- [ ] Sem `console.log()` desnecessários
- [ ] Sem variáveis hardcoded
- [ ] Todos os imports corretos
- [ ] README atualizado

### Git
- [ ] Todas mudanças commitadas
- [ ] Branch atualizada com main
- [ ] Nenhum arquivo não-rastreado que deva ser commitado
- [ ] Commit messages claras e descritivas

---

## 🗄️ DATABASE

### Setup Local
```bash
# [ ] Database rodando em localhost
# [ ] DATABASE_URL configurada
# [ ] Migrations aplicadas
npx prisma generate
npx prisma db push
```

### Preparar para Production
```bash
# [ ] Escolher provedor:
#     - Supabase (recomendado)
#     - Railway
#     - NeonDB
#     - AWS RDS

# [ ] Criar novo database em produção
# [ ] Copiar DATABASE_URL
# [ ] Testar conexão localmente
npx prisma db push --skip-generate
```

---

## 🔐 Environment Variables

### Gerar Secrets
```bash
# NEXTAUTH_SECRET
# [ ] Gerar: openssl rand -hex 32
# [ ] Mínimo 32 caracteres

# CRON_SECRET
# [ ] Gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# [ ] Salvar em local seguro
```

### Configurar Variáveis

- [ ] `DATABASE_URL` - Seu database em produção
- [ ] `NEXTAUTH_SECRET` - Secret aleatória
- [ ] `NEXTAUTH_URL` - https://seu-dominio.com
- [ ] `RESEND_API_KEY` - Sua chave Resend
- [ ] `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob
- [ ] `CRON_SECRET` - Secret aleatória para cron

### Adicionar ao Vercel
```bash
# No Vercel Dashboard:
# [ ] Settings → Environment Variables
# [ ] Adicionar todas as 6 variáveis acima
# [ ] Confirmar que rodas estão verdes
```

---

## 🚀 VERCEL SETUP

### Criar Projeto
- [ ] Conta Vercel criada
- [ ] Projeto criado
- [ ] GitHub conectado
- [ ] Domain apontado (se tiver)

### Configurar Build
- [ ] Framework: Next.js
- [ ] Build Command: `npx prisma generate && npx prisma db push && next build`
- [ ] Install Command: `npm install`
- [ ] Output Directory: `.next`

### Cron Jobs
- [ ] Verificar `vercel.json`:
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
- [ ] Arquivo está committed

---

## 🧪 TESTES ANTES DE DEPLOY

### Build Local
```bash
# [ ] Build sem erros
npm run build

# [ ] Preview local
npm run start
# Abrir http://localhost:3010
```

### Verificar Funcionalidades
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Copiloto inteligente responde
- [ ] Agentes criam/deletam
- [ ] OCR processa comprovantes
- [ ] Email está configurado

### Verificar Segurança
- [ ] Nenhuma secret em arquivos
- [ ] `.env.local` em .gitignore
- [ ] NEXTAUTH_URL correto
- [ ] CRON_SECRET protegido

---

## 📤 DEPLOY

### Vercel Auto-Deploy
```bash
# [ ] Fazer push para main
git push origin main

# [ ] Vercel detecta e faz deploy
# [ ] Esperar Build → Deploy → Deployment
# [ ] Verificar logs se tiver erro
```

### Pós-Deploy
- [ ] Acesso https://seu-dominio.com funciona
- [ ] Páginas carregam
- [ ] Copiloto responde
- [ ] Agentes criam
- [ ] Sem erros na console

---

## 🔍 VERIFI AÇÃO PÓS-DEPLOY

### Funcionalidades Principais
- [ ] Dashboard: Transações/Saldos visíveis
- [ ] Copiloto: Botão Brain azul responde
- [ ] Agentes: Consegue criar novo agente
- [ ] OCR: Consegue fazer upload de documento
- [ ] Email: Configurado e testado

### Monitoramento
- [ ] Vercel Logs: Sem erros críticos
- [ ] Database: Consegue conectar
- [ ] Cron Job: Executa às 9 AM
- [ ] Uptime: Responde em < 2s

### Logging
```bash
# Ver logs em tempo real
vercel logs seu-projeto --follow

# Ver últimos logs
vercel logs seu-projeto
```

---

## 🆘 TROUBLESHOOTING

### Build Falhou
```bash
# [ ] Verificar build logs
vercel logs seu-projeto

# [ ] Teste localmente
npm run build

# [ ] Rollback se necessário
vercel rollback
```

### Database Erro
```bash
# [ ] Verificar DATABASE_URL
echo $DATABASE_URL

# [ ] Testar conexão
npx prisma db execute --stdin
SELECT 1;

# [ ] Se tiver erro, re-criar database
```

### Cron Job Não Executa
```bash
# [ ] Verificar vercel.json
cat vercel.json

# [ ] Testar manualmente
curl "https://seu-site/api/cron/agent-scheduler?secret=CRON_SECRET"

# [ ] Ver histórico
# No Vercel Dashboard → Cron Jobs
```

### Copiloto Não Responde
```bash
# [ ] Verificar /api/rag/local-query endpoint
# [ ] Verificar banco de dados
# [ ] Verificar logs
vercel logs
```

---

## 📊 PÓS-DEPLOY CHECKLIST

### Dia 1
- [ ] Cron job executou sem erros
- [ ] Agentes foram processados
- [ ] Nenhum alert/error
- [ ] Performance OK (< 2s)

### Semana 1
- [ ] Monitore uso de CPU/Memory
- [ ] Database connections OK
- [ ] Sem memory leaks
- [ ] Backups funcionando

### Mês 1
- [ ] Todos features testados
- [ ] Performance estável
- [ ] Usuários usando
- [ ] Zero crashes

---

## 🎯 QUANDO TUDO ESTÁ OK

### Sinais de Sucesso
✅ App respondendo rápido (< 2s)
✅ Cron executando todos os dias
✅ Agentes processando
✅ Sem erros em produção
✅ Usuários conseguem fazer login
✅ Copiloto respondendo
✅ OCR funcionando
✅ Emails sendo enviados

---

## 📞 SUPORTE EM PRODUÇÃO

Se algo der errado:

1. **Verificar logs**
   ```bash
   vercel logs seu-projeto --follow
   ```

2. **Testar endpoint**
   ```bash
   curl -X GET "https://seu-site/api/health"
   ```

3. **Rollback**
   ```bash
   vercel rollback
   ```

4. **Resetar database** (último recurso)
   ```bash
   npx prisma db push --force-reset
   ```

---

## ✨ Parabéns!

Seu Flydea Financial Manager está em produção! 🎉

**Próximos passos:**
- Monitorar em produção
- Coletar feedback dos usuários
- Iterar e melhorar
- Adicionar mais features

---

**Deployment Date**: ____________
**Deployed By**: ____________
**Notes**: ____________

---

Made with ❤️ using Next.js + Vercel
