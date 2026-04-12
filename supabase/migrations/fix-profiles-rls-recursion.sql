-- 1. Remover políticas antigas que causam recursão infinita
DROP POLICY IF EXISTS "Administradores podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Administradores podem atualizar todos os perfis" ON public.profiles;

-- 2. Criar uma função SECURITY DEFINER para checar se o usuário é admin
-- Isso permite ler a tabela de profiles sem disparar o RLS novamente (evita a recursão)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar as políticas de admin usando a nova função
CREATE POLICY "Administradores podem ver todos os perfis"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Administradores podem atualizar todos os perfis"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());
