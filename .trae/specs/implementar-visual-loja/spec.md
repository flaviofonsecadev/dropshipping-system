# Implementar Funcionalidades da Tela “Visual da Loja” Spec

## Why
A tela `/reseller/settings/visual` atualmente é apenas um mock (inputs e botões sem persistência). O revendedor precisa conseguir configurar de verdade os blocos visuais e SEO da vitrine e ver isso refletido na loja pública.

## What Changes
- Persistir configurações visuais e SEO da loja em `reseller_stores`.
- Tornar a tela **Visual da Loja** funcional: carregar dados salvos, permitir editar, validar e salvar.
- Refletir as configurações no storefront público:
  - `/loja/[slug]` (Hero Slider, banners promocionais, títulos/quantidades das seções, SEO)
  - `/loja/[slug]/produto/[productId]` (SEO e consistência de header/topbar quando aplicável)

## Impact
- Affected specs: storefront público, configuração de loja do revendedor
- Affected code:
  - `src/app/(dashboard)/reseller/settings/visual/*`
  - `src/app/loja/[slug]/*` e `src/app/loja/[slug]/produto/[productId]/*`
  - `supabase/migrations/*` (alteração em `reseller_stores`)
- Affected data:
  - `reseller_stores.visual_settings` (novo campo JSON)
  - `reseller_stores.storefront_settings` (já existente; usado também para títulos/quantidades de seções)

## ADDED Requirements
### Requirement: Persistência de Visual/SEO
O sistema SHALL armazenar as configurações da tela “Visual da Loja” em `reseller_stores.visual_settings` (JSON), com defaults seguros quando ausentes.

#### Scenario: Loja antiga sem visual_settings (sucesso)
- **WHEN** o revendedor acessa `/reseller/settings/visual` ou o cliente acessa `/loja/[slug]`
- **THEN** o sistema usa valores padrão (sem erros) e permite salvar novas configurações.

### Requirement: Hero Slider configurável
O sistema SHALL permitir ao revendedor gerenciar um Hero Slider para a página inicial da loja.
- Cada banner SHALL conter: `image_url` (obrigatório), `link_url` (opcional), `title` (opcional), `enabled` (boolean) e `order` (número).
- O revendedor SHALL conseguir: adicionar, editar, remover e reordenar banners.
- O sistema SHALL impor limites:
  - máximo 8 banners
  - aceitar upload no bucket existente `store-branding` **ou** URL externa

#### Scenario: Exibir hero no storefront (sucesso)
- **WHEN** existe ao menos 1 banner habilitado
- **THEN** `/loja/[slug]` exibe o hero (slider/carrossel simples) no topo; caso contrário, usa o `banner_url` existente como fallback.

### Requirement: Banners promocionais configuráveis
O sistema SHALL permitir configurar banners promocionais (secundários) exibidos entre seções.
- Itens com: `image_url` (obrigatório), `link_url` (opcional), `enabled`, `order`.
- Limite: máximo 8 banners.

#### Scenario: Exibir banners promocionais (sucesso)
- **WHEN** existem banners promocionais habilitados
- **THEN** `/loja/[slug]` exibe esses banners entre as seções de produtos (ex: após “LANÇAMENTOS”).

### Requirement: Configuração de seções do grid (títulos e quantidades)
O sistema SHALL permitir editar, na tela “Visual da Loja”, os títulos e quantidades das seções exibidas na home.
- Campos: `launches_title`, `launches_count`, `best_sellers_enabled`, `best_sellers_title`, `best_sellers_count`.
- Essas preferências SHALL ser persistidas em `reseller_stores.storefront_settings.sections` sem apagar outras chaves existentes em `storefront_settings`.

#### Scenario: Editar seção e refletir (sucesso)
- **WHEN** o revendedor altera os títulos/quantidades e salva
- **THEN** `/loja/[slug]` usa os novos valores.

### Requirement: SEO configurável por loja
O sistema SHALL permitir configurar SEO básico para a página inicial da loja:
- `meta_title` (string)
- `meta_description` (string)
- `meta_keywords` (string)
- `google_analytics_id` (string; apenas persistir por enquanto)

#### Scenario: SEO aplicado (sucesso)
- **WHEN** o cliente acessa `/loja/[slug]`
- **THEN** a página usa `meta_title` e `meta_description` na metadata (com fallback ao nome/headline da loja quando vazio).

## MODIFIED Requirements
### Requirement: Atualização parcial de settings
O sistema SHALL realizar atualização parcial de JSON ao salvar:
- ao salvar `storefront_settings.sections` pela tela “Visual da Loja”, não deve sobrescrever outras chaves (`topbar`, `product_card`, etc).

## REMOVED Requirements
### Requirement: Tela mock sem persistência
**Reason**: Revendedor precisa gerenciar visual e SEO de forma real.
**Migration**: Introduzir `visual_settings` e actions de salvar/carregar.

