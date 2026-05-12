# Command Policy

## Classification

### SAFE (pode executar sem aprovação)
- Leitura de arquivos
- Navegação em diretórios
- Testes (npm test, npx vitest)
- Lint (npx next lint, npx eslint)
- Type-check (npx tsc --noEmit)
- Prisma generate (npx prisma generate)
- Commits e push
- Build (npm run build)

### MUTATING (requer aprovação humana)
- Deploy para produção (vercel --prod)
- Prisma migrate deploy (produção)
- Mudança em variáveis de ambiente
- Instalação de nova dependência (npm install <package>)
- Geração de migration (npx prisma migrate dev)

### DESTRUCTIVE (requer aprovação humana + rollback plan)
- Prisma migrate reset
- Drop de tabelas ou colunas
- Exclusão de arquivos não versionados
- Reset de banco de dados
- Remoção de secrets

## Execution Rules

1. Sempre verificar a classificação antes de executar
2. Comandos MUTATING e DESTRUCTIVE exigem approval explícito
3. Criar checkpoint antes de comandos MUTATING
4. Documentar rollback plan para DESTRUCTIVE
5. Após execução, atualizar execution-log e context-compact
