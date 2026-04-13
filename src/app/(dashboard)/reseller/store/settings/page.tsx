import { createClient } from '@/utils/supabase/server'
import { StoreSettingsForm } from './store-settings-form'

export default async function ResellerStoreSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const resolvedSearchParams = await searchParams
  const saved = resolvedSearchParams.saved === '1'
  const error = typeof resolvedSearchParams.error === 'string' ? resolvedSearchParams.error : null

  const { data: store } = user
    ? await supabase.from('reseller_stores').select('*').eq('reseller_id', user.id).maybeSingle()
    : { data: null }

  return <StoreSettingsForm store={store} saved={saved} error={error} />
}
