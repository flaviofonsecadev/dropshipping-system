# Alinhar Layout da Loja (Referência Panos Brasil) Spec

## Why
A vitrine pública atual (/loja/[slug]) tem visual “SaaS/dark” e não se comporta como uma loja virtual tradicional. O objetivo é aproximar o layout e a hierarquia visual do site de referência para melhorar conversão e usabilidade em desktop e smartphone.

## What Changes
- Atualizar o visual das rotas públicas:
  - `/loja/[slug]` (lista de produtos)
  - `/loja/[slug]/produto/[productId]` (detalhe do produto)
- Implementar estrutura e padrões visuais semelhantes ao site de referência:
  - barra superior simples (links utilitários)
  - header com logo, busca central e ícones à direita
  - cards de produto com nome centralizado, preço em destaque e CTAs “Olhar” e “Comprar”
  - seções com título (ex: “LANÇAMENTOS”, “MAIS VENDIDOS”)
- Tornar o layout responsivo e otimizado para mobile (header compacto, grid e CTAs adaptados).

## Impact
- Affected specs: storefront público, navegação e compra rápida
- Affected code: rotas app públicas de loja e componentes auxiliares do storefront (inclui BuyButton existente)

## ADDED Requirements
### Requirement: Visual de Loja “e-commerce”
O sistema SHALL renderizar as vitrines públicas em estilo de loja virtual, com fundo claro, tipografia legível e hierarquia de compra, mantendo a identidade (logo/banner) configurada pelo revendedor.

#### Scenario: Lista de produtos em desktop (sucesso)
- **WHEN** o visitante acessa `/loja/[slug]` em viewport desktop
- **THEN** deve ver:
  - uma barra superior com links utilitários (ex: “Home”, “Fale conosco”), sem depender de autenticação
  - um header com:
    - logo da loja à esquerda (quando existir)
    - campo de busca central
    - ícones à direita (exibição visual; links podem ser “no-op”/placeholder, desde que não quebrem navegação)
  - uma seção “LANÇAMENTOS” exibindo uma grade/carrossel de produtos
  - cards com:
    - imagem de capa (primeira imagem)
    - nome do produto em caixa alta e centralizado
    - preço principal em destaque (R$)
    - textos secundários similares (ex: “1x de R$ …” e “R$ … com PIX”)
    - botões “Olhar” (navega ao detalhe) e “Comprar” (aciona compra rápida)

#### Scenario: Lista de produtos em smartphone (sucesso)
- **WHEN** o visitante acessa `/loja/[slug]` em viewport mobile
- **THEN** deve ver:
  - header compacto com ícone de menu (hambúrguer) à esquerda
  - busca acessível e utilizável (placeholder e submit)
  - grid de produtos adaptado (mínimo 2 colunas quando houver espaço; tipografia e espaçamentos reduzidos)
  - CTAs “Olhar” e “Comprar” acessíveis ao toque (área mínima e largura adequada)

### Requirement: Busca na vitrine
O sistema SHALL permitir filtrar produtos pela busca do header, sem exigir JavaScript obrigatório (deve funcionar via submit e querystring).

#### Scenario: Filtrar produtos (sucesso)
- **WHEN** o visitante digita um termo e submete a busca
- **THEN** a vitrine deve exibir somente produtos cujo nome ou SKU contenham o termo (case-insensitive), mantendo a rota `/loja/[slug]` e adicionando parâmetro de consulta.

### Requirement: Detalhe do produto com foco em compra
O sistema SHALL exibir a página de detalhe com layout semelhante a e-commerce: galeria, título, preço, e CTA de compra em destaque.

#### Scenario: Ver detalhe em desktop (sucesso)
- **WHEN** o visitante acessa `/loja/[slug]/produto/[productId]` em desktop
- **THEN** deve ver:
  - header consistente com a vitrine
  - galeria do produto (imagem principal e miniaturas quando existirem)
  - título, SKU e preço com hierarquia clara
  - CTA “Comprar” (reutilizando o fluxo existente), visível sem rolagem excessiva

#### Scenario: Ver detalhe em mobile (sucesso)
- **WHEN** o visitante acessa `/loja/[slug]/produto/[productId]` em mobile
- **THEN** deve ver:
  - galeria em destaque no topo
  - CTA fixo/prioritário na dobra (ou imediatamente após preço), com largura total
  - tipografia ajustada e sem quebras de layout

## MODIFIED Requirements
### Requirement: Branding existente do revendedor
O sistema SHALL continuar utilizando `logo_url`, `banner_url`, `name`, `headline`, `about`, `primary_color` e `accent_color`, porém com aplicação compatível ao layout claro (ex: botões e destaques podem usar `accent_color`).

## REMOVED Requirements
### Requirement: Tema dark no storefront
**Reason**: O objetivo é alinhar com a referência, que utiliza fundo claro e CTAs escuros.
**Migration**: Atualizar classes de layout e tokens de cor do storefront para tema claro, mantendo contraste AA.

