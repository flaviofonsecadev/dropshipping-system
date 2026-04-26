# Tasks
- [x] Task 1: Implementar carrinho no storefront
  - [x] Adicionar mecanismo de carrinho (estado + persistência por `store_slug`)
  - [x] Atualizar vitrine `/loja/[slug]` para suportar “Adicionar ao carrinho” e indicador de itens
  - [x] Atualizar página de produto para suportar adicionar com quantidade

- [x] Task 2: Criar páginas de carrinho e checkout
  - [x] Criar `/loja/[slug]/carrinho` com listagem de itens, edição de quantidade/remover e estado vazio
  - [x] Criar `/loja/[slug]/checkout` em etapas: dados do cliente + CEP + cálculo/seleção de frete + forma de pagamento
  - [x] Integrar checkout com `POST /api/checkout/shipping` e `POST /api/checkout/asaas` (sem `prompt()`)

- [x] Task 3: Implementar login do cliente na loja
  - [x] Criar rota(s) de “Entrar/Criar conta” no escopo do storefront e suportar redirect `next=/loja/[slug]/checkout`
  - [x] Garantir que cadastros via loja gravem `profiles.role = customer` (migração/ajuste do trigger `handle_new_user`)
  - [x] Implementar logout no storefront

- [x] Task 4: Remover mock do frete
  - [x] Atualizar `POST /api/checkout/shipping` para falhar com 503 quando não houver provedor configurado
  - [x] Ajustar UI do checkout para tratar indisponibilidade do frete e impedir avanço

- [x] Task 5: Validação
  - [x] `npm run lint`
  - [x] `npm run build`

# Task Dependencies
- [Task 2] depende de [Task 1]
- [Task 4] depende de [Task 2]
- [Task 5] depende de [Task 1], [Task 2], [Task 3] e [Task 4]
