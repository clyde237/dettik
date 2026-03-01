-- ============================================
-- Table: payment_proofs
-- Stocke les références aux fichiers preuves
-- Les fichiers sont dans Supabase Storage
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Index
-- ============================================

CREATE INDEX idx_payment_proofs_payment_id ON public.payment_proofs(payment_id);

-- ============================================
-- RLS (via payments → debts)
-- ============================================

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own proofs"
  ON public.payment_proofs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      JOIN public.debts ON debts.id = payments.debt_id
      WHERE payments.id = payment_proofs.payment_id
      AND debts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own proofs"
  ON public.payment_proofs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.payments
      JOIN public.debts ON debts.id = payments.debt_id
      WHERE payments.id = payment_proofs.payment_id
      AND debts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own proofs"
  ON public.payment_proofs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.payments
      JOIN public.debts ON debts.id = payments.debt_id
      WHERE payments.id = payment_proofs.payment_id
      AND debts.user_id = auth.uid()
    )
  );