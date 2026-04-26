-- Tabela de Perfis
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'supplier', 'reseller', 'customer')) DEFAULT 'reseller' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (RLS Policies)

-- 1. Os usuários podem visualizar seu próprio perfil
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Administradores podem visualizar todos os perfis
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Administradores podem ver todos os perfis"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- 3. Os usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 4. Administradores podem atualizar todos os perfis
CREATE POLICY "Administradores podem atualizar todos os perfis"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- Função para auto-inserir perfil no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  desired_role TEXT;
BEGIN
  IF COALESCE(new.raw_user_meta_data->>'signup_origin', '') = 'storefront' THEN
    desired_role := 'customer';
  ELSE
    desired_role := 'reseller';
  END IF;

  INSERT INTO public.profiles (id, role)
  VALUES (new.id, desired_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado após a criação de um usuário no Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
