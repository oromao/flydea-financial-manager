# 🚀 Setup EasyCron para AI Agents

Você vai configurar **2 cron jobs** no EasyCron para rodar seus agentes e recorrências com frequência customizável.

---

## 📋 Informações que você vai precisar

### Sua CRON_SECRET
```
c378e3deb24979571b785a1cbb940b5db98a0aa3e3e607b1c22716cc53ba6fc6
```

**Guarde isso! Será usada para proteger seus endpoints.**

---

## ✅ PASSO 1: Adicionar CRON_SECRET no Vercel

1. Acesse seu projeto: https://vercel.com/
2. Vá em **Settings → Environment Variables**
3. Clique **Add New**
4. Preencha:
   - **Name**: `CRON_SECRET`
   - **Value**: `c378e3deb24979571b785a1cbb940b5db98a0aa3e3e607b1c22716cc53ba6fc6`
5. Clique **Save**
6. **Redeploy** seu projeto (Settings → Deployments → Redeploy)

---

## ✅ PASSO 2: Criar conta no EasyCron

1. Acesse: https://www.easycron.com
2. Clique **Sign Up** (canto superior direito)
3. Escolha registrar com:
   - Email, ou
   - Google, ou
   - GitHub
4. Confirme email (se escolheu email)
5. **Pronto!** Você já tem acesso ao dashboard

---

## ✅ PASSO 3: Criar Cron Job 1 - Agentes (a cada 5 minutos)

1. No dashboard do EasyCron, clique **Create Cronjob**
2. Preencha os campos:

```
┌─────────────────────────────────────────────────┐
│ Cron Expression:                                │
│ */5 * * * *                                     │
│ (rodar a cada 5 minutos)                        │
├─────────────────────────────────────────────────┤
│ URL to call:                                    │
│ https://seu-site.vercel.app/api/cron/agent-    │
│ scheduler?secret=c378e3deb24979571b785a1cbb9   │
│ 40b5db98a0aa3e3e607b1c22716cc53ba6fc6         │
├─────────────────────────────────────────────────┤
│ Description:                                    │
│ AI Agents Scheduler                             │
├─────────────────────────────────────────────────┤
│ Timezone:                                       │
│ America/Sao_Paulo (South America/Brazil)        │
└─────────────────────────────────────────────────┘
```

3. Clique **Save Cronjob**
4. Você verá: ✅ **Cronjob saved successfully!**

---

## ✅ PASSO 4: Criar Cron Job 2 - Recorrências (todos os dias 6 AM)

1. Clique **Create Cronjob** novamente
2. Preencha:

```
┌─────────────────────────────────────────────────┐
│ Cron Expression:                                │
│ 0 6 * * *                                       │
│ (todos os dias às 6:00 AM)                      │
├─────────────────────────────────────────────────┤
│ URL to call:                                    │
│ https://seu-site.vercel.app/api/cron/          │
│ recurrence?secret=c378e3deb24979571b785a1cbb9  │
│ 40b5db98a0aa3e3e607b1c22716cc53ba6fc6         │
├─────────────────────────────────────────────────┤
│ Description:                                    │
│ Recurrence Processor                            │
├─────────────────────────────────────────────────┤
│ Timezone:                                       │
│ America/Sao_Paulo (South America/Brazil)        │
└─────────────────────────────────────────────────┘
```

3. Clique **Save Cronjob**

---

## 🔗 URLs Prontas (Copie e Cola)

### Job 1 - Agentes (a cada 5 min)
```
https://seu-site.vercel.app/api/cron/agent-scheduler?secret=c378e3deb24979571b785a1cbb940b5db98a0aa3e3e607b1c22716cc53ba6fc6
```

### Job 2 - Recorrências (6 AM diário)
```
https://seu-site.vercel.app/api/cron/recurrence?secret=c378e3deb24979571b785a1cbb940b5db98a0aa3e3e607b1c22716cc53ba6fc6
```

**⚠️ Substitua `seu-site` pela URL real do seu Vercel!**

Exemplo real:
```
https://flydea-financial-manager.vercel.app/api/cron/agent-scheduler?secret=c378e3deb24979571b785a1cbb940b5db98a0aa3e3e607b1c22716cc53ba6fc6
```

---

## ✅ PASSO 5: Testar se está funcionando

1. No EasyCron dashboard, procure seus 2 cron jobs
2. Clique no ícone **"Run Now"** (botão ⚡ ou similar)
3. Verifique se a resposta foi **"success": true**
4. Pronto! ✅

---

## 📊 Dashboard do EasyCron

No dashboard você verá:
- ✅ Seus 2 cron jobs listados
- ✅ Data/hora da próxima execução
- ✅ Histórico de execuções (sucesso/falha)
- ✅ Logs de resposta da API

---

## 🆘 Se algo der errado

### "Connection refused"
- Verifique se a URL está correta
- Confirme que seu site está rodando no Vercel

### "Unauthorized"
- Verifique a CRON_SECRET digitada
- Certifique-se que adicionou no Vercel Environment Variables
- Redeploy seu projeto no Vercel

### "404 Not Found"
- A URL pode estar incompleta
- Verifique se tem `/api/cron/agent-scheduler` correto

---

## 🎯 Pronto!

Agora seus agentes rodam:
- **A cada 5 minutos** ✨ (Agentes IA)
- **Todo dia 6 AM** 🌅 (Recorrências)

Tudo no **plano free** do EasyCron! 🎉

---

**Próximo passo**: Deploy na Vercel e começa a usar!
