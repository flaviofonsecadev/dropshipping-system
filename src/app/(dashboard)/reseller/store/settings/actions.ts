'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isValidExternalUrl, normalizeStorefrontSettings } from '@/lib/storefront-settings'

function toKebabCase(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function upsertResellerStoreAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = String(formData.get('name') ?? '').trim()
  const slugInput = String(formData.get('slug') ?? '').trim()

  if (!name) {
    redirect('/reseller/store/settings?error=missing_name')
  }

  const slug = toKebabCase(slugInput || name)
  if (!slug) {
    redirect('/reseller/store/settings?error=missing_slug')
  }

  const { data: existingSlug } = await supabase
    .from('reseller_stores')
    .select('reseller_id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingSlug?.reseller_id && existingSlug.reseller_id !== user.id) {
    redirect('/reseller/store/settings?error=slug_taken')
  }

  const logo_url = String(formData.get('logo_url') ?? '').trim() || null
  const banner_url = String(formData.get('banner_url') ?? '').trim() || null
  const primary_color = String(formData.get('primary_color') ?? '').trim() || null
  const accent_color = String(formData.get('accent_color') ?? '').trim() || null
  const headline = String(formData.get('headline') ?? '').trim() || null
  const about = String(formData.get('about') ?? '').trim() || null
  const is_published = String(formData.get('is_published') ?? '') === 'true'

  let storefront_settings = normalizeStorefrontSettings(null)
  const rawSettings = formData.get('storefront_settings')
  if (typeof rawSettings === 'string' && rawSettings.trim()) {
    try {
      storefront_settings = normalizeStorefrontSettings(JSON.parse(rawSettings))
    } catch {
      redirect('/reseller/store/settings?error=invalid_storefront_settings')
    }
  }

  if (storefront_settings.topbar.enabled && storefront_settings.topbar.contact_target === 'external') {
    if (!storefront_settings.topbar.contact_url || !isValidExternalUrl(storefront_settings.topbar.contact_url)) {
      redirect('/reseller/store/settings?error=invalid_contact_url')
    }
  }

  const { error } = await supabase
    .from('reseller_stores')
    .upsert(
      {
        reseller_id: user.id,
        slug,
        name,
        is_published,
        logo_url,
        banner_url,
        primary_color,
        accent_color,
        headline,
        about,
        storefront_settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'reseller_id' }
    )

  if (error) {
    redirect('/reseller/store/settings?error=save_failed')
  }

  redirect('/reseller/store/settings?saved=1')
}
