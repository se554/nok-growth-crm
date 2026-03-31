-- Migration v4: presupuesto_aprobado en leads
-- Correr en: https://supabase.com/dashboard → SQL Editor

ALTER TABLE leads ADD COLUMN IF NOT EXISTS presupuesto_aprobado numeric(12,2);
