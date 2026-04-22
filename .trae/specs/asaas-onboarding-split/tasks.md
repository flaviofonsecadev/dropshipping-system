# Tasks
- [x] Task 1: Levantar e modelar endpoints oficiais do Asaas necessários
  - [x] Mapear endpoints de: recuperar walletId, criar subconta, criar cobrança com split
  - [x] Definir contratos internos (tipos) e erros tratáveis

- [x] Task 2: Persistência e segurança
  - [x] Criar migração para armazenar dados do Asaas por usuário (supplier/reseller)
  - [x] Implementar criptografia server-side para API keys (env secret)
  - [x] Garantir RLS/segurança para leitura/escrita desses dados

- [x] Task 3: Tela do fornecedor (conta principal)
  - [x] Criar página de configuração do Asaas para supplier (status, conectar, desconectar)
  - [x] Implementar Server Actions para validar API key e salvar walletId

- [x] Task 4: Tela do revendedor (conta própria/subconta)
  - [x] Criar página de configuração do Asaas para reseller com 2 fluxos:
    - [x] Criar subconta via API (inputs obrigatórios, persistir accountId/walletId/apiKey)
    - [x] Conectar conta existente via API key (persistir walletId/apiKey)
  - [x] Implementar Server Actions de criação/validação e mensagens de erro

- [x] Task 5: Checkout com split real
  - [x] Atualizar `/api/checkout/asaas` para:
    - [x] Validar pré-requisitos (supplier e reseller conectados)
    - [x] Criar cobrança no Asaas na conta do revendedor
    - [x] Configurar split para repasse fixo ao fornecedor (custo+envio)
  - [x] Persistir referência da transação (asaasPaymentId) no pedido (se existir tabela) ou retornar ao frontend

- [x] Task 6: Validação
  - [x] Testar fluxo em sandbox com um revendedor e split ativo
  - [x] Rodar `npm run build` e corrigir erros

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2] and [Task 3]
- [Task 5] depends on [Task 2] and [Task 4]
- [Task 6] depends on [Task 5]
