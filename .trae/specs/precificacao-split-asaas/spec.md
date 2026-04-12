# Precificação, Frete e Split de Pagamento Asaas Spec

## Why
O modelo de negócio dropshipping depende de uma distribuição justa e automática de receitas. O Fornecedor (Supplier) define o custo base de cada item, e o Revendedor (Reseller) define sua margem de lucro em cima desse custo. No fechamento do pedido, o valor total precisa incluir o frete calculado dinamicamente. O recebimento e o repasse devem ocorrer via plataforma ASAAS, usando a funcionalidade de Split de Pagamentos para que o Fornecedor receba (Custo + Frete) e o Revendedor receba (Margem de Lucro).

## What Changes
- Adicionar campos de `base_cost` e `suggested_margin` aos produtos criados pelo Fornecedor.
- Permitir que Revendedores visualizem os produtos do Fornecedor e configurem sua própria `reseller_margin` (margem personalizada) ou aceitem a sugestão.
- Integrar cálculo de frete dinâmico baseado no CEP do Fornecedor (origem) e CEP do Cliente (destino).
- Definir regra de Split de Pagamento na finalização do pedido via integração ASAAS.
- Ajustar os modelos do banco de dados (`products`, `reseller_products`, `orders`) para suportar esses valores financeiros separadamente.

## Impact
- Affected specs: `orders`, `products`, `store settings`.
- Affected code: 
  - Banco de Dados (tabelas e RLS)
  - Formulário de produtos do Supplier
  - Catálogo de produtos do Reseller
  - Fluxo de Checkout (cálculo total)
  - Integração/Webhooks Asaas

## ADDED Requirements
### Requirement: Precificação Base do Fornecedor
O sistema SHALL permitir que o Fornecedor estabeleça um custo fixo (`base_cost`) para cada item, além de uma margem de lucro sugerida (`suggested_margin`).

#### Scenario: Criação de produto
- **WHEN** o fornecedor cadastra um novo item
- **THEN** ele informa o custo de produção/compra e uma sugestão de lucro em % ou valor fixo para a rede.

### Requirement: Precificação Personalizada do Revendedor
O sistema SHALL permitir que cada Revendedor importe os produtos do Fornecedor para sua loja e ajuste a margem de lucro final.

#### Scenario: Edição de preço na loja
- **WHEN** o revendedor acessa seu catálogo
- **THEN** o sistema exibe o custo base (bloqueado) e permite alterar a margem, exibindo o Preço Final de Venda em tempo real.

### Requirement: Cálculo Dinâmico de Frete
O sistema SHALL calcular o frete com base no peso/dimensões do produto, CEP do fornecedor e CEP do cliente final.

#### Scenario: Checkout do cliente
- **WHEN** o cliente final informa seu CEP na loja do revendedor
- **THEN** o sistema soma o frete ao (Custo Base + Margem do Revendedor) para compor o Valor Total do Pedido.

### Requirement: Split de Pagamento ASAAS
O sistema SHALL criar uma transação no Asaas com split de pagamento nativo para distribuir os valores corretamente.

#### Scenario: Pagamento aprovado
- **WHEN** o pedido é pago via PIX/Cartão/Boleto
- **THEN** a chamada para a API do Asaas divide os fundos: o Fornecedor recebe (Custo Base + Valor do Frete) e o Revendedor recebe (Sua Margem de Lucro) na sua subconta Asaas.

## MODIFIED Requirements
### Requirement: Modelagem de Pedidos (`orders`)
A tabela de pedidos existente passa a requerer a separação detalhada dos valores financeiros, não apenas um `total_amount` genérico.
- Novos campos: `base_cost_total`, `reseller_margin_total`, `shipping_cost`, `asaas_transaction_id`.

## REMOVED Requirements
- N/A
