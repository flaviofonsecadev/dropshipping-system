-- Atualizar tabela profiles com novos campos
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS document_id TEXT;

-- Atualizar o trigger para popular o e-mail na criação
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'reseller');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
