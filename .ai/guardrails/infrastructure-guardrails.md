# Infrastructure Guardrails

## Deploy
- Deploy automático via Vercel ao mergear na main
- Nunca fazer deploy manual sem passar pelo CI
- Verificar variáveis de ambiente antes do deploy
- Monitorar erros nas primeiras 24h pós-deploy

## Services
- Neon: evitar queries sem index, monitorar conexões simultâneas
- Upstash: rate limiting em todas as API routes públicas
- Vercel Blob: limpar arquivos órfãos periodicamente
- Resend: templates de email versionados

## Environment
- `gru1` (São Paulo) como região primária
- Secrets no Vercel Dashboard, nunca no repositório
- Múltiplos ambientes: preview (PR) + production
- Logs de erro acessíveis via Vercel Dashboard

## Cron Jobs
- `vercel.json` define os cron jobs
- Agent scheduler roda diariamente às 9AM BRT
- Monitorar falhas de execução de cron
