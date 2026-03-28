-- Nuevos campos en leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS pais text DEFAULT 'República Dominicana',
  ADD COLUMN IF NOT EXISTS tipo_propiedad text
    CHECK (tipo_propiedad IN ('apartamento','villa','penthouse','local_comercial','casa','otro')),
  ADD COLUMN IF NOT EXISTS tipologia text
    CHECK (tipologia IN ('studio','1_hab','2_hab','3_hab','4_hab_plus','villa_pequena','villa_grande','penthouse','local','otro')),
  ADD COLUMN IF NOT EXISTS ejecucion_nok boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS cedula text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS banco text,
  ADD COLUMN IF NOT EXISTS numero_cuenta text,
  ADD COLUMN IF NOT EXISTS nacionalidad text DEFAULT 'Dominicana';

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

-- Actualizar seed con datos de ejemplo para los nuevos campos
UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '2_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-1234567-1', whatsapp = '+1 809-555-0101',
  banco = 'Banco Popular', numero_cuenta = '814-123456-7', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE leads SET
  tipo_propiedad = 'villa', tipologia = 'villa_grande', pais = 'República Dominicana',
  ejecucion_nok = true, cedula = '001-2345678-2', whatsapp = '+1 829-555-0102',
  banco = 'Scotiabank', numero_cuenta = '012-654321-8', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000002';

UPDATE leads SET
  tipo_propiedad = 'penthouse', tipologia = 'penthouse', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-3456789-3', whatsapp = '+1 809-555-0103',
  banco = 'BHD León', numero_cuenta = '302-789012-3', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000003';

UPDATE leads SET
  tipo_propiedad = 'local_comercial', tipologia = 'local', pais = 'República Dominicana',
  ejecucion_nok = true, cedula = '001-4567890-4', whatsapp = '+1 849-555-0104',
  banco = 'Banco Popular', numero_cuenta = '814-345678-9', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000004';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '2_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-5678901-5', whatsapp = '+1 809-555-0105',
  banco = 'Asociación Popular', numero_cuenta = '705-456789-0', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000005';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '1_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-6789012-6', whatsapp = '+1 829-555-0106',
  banco = 'BHD León', numero_cuenta = '302-567890-1', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000006';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '1_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-7890123-7', whatsapp = '+1 809-555-0107',
  banco = 'Banreservas', numero_cuenta = '600-678901-2', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000007';

UPDATE leads SET
  tipo_propiedad = 'villa', tipologia = 'villa_grande', pais = 'República Dominicana',
  ejecucion_nok = true, cedula = '001-8901234-8', whatsapp = '+1 849-555-0108',
  banco = 'Scotiabank', numero_cuenta = '012-789012-3', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000008';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '2_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-9012345-9', whatsapp = '+1 809-555-0109',
  banco = 'Banco Popular', numero_cuenta = '814-890123-4', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000009';

UPDATE leads SET
  tipo_propiedad = 'local_comercial', tipologia = 'local', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-0123456-0', whatsapp = '+1 829-555-0110',
  banco = 'BHD León', numero_cuenta = '302-901234-5', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000010';

UPDATE leads SET
  tipo_propiedad = 'penthouse', tipologia = 'penthouse', pais = 'España',
  ejecucion_nok = true, whatsapp = '+34 600-111-222',
  banco = 'Banco Popular (RD)', numero_cuenta = '814-012345-6', nacionalidad = 'Española'
WHERE id = '11111111-0000-0000-0000-000000000011';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '3_hab', pais = 'República Dominicana',
  ejecucion_nok = true, cedula = '001-2134567-2', whatsapp = '+1 849-555-0112',
  banco = 'Banreservas', numero_cuenta = '600-123456-7', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000012';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '2_hab', pais = 'República Dominicana',
  ejecucion_nok = false, cedula = '001-3214567-3', whatsapp = '+1 809-555-0113',
  banco = 'BHD León', numero_cuenta = '302-234567-8', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000013';

UPDATE leads SET
  tipo_propiedad = 'villa', tipologia = 'villa_pequena', pais = 'Estados Unidos',
  ejecucion_nok = false, whatsapp = '+1 305-555-0114',
  banco = 'Scotiabank', numero_cuenta = '012-345678-9', nacionalidad = 'Dominicana (USA)'
WHERE id = '11111111-0000-0000-0000-000000000014';

UPDATE leads SET
  tipo_propiedad = 'apartamento', tipologia = '2_hab', pais = 'República Dominicana',
  ejecucion_nok = true, cedula = '001-5432167-5', whatsapp = '+1 809-555-0115',
  banco = 'Banco Popular', numero_cuenta = '814-456789-0', nacionalidad = 'Dominicana'
WHERE id = '11111111-0000-0000-0000-000000000015';
