# Tasks

- [x] Task 1: Ajustar banco de dados (Supabase)
  - [x] SubTask 1.1: Criar tabela `products` com campos `base_cost`, `suggested_margin`, peso e dimensões para o Fornecedor.
  - [x] SubTask 1.2: Criar tabela `reseller_products` relacionando Revendedor e Produto, com campo `custom_margin`.
  - [x] SubTask 1.3: Atualizar tabela `orders` para armazenar `base_cost_total`, `reseller_margin_total`, `shipping_cost`, `total_amount` e o `asaas_transaction_id`.

- [x] Task 2: Modificar Interfaces de Produtos
  - [x] SubTask 2.1: Atualizar formulário do Fornecedor (`/supplier/products`) para inputar custo base e margem sugerida.
  - [x] SubTask 2.2: Criar interface para Revendedor (`/reseller/store`) selecionar produtos e ajustar a `custom_margin`.

- [x] Task 3: Integração com Frete e Asaas
  - [x] SubTask 3.1: Criar endpoint no Next.js (API Route) para calcular frete dinâmico com base no CEP do Fornecedor (origem).
  - [x] SubTask 3.2: Criar serviço/lógica de integração Asaas para gerar o split de pagamento (definindo os wallets corretos de destino).
  - [x] SubTask 3.3: Integrar a lógica no Checkout (Total = Custo Base + Margem Personalizada + Frete).

- [x] Task 4: Verificação Final
  - [x] SubTask 4.1: Testar fluxo de ponta a ponta (Produto Criado -> Precificado -> Comprado -> Dividido).

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]