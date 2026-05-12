# Security Guardrails

> Versão: 2.0 — 2026-05-12
> Atualizado conforme auditoria de segurança do projeto FlyDea Financial Manager.

---

## 1. Princípios Gerais

- **Nunca** commitar secrets, tokens, variáveis de ambiente ou dados reais de produção
- **Nunca** expor PII ( Personally Identifiable Information) ou dados financeiros em logs, errors ou responses
- **Nunca** usar raw queries SQL com concatenação — sempre usar Prisma prepared statements
- **Sempre** validar inputs com Zod em todas as API routes (POST/PUT/PATCH/DELETE)
- **Sempre** verificar ownership — usuário só pode acessar/alterar seus próprios dados
- **Sempre** seguir o princípio do menor privilégio

---

## 2. Autenticação & Sessão

- Toda API route protegida (exceto login, register, public webhooks) deve verificar sessão via NextAuth
- Sessão expira em **30 minutos** de inatividade (configurar no NextAuth `maxAge`)
- Refresh token flow para sessões estendidas (se implementado)
- Rotas de login/register devem ter **rate limiting** obrigatório (Upstash Redis)
- Após N tentativas falhas (5), bloquear por 15 minutos
- Logout deve invalidar a sessão imediatamente

### Configuração de Session Timeout

```typescript
// Em src/lib/auth.ts ou pages/api/auth/[...nextauth].ts
maxAge: 30 * 60, // 30 minutos
updateAge: 5 * 60, // 5 minutos para refresh
```

---

## 3. Content Security Policy (CSP)

O CSP já está configurado em `next.config.ts`. **Manter e nunca relaxar sem aprovação de segurança.**

