# Plano: Asaas (Taxas + Split) + Frete (SuperFrete)

## Summary
Este plano ajusta a implementação atual do Asaas para refletir as regras reais do negócio:
- O **revendedor** emite a cobrança no Asaas e **assume as taxas** (PIX/cartão/parcelamento).
- O **fornecedor** recebe via Split um valor **fixo** de **custo dos produtos + frete**.
- O frete será integrado via **SuperFrete**; a cobrança do frete é feita no checkout, mas o **pagamento da etiqueta** não é “repassado automaticamente” do Asaas para a SuperFrete: é um fluxo separado (o sistema pode automatizar a compra da etiqueta após confirmação do pagamento).
- Remover o fluxo de **criação de subcontas** no Asaas: o revendedor apenas conecta uma conta existente (ou segue um link para criar no Asaas e depois cola a API key).

## Current State Analysis (repo)
### Integração Asaas atual
- Wrapper Asaas: [asaas.ts](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/lib/asaas.ts)
  - Já contém: `retrieveWalletId`, `getOrCreateCustomer`, `createPayment` e suporte a sandbox/production via `ASAAS_ENV`.
- Criptografia de segredo: [secret.ts](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/lib/secret.ts)
  - Usa `APP_ENCRYPTION_KEY` (base64 de 32 bytes) para criptografar API keys no banco.
- Dados do Asaas em `profiles`: migration existente [add-asaas-fields-to-profiles.sql](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/supabase/migrations/add-asaas-fields-to-profiles.sql).
- Páginas de pagamentos:
  - Supplier: [/supplier/settings/pagamentos](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/(dashboard)/supplier/settings/pagamentos/page.tsx)
  - Reseller: [/reseller/settings/pagamentos](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/(dashboard)/reseller/settings/pagamentos/page.tsx) (hoje ainda inclui “Criar subconta”).
- Checkout Asaas: [/api/checkout/asaas](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/api/checkout/asaas/route.ts)
  - Cria cobrança usando a API key do revendedor e aplica split fixo para o `walletId` do fornecedor.
  - Ainda está com `shipping_cost` default 0 e não integra a cotação de frete real.
- Frete: [/api/checkout/shipping](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/api/checkout/shipping/route.ts) é mock (retorna PAC/SEDEX calculados artificialmente).

### Pontos críticos para as regras novas
- No Asaas, o split é aplicado sempre sobre o **netValue** (valor líquido após taxas). Se o total do split exceder o líquido, o split pode ser bloqueado/divergente. Isso é especialmente relevante para cartão/parcelamento. (Doc oficial “Payment split overview” e “Split in single payments”.)
- Frete (SuperFrete): o pagamento da etiqueta normalmente ocorre dentro do provedor (saldo/carteira/checkout do próprio provedor). Não existe “repasse automático” do Asaas direto para o provedor; o que fazemos é **cobrar o cliente** e depois **comprar a etiqueta** usando a conta do fornecedor (ou revendedor), por integração.

## Decisions Locked (a partir das suas respostas)
- Subconta Asaas: **Remover subconta**. Revendedor conecta conta existente (ou cria no site do Asaas e cola a API key).
- Frete: **Fornecedor recebe frete** (split inclui frete).
- Gateway de frete: **SuperFrete**.
- Pagamentos: **PIX + Cartão**, com parcelamento **até 3x**, e taxas sempre “sobrando” do lado do revendedor (porque a cobrança é emitida na conta dele).

## Proposed Changes (implementação)

### 1) Simplificar onboarding Asaas (sem subcontas)
**Objetivo**: manter apenas “conectar conta existente”.
- Editar [reseller/settings/pagamentos/page.tsx](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/(dashboard)/reseller/settings/pagamentos/page.tsx)
  - Remover o Card “Criar subconta”.
  - Adicionar um link “Criar conta no Asaas” (externo) e manter apenas input de API key.
- Editar [reseller/settings/pagamentos/actions.ts](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/(dashboard)/reseller/settings/pagamentos/actions.ts)
  - Remover `createResellerSubaccountAction` e tudo que depende de `createAdminClient`/service role.
- Editar [asaas.ts](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/lib/asaas.ts)
  - Remover `createSubaccount` e tipos relacionados (se não forem mais usados).
- Consequência: `SUPABASE_SERVICE_ROLE_KEY` deixa de ser pré-requisito para o split/checkout (só fica necessário se no futuro voltarmos com subcontas).

### 2) Ajustar checkout para taxas do Asaas ficarem no revendedor
**Objetivo**: taxas (PIX/cartão/parcelas) ficam com o revendedor automaticamente porque:
- a cobrança é criada na **conta do revendedor**;
- o split repassa um valor fixo para o fornecedor;
- o “restante líquido” (já descontadas as taxas do Asaas) fica com o revendedor.

