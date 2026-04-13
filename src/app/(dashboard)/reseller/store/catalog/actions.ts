'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function upsertResellerProductAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const product_id = String(formData.get('product_id') ?? '')
  const is_active = String(formData.get('is_active') ?? '') === 'true'
  const custom_margin = formData.get('custom_margin')
  const parsedCustomMargin =
    typeof custom_margin === 'string' && custom_margin.trim() ? Number(custom_margin) : null

  if (!product_id) {
    redirect('/reseller/store/catalog?error=missing_product')
  }

  const { error } = await supabase
    .from('reseller_products')
    .upsert(
      {
        reseller_id: user.id,
        product_id,
        is_active,
        custom_margin: parsedCustomMargin,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reseller_id,product_id' }
    )

  if (error) {
    redirect('/reseller/store/catalog?error=save_failed')
  }

  redirect('/reseller/store/catalog?saved=1')
}
