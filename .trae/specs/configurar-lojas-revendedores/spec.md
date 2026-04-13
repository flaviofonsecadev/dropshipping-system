# Lojas Virtuais dos Revendedores Spec

## Why
Revendedores precisam ter uma vitrine online própria para vender ao cliente final, com identidade visual e catálogo selecionado, sem depender de intervenção do fornecedor.

## What Changes
- Criar modelo de dados para **loja do revendedor** (slug público, nome, status, branding e configurações).
- Implementar telas no painel do revendedor para **criar/configurar/publicar** sua loja.
- Implementar vitrine pública por URL (primeira fase com **rota por slug**), com listagem e detalhes de produtos.
- Conectar produtos ativos do revendedor (tabela `reseller_products`) ao catálogo público, calculando preço final com base em `products.base_cost + reseller_products.custom_margin`.
- Upload opcional de logo/banner no Supabase Storage, com alternativa de colar URL externa.

## Impact
- Affected specs: `catalogo-produtos-midia`, `precificacao-split-asaas`
- Affected code:
  - `supabase/migrations/` (novas tabelas/colunas/políticas)
  - `src/app/(dashboard)/reseller/` (configuração e preview)
  - `src/app/(storefront)/` ou `src/app/store/` (rotas públicas por slug)

## ADDED Requirements
### Requirement: Criação e Configuração da Loja
O sistema DEVE permitir que um revendedor crie e configure uma loja virtual.
- O revendedor DEVE definir um **nome** e um **slug** único (ex: `loja-da-maria`).
- O revendedor PODE definir **logo**, **banner**, **cores** e **texto de apresentação**.
- O revendedor DEVE conseguir **publicar** e **despublicar** a loja.

#### Scenario: Criar loja e publicar
- **WHEN** revendedor salva nome/slug e marca como publicada.
- **THEN** a loja fica acessível publicamente em `/loja/{slug}`.

### Requirement: Catálogo Público por Produtos Ativos
O catálogo público DEVE exibir apenas produtos **ativos** do revendedor.
- Um produto é considerado ativo quando existir um registro em `reseller_products` com `is_active = true`.
- O preço exibido ao cliente final DEVE ser calculado como: `base_cost + custom_margin`.
- A loja pública DEVE exibir a capa do produto como `products.images[0]` quando existir.

#### Scenario: Produto ativo aparece na loja
- **WHEN** revendedor ativa um produto e define sua margem.
- **THEN** o produto aparece em `/loja/{slug}` com preço final calculado.

### Requirement: Upload e Links (Branding)
O sistema DEVE suportar branding via:
- **Upload no Supabase Storage** (logo e banner), com limites de tamanho no frontend.
- **Links externos** (URL de imagem) como alternativa para evitar consumo de banda/armazenamento.

## MODIFIED Requirements
### Requirement: Experiência do Revendedor
O painel do revendedor DEVE incluir uma área de “Loja” para:
- Ajustar visual/branding.
- Definir quais produtos entram na loja (ativar/desativar).
- Visualizar um preview/URL pública.

## REMOVED Requirements
### Requirement: Nenhuma
**Reason**: N/A
