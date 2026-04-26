# Tasks
- [x] Task 1: Padronizar cálculo de parcelas em centavos (UI)
  - [x] Atualizar a UI do checkout para calcular parcelas em centavos e exibir uma decomposição que some exatamente o total.
  - [x] Garantir que a seleção de 1x/2x/3x reflita valores consistentes com o total (sem “perder 1 centavo”).

- [x] Task 2: Ajustar payload do Asaas para cartão parcelado com split
  - [x] Calcular `installmentValue` em centavos a partir do total e `installmentCount`.
  - [x] Para `installmentCount > 1`, trocar split do fornecedor de `fixedValue` para `percentualValue` com validações (supplierFixed <= total; percentual <= 100).
  - [x] Manter split por `fixedValue` para PIX e cartão 1x.

- [x] Task 3: Validação
  - [x] Exercitar fluxo de cartão 2x/3x com split (sandbox) e confirmar que o Asaas não retorna erro de split/parcelas.
  - [x] Rodar `npm run build` e `npm run lint`.

# Task Dependencies
- [Task 2] depends on [Task 1] (para manter consistência UI/backend de valores)
- [Task 3] depends on [Task 2]
