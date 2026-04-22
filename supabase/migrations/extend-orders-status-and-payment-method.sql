alter table if exists public.orders
  drop constraint if exists orders_status_check;

alter table if exists public.orders
  add constraint orders_status_check
  check (status in ('Processando','Enviado','Entregue','Cancelado','Pendente Pagamento','Erro Pagamento','Pago'));

alter table if exists public.orders
  drop constraint if exists orders_payment_method_check;

alter table if exists public.orders
  add constraint orders_payment_method_check
  check (payment_method in ('PIX','Cartão','Boleto'));

