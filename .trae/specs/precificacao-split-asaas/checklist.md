* [x] Banco de dados reflete colunas de custo base, margem sugerida, margem do revendedor e frete nos modelos de produto e pedido.

* [x] Fornecedor consegue criar um produto especificando custo de produção e margem sugerida.

* [x] Revendedor consegue visualizar produtos do fornecedor, aceitar margem sugerida ou definir a sua própria.

* [x] Cálculo do valor final de venda do item reflete `custo base + margem do revendedor`.

* [x] Pedido total inclui o valor do frete calculado com base no CEP do cliente final e do fornecedor.

* [x] Integração com ASAAS envia payload de Split de Pagamentos separando `(custo + frete)` para o Fornecedor e `(margem)` para o Revendedor.

* [x] O pedido gerado armazena corretamente o ID da transação ASAAS e os valores desmembrados.

