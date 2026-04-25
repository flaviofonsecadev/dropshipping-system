# Aba de Pedidos (Sem Mock) Spec

## Why
As páginas de pedidos do fornecedor e do revendedor estão exibindo dados mockados, o que impede validar o fluxo real de vendas e acompanhamento de status.

## What Changes
- Remover listas mockadas das páginas de pedidos do revendedor e do fornecedor.
- Carregar pedidos reais da tabela `public.orders` via Supabase.
- Exibir estados de vazio e erro de carregamento.
- **NÃO** implementar exportação, filtros avançados ou tela de detalhes nesta mudança (apenas listagem funcional).

## Impact
- Affected specs: pedidos, dashboard (revendedor/fornecedor), checkout (dados gravados em `orders`)
- Affected code:
  - `src/app/(dashboard)/reseller/orders/page.tsx`
  - `src/app/(dashboard)/supplier/orders/page.tsx`
  - `public.orders` (leitura)

## ADDED Requirements
### Requirement: Listagem de pedidos do revendedor
O sistema SHALL exibir ao revendedor apenas os pedidos cujo `reseller_id` é o do usuário logado.

#### Scenario: Lista com pedidos
- **WHEN** o revendedor acessa `/reseller/orders`
- **THEN** o sistema lista pedidos ordenados por `created_at` desc
- **AND** exibe `id`, `customer_name`, `created_at`, `payment_method`, `total_amount`, `status`

#### Scenario: Sem pedidos
- **WHEN** não existirem pedidos para o revendedor
- **THEN** o sistema exibe um estado vazio informando que não há pedidos

### Requirement: Listagem de pedidos do fornecedor
O sistema SHALL exibir ao fornecedor todos os pedidos disponíveis para sua role (via políticas RLS existentes).

#### Scenario: Lista com pedidos
- **WHEN** o fornecedor acessa `/supplier/orders`
- **THEN** o sistema lista pedidos ordenados por `created_at` desc
- **AND** exibe `id`, `customer_name`, `created_at`, `payment_method`, `total_amount`, `status`
- **AND** exibe uma coluna de “Revendedor”:
  - Se for possível obter `profiles.full_name`/`profiles.email` do `reseller_id`, mostrar o identificador legível
  - Caso contrário, mostrar o próprio `reseller_id` (fallback)

#### Scenario: Sem pedidos
- **WHEN** não existirem pedidos
- **THEN** o sistema exibe um estado vazio informando que não há pedidos

## MODIFIED Requirements
### Requirement: Remoção de dados mockados em páginas de pedidos
As páginas de pedidos SHALL deixar de utilizar arrays hardcoded e SHALL depender de dados do Supabase.

## REMOVED Requirements
### Requirement: Dados estáticos de demonstração em pedidos
**Reason**: impede validação do produto e mascara problemas de integração/permite inconsistências.
**Migration**: não aplicável (somente remoção de mock).

