# Human Approval Policy

## When Approval Is Required

Approvação humana explícita é necessária antes de:

### MUTATING_INFRASTRUCTURE
- Deploy para produção
- Mudança em variáveis de ambiente em produção
- Alteração em secrets ou credenciais
- Migração de banco de dados em produção
- Mudança em planos de serviços (Vercel, Neon, Upstash)

### DESTRUCTIVE
- Remoção de dados de produção
- Rollback de migração de banco
- Exclusão de recursos de infraestrutura
- Reset de banco de dados

### SECURITY
- Mudança em regras de autenticação
- Alteração em CSP ou security headers
- Exposição de nova API route pública
- Mudança em política de rate limiting

## Approval Process

1. Agent cria checkpoint em `.ai/checkpoints/`
2. Agent descreve a mudança, impacto e rollback plan
3. Humano revisa e aprova/rejeita
4. Se aprovado, agent executa e documenta
5. Se rejeitado, agent arquiva e registra no execution-log

## Emergency Override
Em caso de incidente de segurança ou perda de dados, o humano pode autorizar execução emergencial com rollback imediato.
