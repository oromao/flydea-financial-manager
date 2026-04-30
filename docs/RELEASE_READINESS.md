# FlyDea Financial Manager — Critérios de Release

## Visão Geral

Este documento define os critérios para considerar o projeto "pronto para release". Cada item deve estar verdes antes de fazer deploy para produção.

---

## Critérios Obrigatórios

### 🔴 Build e Qualidade

| Critério | Comando | Threshold |
|----------|---------|-----------|
| TypeScript | `npm run type-check` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| Build | `npm run build` | Success |
| Cobertura | `npm run test:coverage` | ≥ 80% (meta), ≥ 45% (mínimo) |

### 🟡 Bugs Bloqueantes

| Bug ID | Descrição | Status Requerido |
|--------|-----------|------------------|
| E1-T1 | Delete de recorrências não funciona | ✅ Corrigido |
| E1-T2 | Filtro de Contas a Pagar é fake | ✅ Corrigido |
| E1-T3 | CSS glass-card undefined | ✅ Corrigido |
| E1-T4 | CSS --color-muted undefined | ✅ Corrigido |
| E1-T5 | Logs sem paginação | ✅ Corrigido |
| E1-T6 | Aprovações sem role check | ✅ Corrigido |

### 🟢 UX Crítica

| Módulo | Item | Validação |
|--------|------|-----------|
| Mobile | Dialog header sticky | Testar no iPhone 16 (390x844) |
| Mobile | Tabela oculta no mobile | Verificar cards only |
| Mobile | FAB position | Não sobrepõe bottom nav |
| Mobile | Navegação expandida | Sheet com todos módulos |
| Mobile | Dialog swipe-to-close | Gesture funciona |

### 🟡 Funcionalidade Core

| Módulo | Funcionalidade | Teste |
|--------|---------------|-------|
| Transações | CRUD completo | E2E |
| Recorrências | Geração automática | E2E |
| Orçamentos | Alertas 80% | E2E |
| Fechamento | Export (CSV/PDF/XLSX) | E2E |
| Agentes | Criar + Executar | E2E |

---

## Checklist de Pré-Release

### 1. Ambiente
```bash
# Verificar variáveis de ambiente
# DATABASE_URL configurado
# NEXTAUTH_SECRET configurado
# RESEND_API_KEY configurado (ou mock)
# BLOB_READ_WRITE_TOKEN configurado (ou mock)
```

### 2. Banco de Dados
```bash
# Migration aplicada
# npx prisma db push
# Dados seed opcionais
```

### 3. Testes
```bash
# npm run type-check  # Pass
# npm run lint       # Pass
# npm run build      # Pass
# npm run test       # Pass (>80%)
# npm run test:e2e   # Pass (fluxos críticos)
```

### 4. Smoke Tests
```bash
# curl http://localhost:3010     # Homepage OK
# curl http://localhost:3010/api/dashboard  # API OK
```

### 5. Documentação
```bash
# docs/EXECUTION_LOG.md atualizado
# docs/BACKLOG_MASTER.md reflete status atual
# docs/RELEASE_READINESS.md preenchido
```

---

## Processo de Release

### 1. Feature Freeze
- Não aceitar novas features
- Apenas bug fixes e polish

### 2. QA Phase
- Executar checklist completo
- Corrigir blockers P0
- Documentar known issues

### 3. Build Verification
```bash
npm run test:quality
npm run build
```

### 4. Deploy
```bash
git add .
git commit -m "release: vX.Y.Z"
git push origin main
# Vercel auto-deploy
```

### 5. Post-Deploy
- Verificar produção (https://flydea-financial-manager.vercel.app)
- Monitorar erros (Vercel Dashboard)
- Testar flows críticos em prod

---

## Rollback Plan

Se algo quebrar em produção:

1. **Identificar:** Verificar logs em Vercel Dashboard
2. **Avaliar:** É bug ou comportamento esperado?
3. **Se bug crítico:**
   ```bash
   git revert HEAD
   git push origin main
   ```
4. **Se feature quebrou:** Reverter feature specific

---

## Versão Atual

- **Versão:** 0.1.0 (MVP)
- **Release:** Não definido
- **Status do backlog:** 11 P0 pending

---

## Próximos Passos para Release 1.0

1. ✅ Resolver todos E1-T1 a E1-T11 (P0)
2. ✅ Resolver E2-T1 a E2-T10 (P1)
3. ⏳ Subir cobertura para 80%+
4. ⏳ Testes E2E estáveis
5. ⏳ UX polish completo
6. ⏳ Reconciliação bancária (E5-T1)
7. ⏳ LLM Copiloto (E5-T7)

---

*Este documento deve ser atualizado a cada release.*