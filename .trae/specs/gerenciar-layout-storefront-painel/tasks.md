# Tasks
- [x] Task 1: Modelar preferências do storefront
  - [x] Definir o schema de `storefront_settings` (JSON) e defaults
  - [x] Criar migração no Supabase para adicionar `storefront_settings` em `reseller_stores` (com default seguro)

- [x] Task 2: Expor controles no painel do revendedor
  - [x] Adicionar seção “Layout da Vitrine” em `/reseller/store/settings`
  - [x] Preencher o formulário com defaults (quando ausentes) e valores salvos (quando existentes)
  - [x] Validar limites (quantidades mín/máx) e URL externa (quando selecionada)

- [x] Task 3: Persistir preferências via Server Action
  - [x] Atualizar `upsertResellerStoreAction` para salvar `storefront_settings` junto com os demais campos
  - [x] Garantir compatibilidade para lojas existentes

- [x] Task 4: Aplicar preferências no storefront público
  - [x] Atualizar `/loja/[slug]` para usar `storefront_settings` (topbar, labels, títulos, toggles e quantidades)
  - [x] Atualizar `/loja/[slug]/produto/[productId]` para usar `storefront_settings` (topbar/header e labels)
  - [x] Preservar o comportamento de busca `?q=` e navegação

- [x] Task 5: Validação
  - [x] Verificar que salvar no painel reflete na loja pública
  - [x] Conferir desktop e smartphone (pelo menos 2 breakpoints) sem overflow
  - [x] Rodar `npm run build` e corrigir erros

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1] and [Task 2]
- [Task 4] depends on [Task 1] and [Task 3]
- [Task 5] depends on [Task 2] and [Task 4]
