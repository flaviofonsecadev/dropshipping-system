# Tasks
- [x] Task 1: Implementar dados reais no painel principal do fornecedor (`/supplier`)
  - [x] Remover `metrics` mockado e calcular métricas reais a partir de tabelas existentes (ex.: `orders`, `products`, `reseller_stores`).
  - [x] Trocar “Últimos Pedidos” mockado por consulta real (últimos N pedidos), com estado vazio/erro.

- [x] Task 2: Implementar dados reais na página Parceiros/Revendedores do fornecedor (`/supplier/resellers`)
  - [x] Remover array `resellers` mockado e carregar lista real de revendedores/lojas.
  - [x] Popular colunas de contato (nome/email) e status (ex.: publicado/ativo).
  - [x] Adicionar indicadores básicos por revendedor (ex.: total de pedidos e/ou receita) quando possível, com fallback seguro.
  - [x] Tratar estados: carregando/erro/vazio.

- [x] Task 3: Adicionar “Últimos pedidos” no painel principal do revendedor (`/reseller`)
  - [x] Consultar últimos N pedidos do revendedor logado e exibir lista/tabela enxuta.
  - [x] Adicionar botão “Ver todos pedidos” que navega para `/reseller/orders`.
  - [x] Tratar estados: erro/vazio.

- [x] Task 4: Auditoria rápida de mocks no dashboard
  - [x] Garantir que não existam mais arrays hardcoded para métricas/listagens nas rotas do dashboard (supplier/reseller) além do que foi substituído.

- [x] Task 5: Validação
  - [x] Rodar `npm run lint` e `npm run build`.

# Task Dependencies
- [Task 2] depende de [Task 1] (reuso de helpers/formatadores e fonte de dados de pedidos).
- [Task 3] é independente.
- [Task 5] depende de [Task 1], [Task 2], [Task 3] e [Task 4].
