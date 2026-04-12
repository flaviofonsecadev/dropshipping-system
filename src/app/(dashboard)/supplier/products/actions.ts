'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createProductAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Extrair campos do formulário
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = formData.get('sku') as string
  const stock_quantity = parseInt(formData.get('stock_quantity') as string || '0')
  const base_cost = parseFloat(formData.get('base_cost') as string || '0')
  const suggested_margin = parseFloat(formData.get('suggested_margin') as string || '0')
  const weight_kg = parseFloat(formData.get('weight_kg') as string || '0')
  const length_cm = parseFloat(formData.get('length_cm') as string || '0')
  const width_cm = parseFloat(formData.get('width_cm') as string || '0')
  const height_cm = parseFloat(formData.get('height_cm') as string || '0')

  // Mídias (recebidas como JSON stringified arrays do hidden input)
  const imagesStr = formData.get('images') as string
  const videosStr = formData.get('videos') as string
  
  let images: string[] = []
  let videos: string[] = []

  try {
    if (imagesStr) images = JSON.parse(imagesStr)
    if (videosStr) videos = JSON.parse(videosStr)
  } catch (e) {
    console.error('Erro ao parsear mídias:', e)
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      supplier_id: user.id,
      name,
      description,
      sku,
      stock_quantity,
      base_cost,
      suggested_margin,
      weight_kg,
      length_cm,
      width_cm,
      height_cm,
      images,
      videos
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar produto:', error)
    throw new Error(error.message)
  }

  redirect('/supplier/products')
}

export async function updateProductAction(productId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Extrair campos do formulário
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = formData.get('sku') as string
  const stock_quantity = parseInt(formData.get('stock_quantity') as string || '0')
  const base_cost = parseFloat(formData.get('base_cost') as string || '0')
  const suggested_margin = parseFloat(formData.get('suggested_margin') as string || '0')
  const weight_kg = parseFloat(formData.get('weight_kg') as string || '0')
  const length_cm = parseFloat(formData.get('length_cm') as string || '0')
  const width_cm = parseFloat(formData.get('width_cm') as string || '0')
  const height_cm = parseFloat(formData.get('height_cm') as string || '0')

  // Mídias
  const imagesStr = formData.get('images') as string
  const videosStr = formData.get('videos') as string
  
  let images: string[] = []
  let videos: string[] = []

  try {
    if (imagesStr) images = JSON.parse(imagesStr)
    if (videosStr) videos = JSON.parse(videosStr)
  } catch (e) {
    console.error('Erro ao parsear mídias:', e)
  }

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      sku,
      stock_quantity,
      base_cost,
      suggested_margin,
      weight_kg,
      length_cm,
      width_cm,
      height_cm,
      images,
      videos,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .eq('supplier_id', user.id) // Segurança extra

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    throw new Error(error.message)
  }

  redirect('/supplier/products')
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('supplier_id', user.id) // Segurança extra

  if (error) {
    console.error('Erro ao excluir produto:', error)
    throw new Error(error.message)
  }

  redirect('/supplier/products')
}