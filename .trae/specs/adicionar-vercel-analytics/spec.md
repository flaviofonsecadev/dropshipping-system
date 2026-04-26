# Vercel Web Analytics Spec

## Why
Adicionar métricas de pageview e navegação no deploy da Vercel sem instrumentação manual, usando o componente oficial do Next.js.

## What Changes
- Incluir o componente `<Analytics />` do pacote `@vercel/analytics` no layout raiz do App Router.
- Garantir que o tracking só funcione após habilitar o Web Analytics no projeto da Vercel (rotas `/_vercel/insights/*` criadas no deploy).

## Impact
- Affected specs: Observabilidade (analytics), navegação entre páginas (App Router)
- Affected code: `src/app/layout.tsx` (ou layout equivalente raiz)

## ADDED Requirements
### Requirement: Pageview tracking
O sistema SHALL enviar eventos de pageview automaticamente para a Vercel quando estiver hospedado na Vercel com Web Analytics habilitado.

#### Scenario: Navegação no site
- **WHEN** o usuário visitar uma página e navegar para outra rota
- **THEN** o app SHALL registrar pageviews no painel de Analytics da Vercel

## MODIFIED Requirements
### Requirement: Layout raiz
O layout raiz SHALL renderizar o `<Analytics />` junto do conteúdo da aplicação.

## REMOVED Requirements
N/A
