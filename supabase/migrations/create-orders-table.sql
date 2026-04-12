-- Tabela de Pedidos
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  customer_name TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('Processando', 'Enviado', 'Entregue', 'Cancelado')) DEFAULT 'Processando' NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('PIX', 'Cartão', 'Boleto')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1. O Revendedor pode ver apenas os seus próprios pedidos
CREATE POLICY "Revendedores podem ver seus próprios pedidos"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = reseller_id);

-- 2. O Fornecedor (Supplier) e o Admin podem ver todos os pedidos
CREATE OR REPLACE FUNCTION public.is_supplier_or_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM public.profiles WHERE id = auth.uid();
  RETURN _role IN ('admin', 'supplier');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Supplier e Admin podem ver todos os pedidos"
  ON public.orders
  FOR SELECT
  USING (public.is_supplier_or_admin());

-- 3. O Revendedor pode criar novos pedidos
CREATE POLICY "Revendedores podem criar pedidos"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = reseller_id);

-- 4. O Supplier/Admin pode atualizar qualquer pedido (ex: mudar status)
CREATE POLICY "Supplier e Admin podem atualizar pedidos"
  ON public.orders
  FOR UPDATE
  USING (public.is_supplier_or_admin());
