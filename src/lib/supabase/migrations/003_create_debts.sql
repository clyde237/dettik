-- ============================================
-- Table: debts
-- Stocke les dettes ET les créances
-- Le champ "type" distingue les deux
-- ============================================

CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('debt', 'credit')),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
  remaining_amount DECIMAL(15,2) NOT NULL CHECK (remaining_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XAF',
  description TEXT,
  loan_date DATE NOT NULL,
  due_date DATE,
  interest_rate DECIMAL(5,2) CHECK (interest_rate >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Index pour les requêtes fréquentes
-- ============================================

CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_debts_user_type ON public.debts(user_id, type);
CREATE INDEX idx_debts_user_status ON public.debts(user_id, status);
CREATE INDEX idx_debts_person ON public.debts(person_id);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own debts"
  ON public.debts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Trigger : mettre à jour updated_at
-- ============================================

CREATE OR REPLACE TRIGGER on_debt_updated
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();