# Parcelamento e Split no Cartão (Asaas) Spec

## Why
O checkout com cartão parcelado está gerando inconsistências de arredondamento na exibição das parcelas e erro do Asaas quando há split, pois o split fixo é interpretado por parcela e pode exceder o valor da cobrança por parcela.

## What Changes
- Calcular valores de parcelas em centavos para exibição consistente e soma exata do total.
- Para cartão com parcelamento (> 1), enviar `installmentValue` e ajustar o split para não exceder o valor por parcela.
- Manter split fixo para PIX e cartão à vista (1x) para repasse exato ao fornecedor.
- Explicitar que, em cartão parcelado, o repasse do split acontece por parcela (o fornecedor recebe uma parte em cada parcela).

## Impact
- Affected specs: Checkout (pagamento cartão), Split Asaas, UX de parcelas
- Affected code: API `/api/checkout/asaas`, UI checkout storefront, integração Asaas (payload de cobrança)

## ADDED Requirements
### Requirement: Exibição de parcelas com soma exata
O sistema SHALL exibir parcelas de cartão calculadas em centavos, garantindo que a soma das parcelas seja igual ao total.

#### Scenario: Total não divisível pelo número de parcelas
- **WHEN** o total for R$ 102,16 e o usuário selecionar 3x
- **THEN** a UI SHALL exibir parcelas que somam R$ 102,16 (por exemplo: 2x de R$ 34,05 e 1x de R$ 34,06; ou listagem equivalente)

### Requirement: Split compatível com cartão parcelado
O sistema SHALL criar cobrança no Asaas com parcelamento e split que nunca exceda o valor da cobrança por parcela.

#### Scenario: Split fixo maior que o valor por parcela (caso real)
- **WHEN** houver cobrança no cartão com 3x e o split do fornecedor (custo+frete) for maior que o valor de cada parcela
- **THEN** o backend SHALL ajustar o split para uma forma compatível com parcelamento (ex.: percentual), evitando o erro do Asaas “O valor total do Split excede o valor a receber da cobrança”.

#### Scenario: Repasse em cartão parcelado (comportamento esperado)
- **WHEN** o usuário pagar em 3x no cartão
- **THEN** o fornecedor SHALL receber o split “fatiado” em cada parcela (uma parte por parcela), e não um repasse único à vista.

## MODIFIED Requirements
### Requirement: Checkout cartão com split
Para cobranças com `billingType=CREDIT_CARD`:
- Se `installmentCount` for 1, o sistema SHALL manter split por `fixedValue` (repasse exato) e não exigir cálculo de distribuição por parcela.
- Se `installmentCount` for maior que 1, o sistema SHALL:
  - Enviar `installmentValue` calculado e coerente com a UI (baseado em centavos).
  - Usar split por `percentualValue` (derivado de `supplierFixed/total`) para evitar exceder o valor por parcela e ser compatível com parcelamento; o repasse ocorre por parcela.
  - Validar que `supplierFixed <= total` antes de montar o split; caso contrário, retornar erro 400 com mensagem clara.

## REMOVED Requirements
### Requirement: Split fixo por parcela em cartão parcelado
**Reason**: Em parcelamento o split fixo é aplicado por parcela e pode exceder o valor por parcela, causando rejeição do Asaas.
**Migration**: Para parcelamento, migrar split para `percentualValue` e manter `fixedValue` apenas para 1x e PIX.
