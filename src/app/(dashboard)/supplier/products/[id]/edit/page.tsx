import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ProductEditForm } from "./product-edit-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()

  const resolvedParams = await params
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (!product) {
    notFound()
  }

  return <ProductEditForm product={product} />
}