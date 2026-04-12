export interface Product {
  id: string
  supplier_id: string
  name: string
  description: string | null
  sku: string
  images: string[]
  videos: string[] | null
  stock_quantity: number
  base_cost: number
  suggested_margin: number
  weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  created_at: string
  updated_at: string
}

export interface ResellerProduct {
  id: string
  reseller_id: string
  product_id: string
  custom_margin: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  product?: Product // Relation
}
