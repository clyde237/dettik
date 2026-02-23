-- ============================================
-- Table: persons
-- Stocke les créanciers et débiteurs
-- ============================================

CREATE TABLE IF NOT EXISTS public.persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Index pour les recherches rapides
-- ============================================

CREATE INDEX idx_persons_user_id ON public.persons(user_id);
CREATE INDEX idx_persons_name ON public.persons(user_id, name);

-- ============================================
-- RLS (Row Level Security)
-- Chaque utilisateur ne voit QUE ses personnes
-- ============================================

ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Lecture : uniquement ses propres personnes
CREATE POLICY "Users can read own persons"
  ON public.persons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Création : uniquement pour soi-même
CREATE POLICY "Users can insert own persons"
  ON public.persons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification : uniquement ses propres personnes
CREATE POLICY "Users can update own persons"
  ON public.persons
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Suppression : uniquement ses propres personnes
CREATE POLICY "Users can delete own persons"
  ON public.persons
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Trigger : mettre à jour updated_at
-- ============================================

CREATE OR REPLACE TRIGGER on_person_updated
  BEFORE UPDATE ON public.persons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();