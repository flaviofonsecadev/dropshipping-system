-- Migration: alter-products-media
-- Remove image_url, add images and videos
ALTER TABLE public.products DROP COLUMN IF EXISTS image_url;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS videos TEXT[];

-- Create product-media bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for product-media bucket
-- Permitir que apenas Fornecedores e Admins listem os arquivos do bucket (evita warning de listagem pública)
CREATE POLICY "Supplier and Admin can list product-media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product-media' AND 
  public.is_supplier_or_admin()
);

-- Allow Supplier and Admin to insert
CREATE POLICY "Supplier and Admin can upload to product-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' AND 
  public.is_supplier_or_admin()
);

-- Allow Supplier and Admin to update
CREATE POLICY "Supplier and Admin can update product-media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-media' AND 
  public.is_supplier_or_admin()
);

-- Allow Supplier and Admin to delete
CREATE POLICY "Supplier and Admin can delete from product-media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-media' AND 
  public.is_supplier_or_admin()
);
