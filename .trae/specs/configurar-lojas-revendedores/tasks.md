# Tasks
- [x] Task 1: Modelagem no Supabase
  - [x] SubTask 1.1: Criar tabela `reseller_stores` (1:1 com reseller) com campos: `reseller_id`, `slug`, `name`, `is_published`, `logo_url`, `banner_url`, `primary_color`, `accent_color`, `headline`, `about`, `created_at`, `updated_at`.
  - [x] SubTask 1.2: Criar índices/constraints (slug único; reseller_id único).
  - [x] SubTask 1.3: Criar políticas RLS: revendedor pode CRUD apenas sua loja; leitura pública apenas quando `is_published = true` (por slug).
  - [x] SubTask 1.4: Criar bucket de storage `store-branding` (público) e políticas: upload apenas reseller/admin; leitura pública por URL.

- [x] Task 2: Tela de Configuração da Loja (Painel do Revendedor)
  - [x] SubTask 2.1: Criar rota `/reseller/store/settings` com formulário de nome/slug/branding.
  - [x] SubTask 2.2: Implementar validações: slug obrigatório, normalização para kebab-case, checagem de unicidade.
  - [x] SubTask 2.3: Implementar upload opcional de logo/banner (ou URL externa), com limites no frontend.
  - [x] SubTask 2.4: Implementar botão “Publicar/Despublicar” e exibir URL pública da loja.

- [x] Task 3: Gestão de Catálogo da Loja (Ativar/Desativar)
  - [x] SubTask 3.1: Criar tela `/reseller/store/catalog` listando produtos disponíveis com toggle `is_active`.
  - [x] SubTask 3.2: Permitir definir `custom_margin` e mostrar cálculo do preço final (custo + margem).
  - [x] SubTask 3.3: Persistir em `reseller_products` (create/update) via Server Actions.

- [x] Task 4: Vitrine Pública (Storefront por Slug)
  - [x] SubTask 4.1: Criar rota pública `/loja/[slug]` com dados de `reseller_stores` e produtos ativos.
  - [x] SubTask 4.2: Criar rota pública `/loja/[slug]/produto/[productId]` com detalhes e mídia (imagens e vídeo se houver).
  - [x] SubTask 4.3: Calcular preço exibido como `base_cost + custom_margin`, com fallback (se não houver custom_margin, usar `suggested_margin`).
  - [x] SubTask 4.4: Bloquear acesso público a lojas não publicadas (404).

- [x] Task 5: Integração com Checkout (Preparação)
  - [x] SubTask 5.1: No storefront, criar botão “Comprar” que cria um payload com: `reseller_id`, `store_slug`, `items`, `shipping_address` (stub).
  - [x] SubTask 5.2: Encaminhar para o endpoint de checkout existente (ou stub) mantendo compatibilidade com a futura integração Asaas Split.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1]
- [Task 5] depends on [Task 4]
