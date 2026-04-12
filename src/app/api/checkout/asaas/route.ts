import { NextResponse } from "next/server"

// Payload esperado para o split do ASAAS:
// {
//    customer_name,
//    customer_cpf,
//    customer_email,
//    items: [ { base_cost, reseller_margin, qty } ],
//    shipping_cost,
//    reseller_wallet_id,  -- wallet asaas do revendedor
//    supplier_wallet_id   -- wallet asaas do fornecedor
// }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping_cost, reseller_wallet_id, supplier_wallet_id } = body

    if (!items || !reseller_wallet_id || !supplier_wallet_id) {
      return NextResponse.json(
        { error: "Faltam parâmetros obrigatórios para o split." },
        { status: 400 }
      )
    }

    // 1. Calcula o total de cada recebedor
    const totalSupplier = items.reduce((acc: number, item: any) => acc + (item.base_cost * item.qty), 0) + shipping_cost
    const totalReseller = items.reduce((acc: number, item: any) => acc + (item.reseller_margin * item.qty), 0)
    const grandTotal = totalSupplier + totalReseller

    // 2. Mock de Payload ASAAS para a API de pagamentos (com Split)
    const asaasPayload = {
      customer: "cus_000000000",
      billingType: "PIX",
      value: grandTotal,
      dueDate: new Date().toISOString().split('T')[0],
      description: "Pedido - Loja Dropshipping",
      split: [
        {
          walletId: supplier_wallet_id,
          fixedValue: totalSupplier,
          statusRefusal: "CANCEL"
        },
        {
          walletId: reseller_wallet_id,
          fixedValue: totalReseller,
          statusRefusal: "CANCEL"
        }
      ]
    }

    // TODO: Chamar `fetch('https://api.asaas.com/v3/payments')`
    // Aqui retornamos sucesso simulado:

    return NextResponse.json({
      success: true,
      message: "Transação criada com Split",
      transactionId: "pay_simulated_9999",
      payload: asaasPayload
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao processar transação no Asaas." },
      { status: 500 }
    )
  }
}
