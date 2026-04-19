# Tasks
- [x] Task 1: Mapear layout de referência e componentes atuais do storefront
  - [x] Capturar seções essenciais (topbar, header com busca, grid/cards, CTAs, títulos de seção) em desktop e mobile
  - [x] Identificar os pontos de customização existentes (logo/banner/cores) e como aplicar em tema claro

- [x] Task 2: Atualizar `/loja/[slug]` para layout “e-commerce” (tema claro)
  - [x] Implementar topbar e header com busca (submit via querystring)
  - [x] Implementar seções “LANÇAMENTOS” e “MAIS VENDIDOS” (com fallback para “PRODUTOS” se necessário)
  - [x] Implementar card de produto no estilo referência (imagem, nome centralizado, preço em destaque, textos secundários, botões “Olhar” e “Comprar”)
  - [x] Garantir responsividade: grid e espaçamentos (mobile e desktop)

- [x] Task 3: Atualizar `/loja/[slug]/produto/[productId]` para layout de detalhe “e-commerce”
  - [x] Reutilizar header/topbar do storefront
  - [x] Implementar galeria (imagem principal + miniaturas quando existirem)
  - [x] Reorganizar informações (título, SKU, preço, CTA) para conversão e leitura
  - [x] Ajustar versão mobile (CTA com largura total e posição prioritária)

- [x] Task 4: Validar comportamento e qualidade
  - [x] Manter compatibilidade com o fluxo existente de compra (BuyButton/checkout stub)
  - [x] Conferir desktop e smartphone (pelo menos 2 breakpoints) sem overflow/estouro de layout
  - [x] Rodar lint e build e corrigir erros (warnings podem permanecer)

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 2] and [Task 3]
