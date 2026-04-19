# Tasks
- [x] Task 1: Modelagem e persistência no Supabase
  - [x] Criar migration adicionando `visual_settings jsonb not null default '{}'` em `reseller_stores`
  - [x] Definir schema/normalização de `visual_settings` (defaults, limites e validações)

- [x] Task 2: Tornar `/reseller/settings/visual` funcional
  - [x] Converter page para carregar dados reais da loja do revendedor (server) e passar para um form client
  - [x] Implementar salvar via Server Action (visual_settings + atualização parcial de `storefront_settings.sections`)
  - [x] Implementar UI para:
    - [x] Hero Slider (CRUD + reorder simples + enable/disable)
    - [x] Banners promocionais (CRUD + reorder + enable/disable)
    - [x] Seções (títulos/quantidades/toggle)
    - [x] SEO (meta title/description/keywords/GA id)

- [x] Task 3: Refletir no storefront público
  - [x] `/loja/[slug]`: renderizar hero slider (ou fallback `banner_url`), banners promocionais e títulos/quantidades
  - [x] `/loja/[slug]`: aplicar metadata (title/description) via `generateMetadata`
  - [x] `/loja/[slug]/produto/[productId]`: manter consistência (metadata mínima e header/topbar quando aplicável)

- [x] Task 4: Validação
  - [x] Verificar que salvar no painel atualiza imediatamente a loja pública
  - [x] Conferir desktop e smartphone (pelo menos 2 breakpoints) sem overflow
  - [x] Rodar `npm run build` e corrigir erros

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1] and [Task 2]
- [Task 4] depends on [Task 2] and [Task 3]
