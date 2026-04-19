# Gerenciar Layout do Storefront no Painel Spec

## Why
O storefront público foi alinhado ao modelo de e-commerce (referência Panos Brasil), mas hoje essas escolhas (textos, seções e quantidade de produtos) estão fixas no código. O revendedor precisa conseguir ajustar esses detalhes no painel de configurações da loja sem alterar código.

## What Changes
- Adicionar um bloco de configurações de “Layout da Vitrine” no painel do revendedor em `/reseller/store/settings`.
- Persistir preferências de layout em `reseller_stores` para que o storefront use esses valores dinamicamente.
- Aplicar as preferências na vitrine pública:
  - `/loja/[slug]` (topbar, header, seções, labels e quantidades)
  - `/loja/[slug]/produto/[productId]` (topbar/header e labels)

## Impact
- Affected specs: storefront público, configuração de loja do revendedor
- Affected code: painel `/reseller/store/settings`, Server Action `upsertResellerStoreAction`, páginas públicas do storefront
- Affected data: tabela `reseller_stores` (novo campo para preferências do storefront)

## ADDED Requirements
### Requirement: Persistência de preferências do storefront
O sistema SHALL armazenar preferências do storefront por loja do revendedor em `reseller_stores.storefront_settings` (JSON), com valores padrão aplicados quando ausentes.

#### Scenario: Loja existente sem preferências (sucesso)
- **WHEN** uma loja já existente (sem `storefront_settings`) é aberta no painel e/ou exibida no storefront
- **THEN** o sistema deve aplicar valores padrão de layout sem quebrar a página.

### Requirement: Controles no painel “Layout da Vitrine”
O sistema SHALL permitir configurar, no painel do revendedor, as seguintes preferências:
- Topbar:
  - habilitar/desabilitar exibição
  - texto da mensagem (ex: “Entrega em todo o Brasil • Compre com segurança”)
  - labels de links (“Home” e “Fale conosco”)
  - destino do “Fale conosco”: **âncora** (`#contato`) ou **URL externa**
- Seções e vitrine:
  - título da seção “LANÇAMENTOS”
  - título da seção “MAIS VENDIDOS”
  - quantidade de produtos em “LANÇAMENTOS”
  - habilitar/desabilitar “MAIS VENDIDOS”
  - quantidade de produtos em “MAIS VENDIDOS”
- Card do produto:
  - habilitar/desabilitar a linha de tamanhos (ex: “P M G GG”)
  - texto da linha de tamanhos
  - label do CTA “Olhar”
  - label do CTA “Comprar”

#### Scenario: Salvar preferências no painel (sucesso)
- **WHEN** o revendedor altera os campos em “Layout da Vitrine” e salva
- **THEN** as preferências são persistidas na loja e refletidas em `/loja/[slug]`.

### Requirement: Busca e querystring preservadas
O sistema SHALL manter o filtro de busca do storefront (`?q=`) funcionando e não deve quebrar a navegação, mesmo com preferências de layout customizadas.

#### Scenario: Busca com layout customizado (sucesso)
- **WHEN** o visitante busca um termo com `?q=...`
- **THEN** o storefront deve filtrar por nome ou SKU e manter topbar/header conforme configurado.

## MODIFIED Requirements
### Requirement: Branding e conteúdo público existente
O sistema SHALL continuar usando `logo_url`, `banner_url`, `name`, `headline`, `about`, `primary_color` e `accent_color`, e SHALL combinar isso com `storefront_settings` (preferências de layout).

## REMOVED Requirements
### Requirement: Labels e quantidades fixas no código do storefront
**Reason**: O revendedor deve gerenciar títulos/labels e quantidades via painel.
**Migration**: Introduzir `storefront_settings` com defaults e atualizar o storefront para usar esses valores.

