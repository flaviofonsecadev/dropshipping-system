# Tasks
- [x] Task 1: Implementar listagem real em `/reseller/orders`
  - [x] Remover array mockado e buscar `orders` via Supabase (RLS do usuário)
  - [x] Renderizar tabela com colunas do spec e tratar estado vazio
  - [x] Manter UI existente (layout/botões) sem implementar exportação

- [x] Task 2: Implementar listagem real em `/supplier/orders`
  - [x] Remover array mockado e buscar `orders` via Supabase (role supplier)
  - [x] Buscar identificador do revendedor (full_name/email) quando possível; fallback para `reseller_id`
  - [x] Renderizar tabela com colunas do spec e tratar estado vazio

- [x] Task 3: Validação
  - [x] `npm run lint`
  - [x] `npm run build`

# Task Dependencies
- [Task 3] depende de [Task 1] e [Task 2]