Mudanças:
- Atualizar [/api/checkout/asaas](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/api/checkout/asaas/route.ts)
  - Receber do frontend:
    - `payment_method`: `"pix"` ou `"card"`
    - `installments`: `1..3` quando cartão
    - `shipping_cost`: valor escolhido no frete
  - Calcular:
    - `supplier_fixed = sum(base_cost*qty) + shipping_cost`
    - `total_value = sum((base_cost + reseller_margin)*qty) + shipping_cost`
  - Criar cobrança no Asaas com split fixo para `supplier_wallet_id`.
  - Se o Asaas recusar por netValue insuficiente, retornar erro claro:
    - “Margem insuficiente para cobrir taxas do cartão/parcelamento. Aumente a margem, reduza parcelas ou use PIX.”

**Observação importante**: o split é calculado no `netValue` (líquido). Para cartão/parcelas, dependendo da taxa, pode acontecer divergência/bloqueio se o split exceder o líquido. O plano inclui tratamento de erro e, na etapa de webhooks (abaixo), monitoramento do evento de divergência.

### 3) Checkout suportar PIX + Cartão sem coletar dados do cartão no site
**Objetivo**: não lidar com PCI/armazenamento de cartão.
- Fluxo recomendado:
  - Para PIX: criar cobrança `billingType=PIX`.
  - Para cartão: criar cobrança `billingType=CREDIT_CARD` e redirecionar o cliente para `invoiceUrl` do Asaas (o cliente digita os dados do cartão na tela do Asaas). (Doc oficial “Credit Card Charges”.)
  - Parcelamento até 3x:
    - passar `installmentCount`/campos equivalentes na criação da cobrança quando `payment_method=card`.
    - se a UI do Asaas permitir mais parcelas, restringir do lado do nosso frontend (dropdown 1–3).

### 4) Definir fluxo de frete com SuperFrete (cotação + compra de etiqueta)
**Objetivo**: cliente paga frete, mas o split envia o valor do frete para o fornecedor. A etiqueta é comprada via SuperFrete após o pagamento ser confirmado.

**Decisão de fluxo**:
- O Asaas NÃO repassa automaticamente o pagamento para SuperFrete. O sistema:
  1) cota frete na SuperFrete;
  2) soma `shipping_cost` no checkout;
  3) após pagamento confirmado, chama API da SuperFrete para comprar etiqueta/gerar envio usando a conta do fornecedor.

Mudanças propostas:
- Substituir o mock de [/api/checkout/shipping](file:///C:/Users/servo/Desktop/CODE/freela/dropsystem/dropshipping-system/src/app/api/checkout/shipping/route.ts) por integração SuperFrete:
  - entrada: CEP destino, itens (peso/dimensões) e origem (endereço do fornecedor)
  - saída: opções de frete com preço e prazo
- Dados necessários no catálogo:
  - adicionar em `products` (ou em uma tabela auxiliar) campos de peso e dimensões, e no `supplier` o endereço de origem.
  - se ainda não quisermos mexer no catálogo agora, um V1 pode usar dimensões fixas configuradas pelo fornecedor.

### 5) Webhooks (pagamento confirmado + divergência de split)
**Objetivo**: automatizar pós-pagamento.
- Criar endpoint de webhook do Asaas para:
  - “pagamento recebido” -> gerar pedido interno + disparar compra de etiqueta na SuperFrete
  - “divergência/bloqueio de split” -> marcar pedido como “necessita ajuste” e notificar (log/alert)

Docs relevantes:
- Split é sobre netValue e pode bloquear quando excede o líquido; existem eventos de webhook para divergência/bloqueio.

## Assumptions & Constraints
- O marketplace terá **um fornecedor** e múltiplos revendedores.
- Split sempre enviará **custo + frete** ao fornecedor (fixo).
- Taxas do Asaas (PIX/cartão/parcelas) ficam por conta do revendedor (porque ele é o emissor da cobrança).
- Integração inicial com cartão será via `invoiceUrl` do Asaas (sem captura de cartão no nosso frontend).

## Verification (quando for executar)
1) Supabase:
   - aplicar migrations pendentes (profiles Asaas + qualquer nova de frete/dimensões).
2) Variáveis de ambiente:
   - `APP_ENCRYPTION_KEY` (base64 32 bytes)
   - `ASAAS_ENV=sandbox`
   - `ASAAS_USER_AGENT` opcional (identificador do app nas requisições).
3) Fluxo:
   - Supplier conecta API key e valida walletId.
   - Reseller conecta API key.
   - Checkout:
     - cotar frete (SuperFrete), escolher método (PIX/cartão) e parcelas (1–3).
     - criar cobrança no Asaas com split (custo+frete para fornecedor).
     - conferir no Asaas que o fornecedor recebeu o split e revendedor ficou com o restante (já descontadas taxas).
4) Rodar `npm run build`.

## Notes: ASAAS_USER_AGENT
`ASAAS_USER_AGENT` é apenas um identificador textual enviado no header `User-Agent` nas chamadas à API do Asaas. Não é segredo; serve para rastreio/diagnóstico.

