# Integração Supabase e Autenticação Spec

## Why
O sistema de dropshipping precisa de uma camada de segurança robusta para proteger os dados. É necessário autenticar os usuários e garantir que administradores (fornecedores) e revendedores acessem apenas os painéis correspondentes aos seus perfis, proporcionando a experiência e as permissões corretas para cada tipo de usuário.

## What Changes
- Instalação e configuração do pacote `@supabase/ssr` e `@supabase/supabase-js` para comunicação com o Supabase no Next.js App Router.
- Criação de utilitários do Supabase (Client, Server e Middleware).
- Criação de uma página de Login (`/login`) moderna e integrada ao layout.
- Criação de Server Actions para realizar o login seguro.
- Configuração do `middleware.ts` do Next.js para proteger as rotas `/supplier` e `/reseller`.
- Lógica de redirecionamento baseada no papel (role) do usuário (Admin -> `/supplier`, Revendedor -> `/reseller`).
- Arquivo de documentação/SQL para orientar a criação das tabelas e permissões (RLS) no projeto do Supabase do usuário.

## Impact
- Affected specs: `init-dropshipping-system` (O acesso às rotas previamente criadas será restrito).
- Affected code: Adição de middleware global, nova página de login, utilitários de banco de dados e ajuste nos layouts para suportar o estado de autenticação.

## ADDED Requirements
### Requirement: Autenticação Segura
O sistema DEVE permitir que os usuários façam login de forma segura utilizando email e senha através do Supabase Auth.

#### Scenario: Login com Sucesso
- **WHEN** o usuário insere credenciais válidas na página de login
- **THEN** o sistema autentica o usuário via Supabase e cria uma sessão válida.

### Requirement: Redirecionamento Baseado em Regras (Role-based)
O sistema DEVE redirecionar o usuário para a dashboard correta após o login, dependendo de sua função (role).

#### Scenario: Redirecionamento de Admin (Fornecedor)
- **WHEN** um usuário com a role `admin` faz login
- **THEN** ele é redirecionado para a rota `/supplier`.

#### Scenario: Redirecionamento de Revendedor
- **WHEN** um usuário com a role `reseller` faz login
- **THEN** ele é redirecionado para a rota `/reseller`.

### Requirement: Proteção de Rotas
O sistema DEVE impedir o acesso não autenticado ou não autorizado às dashboards.

#### Scenario: Acesso Negado
- **WHEN** um usuário não autenticado tenta acessar `/supplier` ou `/reseller`
- **THEN** ele é interceptado pelo middleware e redirecionado de volta para `/login`.