CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.invoices (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number  text UNIQUE NOT NULL,
  amount          decimal(10,2) NOT NULL DEFAULT 0.00,
  currency        text DEFAULT 'USD' CHECK (currency IN ('USD', 'CLP', 'EUR')),
  status          text DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  issued_at       timestamptz DEFAULT now(),
  due_at          timestamptz,
  pdf_url         text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own invoices" ON public.invoices
FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE TRIGGER trg_invoices_updated
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
