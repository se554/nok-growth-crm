-- Nuevos campos Notion: proyecto, apartamento, prioridad, pendientes
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS proyecto text,
  ADD COLUMN IF NOT EXISTS apartamento text,
  ADD COLUMN IF NOT EXISTS prioridad text
    CHECK (prioridad IN ('alta', 'media', 'baja', 'na')),
  ADD COLUMN IF NOT EXISTS pendientes text;

-- Recrear la view para incluir los nuevos campos
DROP VIEW IF EXISTS leads_con_actividad;
CREATE VIEW leads_con_actividad AS
SELECT
  l.*,
  extract(day from now() - coalesce(l.fecha_ultimo_contacto, l.created_at))::integer
    AS dias_sin_contacto,
  (SELECT count(*) FROM lead_eventos e WHERE e.lead_id = l.id) AS total_eventos,
  (SELECT e.descripcion FROM lead_eventos e
   WHERE e.lead_id = l.id ORDER BY e.fecha DESC LIMIT 1) AS ultimo_evento
FROM leads l;
