# Flydea Financial Manager — Current Risks

## P0 — Críticos (Bloqueadores)
- 11 bugs críticos abertos (E1-T1 a E1-T11)
  - Impacto: experiência do usuário comprometida, possível perda de dados
- Cobertura de testes em 45.87% (target: 90%)
  - Impacto: regressões em deploy, confiança reduzida
- 87 gaps de UX documentados
  - Impacto: abandono de usuário, percepção de baixa qualidade

## P1 — Alto
- Recorrências com delete quebrado
- Importação de parcelamentos com falha
- Performance mobile em pages com muitas transações
- CSS `glass-card`/`muted` undefined em alguns componentes

## P2 — Médio
- Documentação de API parcial
- Falta de testes E2E para fluxos críticos (login, transação, fechamento)
- Dependência de serviços externos (Vercel, Neon, Upstash, Resend)

## Mitigações Ativas
- Backlog priorizado com P0 blockers à frente
- QA checklist com 87 gaps mapeados
- Mocks para OCR, Blob, PicoClaw nos testes
- Rate limiting em APIs sensíveis
- CSP e security headers configurados
