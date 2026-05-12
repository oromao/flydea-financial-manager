# Checkpoints

Este diretório armazena checkpoints de segurança antes de executar comandos MUTATING ou DESTRUCTIVE.

## Convention
- Nome do arquivo: `YYYY-MM-DD-HHMMSS-<command-name>.md`
- Conteúdo: descrição da mudança, impacto esperado, rollback plan
- Criar ANTES de executar o comando
- Arquivar ou remover APÓS a execução segura
