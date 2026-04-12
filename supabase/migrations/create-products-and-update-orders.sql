-- Tabela de Produtos (Gerenciada pelo Fornecedor)
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  
  -- Precificação
  base_cost NUMERIC(10, 2) NOT NULL,
  suggested_margin NUMERIC(10, 2) NOT NULL, -- Margem sugerida (valor fixo)
  
  -- Logística (Frete)
  weight_kg NUMERIC(8, 3) NOT NULL,
  length_cm NUMERIC(8, 2) NOT NULL,
  width_cm NUMERIC(8, 2) NOT NULL,
  height_cm NUMERIC(8, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Supplier/Admin podem ver, inserir, atualizar e deletar seus próprios produtos
CREATE POLICY "Supplier e Admin podem gerenciar produtos"
  ON public.products
  FOR ALL
  USING (public.is_supplier_or_admin());

-- Revendedores podem ver todos os produtos disponíveis
CREATE POLICY "Revendedores podem ver produtos do catálogo"
  ON public.products
  FOR SELECT
  USING (TRUE);


-- Tabela de Produtos do Revendedor (Catálogo próprio)
CREATE TABLE public.reseller_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  
  -- Precificação customizada do revendedor
  custom_margin NUMERIC(10, 2), -- Se nulo, usa a suggested_margin do produto
  
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(reseller_id, product_id)
);

ALTER TABLE public.reseller_products ENABLE ROW LEVEL SECURITY;

-- Revendedor pode gerenciar seus próprios produtos importados
CREATE POLICY "Revendedor gerencia seu catálogo"
  ON public.reseller_products
  FOR ALL
  USING (auth.uid() = reseller_id);


-- Atualização da Tabela de Orders existente
ALTER TABLE public.orders
  ADD COLUMN base_cost_total NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  ADD COLUMN reseller_margin_total NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  ADD COLUMN shipping_cost NUMERIC(10, 2) DEFAULT 0 NOT NULL,
  ADD COLUMN asaas_transaction_id TEXT;
