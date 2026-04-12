import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { destinationZip, items } = body

    if (!destinationZip || !items || items.length === 0) {
      return NextResponse.json(
        { error: "CEP de destino e itens são obrigatórios." },
        { status: 400 }
      )
    }

    // TODO: Integrar com API dos Correios, Melhor Envio ou Kangu.
    // Atualmente retorna um mock de frete baseado na quantidade de itens.
    const baseShipping = 15.90
    const extraPerItem = 2.50
    const totalShipping = baseShipping + (items.length - 1) * extraPerItem

    return NextResponse.json({
      success: true,
      shippingOptions: [
        {
          name: "PAC (Padrão)",
          price: totalShipping,
          estimatedDays: 7,
        },
        {
          name: "SEDEX (Expresso)",
          price: totalShipping * 1.8,
          estimatedDays: 3,
        }
      ]
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao calcular o frete." },
      { status: 500 }
    )
  }
}
