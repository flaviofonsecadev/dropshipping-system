-- Tabela de Lojas dos Revendedores

CREATE OR REPLACE FUNCTION public.is_reseller_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role IN ('admin', 'reseller');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE IF NOT EXISTS public.reseller_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  headline TEXT,
  about TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (reseller_id),
  UNIQUE (slug)
);

ALTER TABLE public.reseller_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reseller can manage own store"
  ON public.reseller_stores
  FOR ALL
  USING (auth.uid() = reseller_id)
  WITH CHECK (auth.uid() = reseller_id);

CREATE POLICY "Admin can manage reseller stores"
  ON public.reseller_stores
  FOR ALL
  USING (public.is_reseller_or_admin());

CREATE POLICY "Public can read published stores"
  ON public.reseller_stores
  FOR SELECT
  USING (is_published = true);

-- Storefront: permitir leitura pública de reseller_products apenas quando a loja estiver publicada e o item estiver ativo
CREATE POLICY "Public can read active reseller products for published stores"
  ON public.reseller_products
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1
      FROM public.reseller_stores s
      WHERE s.reseller_id = reseller_products.reseller_id
        AND s.is_published = true
    )
  );

-- Storage para branding da loja
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-branding', 'store-branding', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Reseller and Admin can list store-branding"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'store-branding'
    AND public.is_reseller_or_admin()
  );

CREATE POLICY "Reseller and Admin can upload to store-branding"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'store-branding'
    AND public.is_reseller_or_admin()
  );

CREATE POLICY "Reseller and Admin can update store-branding"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'store-branding'
    AND public.is_reseller_or_admin()
  );

CREATE POLICY "Reseller and Admin can delete from store-branding"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'store-branding'
    AND public.is_reseller_or_admin()
  );
