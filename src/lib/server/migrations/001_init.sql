-- ============================================
-- Schéma Turso (libSQL / SQLite) — dettik
-- Traduit depuis les migrations Postgres/Supabase
-- ============================================
--
-- Différences notables avec le schéma Postgres d'origine :
--
--  * Les utilisateurs vivent désormais dans Clerk, plus dans auth.users.
--    profiles.id contient l'ID Clerk (ex: user_2abc…), c'est du TEXT et non
--    plus un UUID. Les colonnes user_id référencent profiles(id), ce qui
--    conserve le ON DELETE CASCADE que auth.users assurait avant.
--
--  * Plus de RLS : SQLite n'en a pas. Le cloisonnement par utilisateur est
--    appliqué dans chaque requête côté serveur (src/lib/server/queries/*),
--    et le token Turso ne quitte jamais le serveur.
--
--  * UUID -> TEXT (générés par crypto.randomUUID() côté JS, cf. utils/id.js)
--  * TIMESTAMPTZ / DATE -> TEXT au format ISO 8601 UTC, identique à ce que
--    produit Date.prototype.toISOString()
--  * DECIMAL(15,2) -> NUMERIC (affinité SQLite). Les montants restent
--    manipulés comme des nombres JS, exactement comme avant.
--  * Les triggers plpgsql updated_at deviennent des triggers SQLite.
--
-- Les clés étrangères doivent être activées par connexion :
--   PRAGMA foreign_keys = ON;  (fait dans src/lib/server/turso.js)

-- ============================================
-- Table: profiles
-- Préférences utilisateur. Une ligne par utilisateur Clerk.
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id                 TEXT PRIMARY KEY,
  email              TEXT,
  full_name          TEXT,
  preferred_currency TEXT NOT NULL DEFAULT 'XAF',
  preferred_language TEXT NOT NULL DEFAULT 'fr',
  preferred_theme    TEXT NOT NULL DEFAULT 'auto',
  created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ============================================
-- Table: persons
-- Créanciers et débiteurs
-- ============================================

CREATE TABLE IF NOT EXISTS persons (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  notes      TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_persons_user_id ON persons(user_id);
CREATE INDEX IF NOT EXISTS idx_persons_name    ON persons(user_id, name);

-- ============================================
-- Table: debts
-- Dettes ET créances, distinguées par le champ "type"
-- ============================================

CREATE TABLE IF NOT EXISTS debts (
  id               TEXT PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  person_id        TEXT NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
  type             TEXT NOT NULL CHECK (type IN ('debt', 'credit')),
  total_amount     NUMERIC NOT NULL CHECK (total_amount > 0),
  remaining_amount NUMERIC NOT NULL CHECK (remaining_amount >= 0),
  currency         TEXT NOT NULL DEFAULT 'XAF',
  description      TEXT,
  loan_date        TEXT NOT NULL,
  due_date         TEXT,
  interest_rate    NUMERIC CHECK (interest_rate >= 0),
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  archived_at      TEXT,
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_debts_user_id     ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_type   ON debts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_person      ON debts(person_id);

-- ============================================
-- Table: payments
-- Versements / remboursements
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id             TEXT PRIMARY KEY,
  debt_id        TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount         NUMERIC NOT NULL CHECK (amount > 0),
  payment_date   TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_payments_date    ON payments(debt_id, payment_date);

-- ============================================
-- Table: payment_proofs
-- Références aux fichiers preuves (stockés sur Vercel Blob)
-- ============================================

CREATE TABLE IF NOT EXISTS payment_proofs (
  id         TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  file_url   TEXT NOT NULL,
  file_name  TEXT NOT NULL,
  file_type  TEXT NOT NULL,
  file_size  INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_payment_id ON payment_proofs(payment_id);

-- ============================================
-- Triggers : updated_at
-- Équivalent de handle_updated_at() en plpgsql.
-- PRAGMA recursive_triggers est désactivé par défaut, l'UPDATE interne
-- ne redéclenche donc pas le trigger.
-- ============================================

CREATE TRIGGER IF NOT EXISTS trg_profiles_updated_at
AFTER UPDATE ON profiles FOR EACH ROW
BEGIN
  UPDATE profiles SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_persons_updated_at
AFTER UPDATE ON persons FOR EACH ROW
BEGIN
  UPDATE persons SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_debts_updated_at
AFTER UPDATE ON debts FOR EACH ROW
BEGIN
  UPDATE debts SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_payments_updated_at
AFTER UPDATE ON payments FOR EACH ROW
BEGIN
  UPDATE payments SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
