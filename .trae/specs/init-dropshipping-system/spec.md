# Sistema de Dropshipping - Moda Masculina Spec

## Why
O mercado de moda masculina precisa de uma plataforma moderna e profissional para conectar fornecedores e revendedores via dropshipping. O sistema precisa oferecer uma gestão eficiente de produtos e pedidos pelo lado do fornecedor, além de ferramentas completas de personalização e vendas para os revendedores gerenciarem suas lojas de forma independente (white-label).

## What Changes
- Criação do projeto base utilizando React e Next.js com foco em performance e responsividade (aplicando as melhores práticas do Vercel).
- Desenvolvimento da **Dashboard do Fornecedor** contendo: gestão de produtos (roupas e acessórios), pedidos, revendedores e configurações gerais.
- Desenvolvimento da **Dashboard do Revendedor** contendo: status da loja, catálogo, pedidos, clientes, financeiro e personalização visual da loja (SEO, banners, layout, integrações de pagamento/envio).

## Impact
- Affected specs: N/A (novo projeto)
- Affected code: Inicialização de todo o repositório front-end do zero.

## ADDED Requirements
### Requirement: Dashboard do Fornecedor
O sistema DEVE prover uma interface para o fornecedor (administrador principal) operar seu negócio de dropshipping.

#### Scenario: Gestão de Produtos e Pedidos
- **WHEN** o fornecedor acessa a plataforma
- **THEN** ele pode cadastrar novos produtos de moda masculina, aprovar o cadastro de revendedores e gerenciar o status de todos os pedidos recebidos.

### Requirement: Dashboard do Revendedor
O sistema DEVE prover uma interface para os revendedores gerenciarem as operações de suas lojas virtuais e personalizarem a aparência.

#### Scenario: Configuração e Checklist da Loja
- **WHEN** o revendedor acessa a rota de "Cadastros > Minha Loja"
- **THEN** ele visualiza um checklist de configuração (ex: Configuração de recebimento Asaas, Dados Cadastrais, Tema, ID de acesso, Pagamentos, Envios) e pode navegar entre as abas de edição (Status, Dados, Endereço, Pagamentos, Configurações, Log).

#### Scenario: Personalização Visual
- **WHEN** o revendedor acessa a rota de "Configurações > Visual do Site"
- **THEN** ele pode configurar a ordem e edição dos blocos da página (Hero Slider, Produtos em Grid, Banners), além de preencher dados de SEO (Título, Meta Descrição) e configurar Layout/Cores.
