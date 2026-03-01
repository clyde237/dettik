-- ============================================
-- Table: payments
-- Stocke les versements/remboursements
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_payments_debt_id ON public.payments(debt_id);
CREATE INDEX idx_payments_date ON public.payments(debt_id, payment_date);

-- ============================================
-- RLS
-- On sécurise via la relation avec debts
-- Un utilisateur ne peut voir que les payments
-- de ses propres debts
-- ============================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.debts
      WHERE debts.id = payments.debt_id
      AND debts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.debts
      WHERE debts.id = payments.debt_id
      AND debts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own payments"
  ON public.payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.debts
      WHERE debts.id = payments.debt_id
      AND debts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own payments"
  ON public.payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.debts
      WHERE debts.id = payments.debt_id
      AND debts.user_id = auth.uid()
    )
  );

-- ============================================
-- Trigger updated_at
-- ============================================

CREATE OR REPLACE TRIGGER on_payment_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();