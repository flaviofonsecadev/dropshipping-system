# Checkout Profissional: Carrinho, Login na Loja e Frete (Sem Mock) Spec

## Why
Hoje o storefront usa um fluxo de compra por `prompt()` e não tem carrinho nem uma experiência guiada de checkout. Isso reduz conversão, aumenta erros no cálculo de frete e não transmite confiança.

## What Changes
- Implementar carrinho de compras no storefront do revendedor (adicionar/remover/quantidade) com persistência no navegador.
- Implementar uma experiência de checkout profissional (páginas/etapas com formulário, validação e estados de carregamento).
- Implementar login do cliente na loja do revendedor para prosseguir no checkout (criar conta/entrar/sair).
- Melhorar o fluxo de cálculo de frete com UI dedicada (buscar cotações, selecionar opção, tratar indisponibilidade).
- Remover o fallback “mock” no cálculo de frete do endpoint de shipping (**BREAKING**: frete passa a falhar se não houver provedor configurado).
- Manter a integração existente de cobrança/split via `/api/checkout/asaas` como etapa final do checkout.

## Impact
- Affected specs: storefront público, checkout, frete, auth (cliente), pedidos
- Affected code (principais):
  - `src/app/loja/[slug]/page.tsx`
  - `src/app/loja/[slug]/produto/[productId]/page.tsx`
  - `src/app/loja/[slug]/produto/[productId]/buy-button.tsx` (substituído no fluxo por carrinho/checkout)
  - `src/app/api/checkout/shipping/route.ts` (remoção do mock)
  - `src/app/api/checkout/asaas/route.ts` (consumo pelo checkout)
  - `src/app/login/*` e/ou novas rotas de login do cliente no storefront
  - Migração Supabase para suportar role `customer` em `profiles` ao criar usuários via loja

## ADDED Requirements
### Requirement: Carrinho por loja (storefront)
O sistema SHALL permitir que o cliente adicione produtos ao carrinho a partir da vitrine e da página do produto.

#### Scenario: Adicionar ao carrinho
- **WHEN** o cliente clica em “Adicionar ao carrinho” em um produto ativo da loja
- **THEN** o item é adicionado/atualizado no carrinho com `product_id`, `qty`, `base_cost`, `reseller_margin`, `display_price`
- **AND** o carrinho é persistido no navegador com escopo por `store_slug` (para não misturar carrinhos entre lojas)

#### Scenario: Ajustar quantidade/remover
- **WHEN** o cliente aumenta/diminui a quantidade ou remove o item
- **THEN** o carrinho reflete o novo total e persiste a alteração

### Requirement: Página de carrinho
O sistema SHALL fornecer uma página de carrinho no storefront.

#### Scenario: Ver carrinho
- **WHEN** o cliente acessa `/loja/[slug]/carrinho`
- **THEN** vê os itens, quantidade, subtotal e botão “Finalizar compra”
- **AND** se o carrinho estiver vazio, exibe estado vazio com CTA para voltar à loja

### Requirement: Login do cliente na loja do revendedor
O sistema SHALL permitir que o cliente crie conta e faça login diretamente a partir da loja do revendedor para prosseguir no checkout.

#### Scenario: Checkout exige login
- **WHEN** o cliente tenta acessar `/loja/[slug]/checkout` sem sessão autenticada
- **THEN** o sistema redireciona para uma tela de “Entrar” da loja
- **AND** após login bem sucedido, retorna para `/loja/[slug]/checkout`

#### Scenario: Cadastro de cliente
- **WHEN** o cliente cria conta pelo fluxo da loja
- **THEN** o usuário é criado no Supabase Auth
- **AND** `profiles.role` SHALL ser `customer` (não `reseller`)

### Requirement: Checkout em etapas (profissional)
O sistema SHALL oferecer um fluxo de checkout guiado com validação de dados e estados de carregamento.

#### Scenario: Calcular frete e selecionar opção
- **WHEN** o cliente informa CEP e confirma “Calcular frete”
- **THEN** o sistema chama `POST /api/checkout/shipping` com `{ to_postal_code, items }`
- **AND** exibe lista de opções (serviço, prazo, preço)
- **AND** bloqueia o avanço até o cliente selecionar uma opção

#### Scenario: Criar cobrança no Asaas
- **WHEN** o cliente confirma o pagamento (PIX ou Cartão)
- **THEN** o sistema chama `POST /api/checkout/asaas` com itens + `shipping_cost` da opção selecionada + dados do cliente
- **AND** em sucesso, o sistema apresenta o link (`invoiceUrl`) e orienta o cliente a concluir o pagamento

## MODIFIED Requirements
### Requirement: Cálculo de frete sem mock
O endpoint de frete SHALL deixar de retornar opções mockadas.

#### Scenario: Provedor não configurado
- **WHEN** o provedor de frete (ex: SuperFrete) não estiver configurado no ambiente
- **THEN** o endpoint retorna erro (ex: 503) com mensagem segura e clara (“frete indisponível”)

## REMOVED Requirements
### Requirement: Fluxo de compra via `prompt()`
**Reason**: fluxo não profissional e frágil para validações e UX.
**Migration**: substituir por carrinho + checkout em páginas/etapas.

