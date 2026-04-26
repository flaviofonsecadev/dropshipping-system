# Painéis com Dados Reais (Fornecedor e Revendedor) Spec

## Why
As páginas de painel do fornecedor ainda exibem métricas e listas mockadas, e o painel principal do revendedor não mostra os últimos pedidos, reduzindo a utilidade operacional do dashboard.

## What Changes
- Substituir dados mockados no painel principal do fornecedor por métricas e listas reais via Supabase.
- Substituir a lista mockada da página “Parceiros/Revendedores” do fornecedor por dados reais (revendedores/lojas + indicadores básicos).
- No painel principal do revendedor, adicionar lista de últimos pedidos e botão “Ver todos” que leva para `/reseller/orders`.
- Remover placeholders/mocks remanescentes do dashboard (somente onde houver dados hardcoded).

## Impact
- Affected specs: Dashboard (supplier/reseller), Pedidos (resumo), Parceiros/Revendedores (supplier)
- Affected code:
  - `src/app/(dashboard)/supplier/page.tsx`
  - `src/app/(dashboard)/supplier/resellers/page.tsx`
  - `src/app/(dashboard)/reseller/page.tsx`

## ADDED Requirements
### Requirement: Painel do fornecedor com métricas reais
O sistema SHALL exibir no painel principal do fornecedor métricas calculadas a partir de dados reais (Supabase).

#### Scenario: Fornecedor abre o painel
- **WHEN** um usuário com sessão válida e acesso ao dashboard do fornecedor acessar `/supplier`
- **THEN** o painel SHALL renderizar números reais (com fallback seguro para 0/“-” em caso de erro)

### Requirement: Página “Parceiros” do fornecedor com dados reais
O sistema SHALL listar revendedores/parceiros do fornecedor usando dados reais (loja + contato) e indicadores básicos.

#### Scenario: Fornecedor abre parceiros
- **WHEN** o fornecedor acessar `/supplier/resellers`
- **THEN** a tabela SHALL ser preenchida a partir do banco (sem arrays mockados)

### Requirement: Últimos pedidos no painel do revendedor
O sistema SHALL exibir no painel principal do revendedor uma lista com os últimos pedidos e um botão para ir à página completa de pedidos.

#### Scenario: Revendedor abre o painel
- **WHEN** o revendedor acessar `/reseller`
- **THEN** o painel SHALL mostrar os últimos pedidos do revendedor logado e um botão “Ver todos” que navega para `/reseller/orders`

## MODIFIED Requirements
### Requirement: Remoção de dados mockados do dashboard
As páginas alvo SHALL deixar de usar estruturas mockadas para métricas e listagens, usando Supabase como fonte de verdade.

## REMOVED Requirements
### Requirement: Métricas e listas mockadas no painel do fornecedor
**Reason**: Devem refletir a operação real.
**Migration**: Substituir por queries Supabase e agregações em runtime.