Diretivas atuais:
- `default-src 'self'`
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` — necessário para Next.js
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
- `img-src 'self' blob: data: https:`
- `font-src 'self' data: https://fonts.gstatic.com`
- `connect-src 'self' https: https://fonts.googleapis.com https://fonts.gstatic.com`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`
- `upgrade-insecure-requests`

**AVISO:** Atualmente `script-src` contém `'unsafe-eval'` — necessário para o Next.js em dev. Em produção, remover `'unsafe-eval'` se possível.

---

## 4. Headers de Segurança (Obrigatórios)

Já configurados em `next.config.ts`. Verificar sempre que adicionar nova rota:

| Header | Valor | Status |
|--------|-------|--------|
| `Content-Security-Policy` | (vide seção 3) | ✅ OK |
| `X-Content-Type-Options` | `nosniff` | ✅ OK |
| `X-Frame-Options` | `DENY` | ✅ OK |
| `X-XSS-Protection` | `1; mode=block` | ✅ OK |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ OK |
| `Strict-Transport-Security` | **NÃO CONFIGURADO** | ❌ Missing |
| `Permissions-Policy` | **NÃO CONFIGURADO** | ❌ Missing |

### Recommended Additions

Adicionar em `next.config.ts`:

```typescript
{
  key: "Strict-Transport-Security",
  value: "max-age=63072000; includeSubDomains; preload",
},
{
  key: "Permissions-Policy",
  value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
},
```

---

## 5. Rate Limiting (Obrigatório)

Já implementado em `src/lib/rate-limit.ts` com Upstash Redis.

**Onde aplicar:**
- Login/Register: limite rigoroso (5 req/60s por IP)
- API routes POST/PUT/PATCH: 10 req/60s por usuário
- API routes GET (listagens): 30 req/60s por usuário
- Webhooks: liberado (validar assinatura via secret compartilhado)

**Sempre retornar headers:**
- `Retry-After`
- `X-RateLimit-Remaining`

---

## 6. LGPD & Proteção de Dados (Brasil)

Esta aplicação lida com dados financeiros de usuários brasileiros. Aplicam-se as seguintes regras:

- **Dados pessoais**: nome, email, CPF/CNPJ (se coletado), data de nascimento
- **Dados sensíveis**: transações financeiras, saldos, categorias de gasto
- **Finalidade**: única e exclusivamente para funcionamento do sistema financeiro pessoal
- **Retenção**: manter dados enquanto a conta estiver ativa + 180 dias após exclusão
- **Exclusão**: direito do usuário solicitar exclusão total dos dados (art. 18 LGPD)
- **Anonimização**: relatórios internos devem usar dados agregados/anônimos
- **Consentimento**: coletar consentimento explícito para qualquer uso além do essencial

### Implementação na prática

1. Endpoint de exportação de dados pessoais (art. 9 LGPD) — `GET /api/user/data-export`
2. Endpoint de exclusão de conta completa — `DELETE /api/user/account`
3. Logs nunca devem conter: nome completo, email, CPF, valores exatos de transações
4. Relatórios de uso: agregar por mês/categoria, nunca por usuário individual

---

## 7. XSS Prevention

- React já escapa output por padrão — **não usar `dangerouslySetInnerHTML`** sem validação
- CSP ajuda a mitigar XSS
- Validar e sanitizar qualquer input que seja renderizado (especialmente em relatórios e labels)
- Se precisar renderizar rich text, usar biblioteca sanitizante (DOMPurify)

---

## 8. CSRF Protection

- NextAuth já inclui proteção CSRF para rotas de autenticação
- Para API routes customizadas: usar token CSRF do NextAuth ou SameSite cookies
- Cookie config: `SameSite=Lax` (padrão NextAuth)
- Verificar header `Origin` ou `Referer` em mutações sensíveis

---

## 9. SQL Injection

- **Proibido** usar `prisma.$queryRawUnsafe` ou `prisma.$executeRawUnsafe`
- Sempre usar Prisma queries tipadas (findFirst, findMany, create, update, etc.)
- Se precisar de raw queries, usar `prisma.$queryRaw` com template string — a Prisma sanitiza
- Não concatenar inputs do usuário em queries

---

## 10. Hardcoded Secrets — Proibido

- **Nunca** colocar API keys, tokens, senhas ou URLs de produção no código
- Usar `process.env.*` sempre
- .env.local.example deve conter apenas placeholders
- Revisar commits para secrets antes de push (`git secrets` ou `talisman` recomendado)

---

## 11. File Upload & Blob Storage

- Validar tipo de arquivo antes de upload (MIME type + extensão)
- Limitar tamanho máximo (ex: 10MB para comprovantes)
- Usar URLs pré-assinadas do Vercel Blob com expiração
- Nunca confiar em `content-type` do client — verificar no servidor
- Scannear arquivos para malware (se possível)

---

## 12. Cron & Background Jobs

- Rotas cron protegidas por `CRON_SECRET` (header `Authorization: Bearer <CRON_SECRET>`)
- Jobs não devem expor dados de usuários em logs
- Timeout máximo por job: 60 segundos (configurável)

---

## 13. Dependências

- Manter dependências atualizadas com `npm audit` regular
- CI deve rodar `npm audit` ou similar (Dependabot recomendado)
- Toda nova dependência requer avaliação: origem, manutenção, licença, vulnerabilidades conhecidas

---

## 14. Auditoria de Segurança Atual (2026-05-12)

| Item | Status | Notas |
|------|--------|-------|
| CSP headers | ✅ Configurado | `next.config.ts` |
| Security headers (XSS, CTO, XFO, Referrer) | ✅ Configurado | `next.config.ts` |
| HSTS | ❌ Missing | Precisa adicionar |
| Permissions-Policy | ❌ Missing | Precisa adicionar |
| CSP script-src unsafe-eval | ⚠️ Em dev | Verificar se necessário em prod |
| Rate limiting | ✅ Implementado | `src/lib/rate-limit.ts` |
| Auth middleware | ✅ Implementado | `src/middleware.ts` |
| Zod validation | ✅ Em andamento | `src/lib/api-helpers.ts` |
| CSRF | ✅ Via NextAuth | Padrão |
| SQL injection | ✅ Prisma sanitiza | Exceto raw queries |
| LGPD compliance | ⚠️ Parcial | Precisa: data-export, delete account endpoints |
| Session timeout | ❌ Não configurado | Precisa configurar `maxAge` no NextAuth |
| Log sem PII | ⚠️ Parcial | logger.ts não filtra PII |
| Dependency scanning | ❌ Não configurado | Adicionar `npm audit` no CI |
| File upload validation | ⚠️ Não verificado | Verificar Vercel Blob validation |

---

## 15. Checklist de Code Review

- [ ] Secrets sendo commitados?
- [ ] Input validado com Zod?
- [ ] Sessão verificada (se rota protegida)?
- [ ] Ownership verificado (userId match)?
- [ ] Rate limit aplicado?
- [ ] Dados financeiros expostos em log/response?
- [ ] CSP violado (script/style externo)?
- [ ] Raw query SQL com concatenação?
- [ ] CORS muito permissivo?
- [ ] Cookie seguro (SameSite, HttpOnly)?
