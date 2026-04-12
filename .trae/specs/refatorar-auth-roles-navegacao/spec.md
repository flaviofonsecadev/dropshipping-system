# Especificação de Auth, Roles e Navegação

## Why
O fluxo atual de autenticação e navegação está funcional, mas precisa de revisão para cobrir cadastro de usuário, regras de role mais explícitas e consistência de UI/nomes de rotas e botões. Isso reduz ambiguidades de acesso e melhora a experiência de uso.

## What Changes
- Revisar e padronizar o fluxo de login e criação de usuário com mensagens de sucesso/erro claras.
- Definir contrato de roles (`supplier`, `reseller`, `admin`) e comportamento de redirecionamento pós-login.
- Ajustar proteção de rotas privadas por role e fallback para acessos não autorizados.
- Revisar nomenclatura de rotas visíveis na UI (labels de navegação) para termos mais claros ao negócio.
- Atualizar textos/nomes dos botões de navegação e ações principais para consistência entre telas.
- Revisar a visualização atual (hierarquia visual, títulos de página e CTAs) para manter linguagem única entre áreas Supplier e Reseller.

## Impact
- Affected specs: autenticação, autorização por role, roteamento protegido, navegação e copy de interface.
- Affected code: `src/app/login/*`, `src/middleware.ts`, `src/components/layout/*`, `src/components/ui/*`, páginas `src/app/supplier/*` e `src/app/reseller/*`.

## ADDED Requirements
### Requirement: Cadastro e Login com Resultado Determinístico
O sistema SHALL permitir login e criação de usuário com respostas previsíveis para sucesso, validação e falha de autenticação.

#### Scenario: Cadastro com dados válidos
- **WHEN** o usuário envia e-mail e senha válidos no fluxo de cadastro
- **THEN** o sistema cria a conta e retorna estado de sucesso com orientação de próximo passo

#### Scenario: Login com credenciais inválidas
- **WHEN** o usuário envia credenciais inválidas
- **THEN** o sistema mantém o usuário na tela de login e exibe mensagem de erro amigável

### Requirement: Roteamento por Role
O sistema SHALL redirecionar e permitir acesso às rotas privadas de acordo com a role do usuário autenticado.

#### Scenario: Acesso autenticado com role reseller
- **WHEN** um usuário com role `reseller` autentica com sucesso
- **THEN** o sistema redireciona para a área de revendedor e bloqueia áreas exclusivas de supplier/admin

#### Scenario: Acesso não autenticado
- **WHEN** uma sessão anônima tenta acessar rota privada
- **THEN** o sistema redireciona para `/login`

### Requirement: Navegação com Nomenclatura Unificada
O sistema SHALL exibir nomes de menus, botões e títulos de página consistentes com o vocabulário definido para o produto.

#### Scenario: Menu lateral atualizado
- **WHEN** o usuário abre a navegação principal
- **THEN** os itens aparecem com rótulos revisados e coerentes entre Supplier e Reseller

## MODIFIED Requirements
### Requirement: Fluxo de Entrada Atual
O fluxo existente de entrada passa a suportar dois caminhos explícitos (entrar e criar conta) com tratamento de estado pendente, mensagens de erro por ação e feedback de sucesso pós-cadastro.

### Requirement: Proteção de Rotas Atual
A proteção atual deixa de ser apenas autenticação básica e passa a validar role por área, aplicando redirecionamento de fallback quando houver acesso incompatível.

## REMOVED Requirements
### Requirement: Nomenclatura Legada de Navegação
**Reason**: os rótulos atuais apresentam inconsistências de linguagem entre seções e dificultam entendimento rápido da função de cada rota.
**Migration**: substituir labels antigos por nomes padronizados no menu, breadcrumbs, títulos e botões de ação.
