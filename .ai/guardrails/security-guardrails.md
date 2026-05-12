# Security Guardrails

## General
- Nunca commitar secrets, tokens ou variáveis de ambiente
- Sempre usar Prisma prepared statements (nunca raw queries com concatenação)
- Validar todos os inputs com Zod
- CSP headers obrigatórios em produção

## Authentication
- Toda API route (exceto login/public) deve verificar autenticação
- Sessão gerenciada via NextAuth
- Rate limiting em rotas de login e registro

## Data Protection
- Dados financeiros nunca devem ser expostos em logs
- Timezone: UTC no banco, America/Sao_Paulo na UI
- Validação de pertencimento (user só vê seus próprios dados)

## Code Review
- Toda mudança em auth/middleware requer revisão de segurança
- Toda nova dependência externa requer avaliação de segurança
- Scan de dependências vulneráveis no CI
