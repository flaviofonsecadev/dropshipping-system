# Tasks
- [x] Task 1: Configuração do Supabase
  - [x] SubTask 1.1: Instalar dependências (`@supabase/supabase-js` e `@supabase/ssr`).
  - [x] SubTask 1.2: Criar arquivo `.env.example` com as chaves necessárias (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
  - [x] SubTask 1.3: Criar os utilitários de cliente do Supabase em `src/utils/supabase/` (arquivos `client.ts`, `server.ts` e `middleware.ts`).

- [x] Task 2: Página de Login e Ações de Autenticação
  - [x] SubTask 2.1: Criar a página de login (`src/app/login/page.tsx`) utilizando os componentes do shadcn/ui (Card, Input, Button, Label).
  - [x] SubTask 2.2: Criar as Server Actions (`src/app/login/actions.ts`) para lidar com a submissão do formulário (login e tratamento de erros).

- [x] Task 3: Proteção de Rotas e Redirecionamento (Role-based)
  - [x] SubTask 3.1: Criar/atualizar o arquivo `middleware.ts` na raiz do projeto (`src/middleware.ts`) para proteger rotas e renovar a sessão do Supabase.
  - [x] SubTask 3.2: Implementar no middleware ou na ação de login a lógica que checa a role do usuário (ex: lendo `user_metadata.role`) e redireciona para `/supplier` ou `/reseller`.

- [ ] Task 4: Script SQL e Instruções do Supabase
  - [ ] SubTask 4.1: Criar um arquivo `supabase-schema.sql` na raiz detalhando a tabela de perfis (profiles) e triggers para salvar as roles de forma integrada com o `auth.users`.

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] can run in parallel with [Task 1]