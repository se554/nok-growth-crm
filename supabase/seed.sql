-- ============================================================
-- SEED: 15 leads dominicanos con eventos realistas
-- ============================================================

-- Limpiar datos existentes (orden correcto por FK)
truncate table lead_eventos restart identity cascade;
truncate table leads restart identity cascade;

-- ============================================================
-- INSERT LEADS
-- ============================================================

insert into leads (id, nombre, telefono, email, propiedad, zona, valor_mensual_estimado, estado, fuente, probabilidad, fecha_ultimo_contacto, notas_rapidas, asignado_a, numero_unidades, created_at) values

-- 1. GANADO
('11111111-0000-0000-0000-000000000001',
 'María Elena Guzmán', '+1 809-555-0101', 'maria.guzman@gmail.com',
 'Apartamento Torre Anacaona', 'Piantini', 3500.00, 'ganado', 'referido', 100,
 now() - interval '2 days', 'Firmó contrato el 15 de marzo. Muy satisfecha con el servicio.',
 'Growth Team', 1, now() - interval '45 days'),

-- 2. GANADO
('11111111-0000-0000-0000-000000000002',
 'Roberto Familia Matos', '+1 829-555-0102', 'rfamilia@hotmail.com',
 'Villa Los Cacicazgos', 'Naco', 5200.00, 'ganado', 'instagram', 100,
 now() - interval '1 day', 'Propietario de villa con piscina. Quiere servicio premium.',
 'Growth Team', 1, now() - interval '60 days'),

-- 3. NEGOCIACIÓN (alta probabilidad, alerta verde)
('11111111-0000-0000-0000-000000000003',
 'Ana Patricia Díaz', '+1 809-555-0103', 'anadiaz@outlook.com',
 'Penthouse Residencial Bella Vista', 'Bella Vista', 6800.00, 'negociacion', 'referido', 85,
 now() - interval '3 days', 'Está comparando con otra empresa. Nuestro precio es mejor. Reunión confirmada viernes.',
 'Growth Team', 1, now() - interval '30 days'),

-- 4. NEGOCIACIÓN
('11111111-0000-0000-0000-000000000004',
 'Carlos Emilio Hernández', '+1 849-555-0104', 'chernandez@gmail.com',
 'Edificio Serralles Business', 'Serrallés', 4100.00, 'negociacion', 'web', 70,
 now() - interval '5 days', 'Tiene 2 locales comerciales que quiere poner en renta.',
 'Growth Team', 2, now() - interval '25 days'),

-- 5. PROPUESTA
('11111111-0000-0000-0000-000000000005',
 'Luisa Fernanda Peralta', '+1 809-555-0105', 'lperalta@gmail.com',
 'Apartamento Gazcue Colonial', 'Gazcue', 2800.00, 'propuesta', 'referido', 60,
 now() - interval '6 days', 'Le enviamos propuesta el lunes. Esperando respuesta.',
 'Growth Team', 1, now() - interval '20 days'),

-- 6. PROPUESTA
('11111111-0000-0000-0000-000000000006',
 'Jorge Luis Santos Mella', '+1 829-555-0106', 'jlsantos@gmail.com',
 'Torre Mirador Evaristo Morales', 'Evaristo Morales', 3900.00, 'propuesta', 'instagram', 55,
 now() - interval '8 days', 'Vio nuestro Instagram. Interesado en gestión completa.',
 'Growth Team', 1, now() - interval '15 days'),

-- 7. CONTACTADO (sin contacto 7 días - alerta amber)
('11111111-0000-0000-0000-000000000007',
 'Patricia Altagracia Reyes', '+1 809-555-0107', 'paltagracia@gmail.com',
 'Apartamento Los Prados Norte', 'Los Prados', 2200.00, 'contactado', 'llamada', 40,
 now() - interval '9 days', 'Llamó preguntando por comisiones. Prometió llamar de vuelta.',
 'Growth Team', 1, now() - interval '18 days'),

-- 8. CONTACTADO (sin contacto 10 días - alerta amber)
('11111111-0000-0000-0000-000000000008',
 'Miguel Ángel Taveras', '+1 849-555-0108', 'mtaveras@yahoo.com',
 'Villa Naco Premium', 'Naco', 4500.00, 'contactado', 'referido', 45,
 now() - interval '10 days', 'Referido por Roberto Familia. Tiene villa grande.',
 'Growth Team', 1, now() - interval '22 days'),

-- 9. CONTACTADO (sin contacto 15 días - alerta ROJA)
('11111111-0000-0000-0000-000000000009',
 'Rosario Tejeda Valentín', '+1 809-555-0109', 'rtejeda@gmail.com',
 'Apartamento Piantini Garden', 'Piantini', 3100.00, 'contactado', 'web', 35,
 now() - interval '15 days', 'Llenó formulario web. Difícil de contactar. Intentar WhatsApp.',
 'Growth Team', 1, now() - interval '28 days'),

-- 10. PROSPECTO (sin contacto 18 días - alerta ROJA URGENTE)
('11111111-0000-0000-0000-000000000010',
 'Fernando José Almonte', '+1 829-555-0110', 'fjalmonte@gmail.com',
 'Local Comercial Bella Vista', 'Bella Vista', 1800.00, 'prospecto', 'instagram', 25,
 now() - interval '18 days', 'Comentó en Instagram. No ha respondido mensajes.',
 'Growth Team', 1, now() - interval '35 days'),

-- 11. PROSPECTO (reciente)
('11111111-0000-0000-0000-000000000011',
 'Carmen Yolanda Flores', '+1 809-555-0111', 'cyflores@gmail.com',
 'Penthouse Serrallés Sunset', 'Serrallés', 7200.00, 'prospecto', 'referido', 50,
 now() - interval '2 days', 'Referida por Ana Díaz. Penthouse de lujo con terraza.',
 'Growth Team', 1, now() - interval '5 days'),

-- 12. PROSPECTO (reciente, sin contacto previo)
('11111111-0000-0000-0000-000000000012',
 'Ramón Enrique Polanco', '+1 849-555-0112', 'repolanco@outlook.com',
 'Edificio Los Prados Business Park', 'Los Prados', 5500.00, 'prospecto', 'web', 30,
 null, 'Llenó formulario ayer. Tiene edificio de 4 apartamentos.',
 'Growth Team', 4, now() - interval '1 day'),

-- 13. PERDIDO
('11111111-0000-0000-0000-000000000013',
 'Elena Margarita Castillo', '+1 809-555-0113', 'emcastillo@gmail.com',
 'Apartamento Gazcue Histórico', 'Gazcue', 1900.00, 'perdido', 'llamada', 0,
 now() - interval '20 days', 'Decidió ir con la competencia. Precio fue el factor.',
 'Growth Team', 1, now() - interval '50 days'),

-- 14. PERDIDO
('11111111-0000-0000-0000-000000000014',
 'Andrés Bienvenido Cruz', '+1 829-555-0114', 'abcruz@gmail.com',
 'Villa Naco Este', 'Naco', 3300.00, 'perdido', 'referido', 0,
 now() - interval '30 days', 'No quiso gestión externa. Prefiere manejar solo.',
 'Growth Team', 1, now() - interval '70 days'),

-- 15. CONTACTADO (sin contacto 21 días - URGENTE)
('11111111-0000-0000-0000-000000000015',
 'Valentina Suero Jiménez', '+1 809-555-0115', 'vsuero@gmail.com',
 'Apartamentos Evaristo 3 unidades', 'Evaristo Morales', 6000.00, 'contactado', 'instagram', 55,
 now() - interval '21 days', 'Tiene 3 apartamentos. Muy interesada pero no responde.',
 'Growth Team', 3, now() - interval '40 days');


-- ============================================================
-- INSERT EVENTOS (3-5 por lead)
-- ============================================================

insert into lead_eventos (lead_id, fecha, tipo, descripcion, autor, estado_anterior, estado_nuevo) values

-- Lead 1: María Elena Guzmán (GANADO)
('11111111-0000-0000-0000-000000000001', now() - interval '45 days', 'creacion', 'Lead creado por referido de cliente existente.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000001', now() - interval '40 days', 'llamada', 'Primera llamada. Muy interesada, tiene apartamento amueblado en Piantini.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000001', now() - interval '35 days', 'estado_cambiado', 'Avanzó a Contactado tras primera llamada exitosa.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000001', now() - interval '30 days', 'reunion', 'Reunión en oficina. Le explicamos el modelo de gestión completa. Muy receptiva.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000001', now() - interval '25 days', 'propuesta_enviada', 'Enviamos propuesta formal con comisiones y servicios incluidos.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000001', now() - interval '20 days', 'estado_cambiado', 'Pasó a Negociación. Pidió ajuste en comisión.', 'NOK Team', 'propuesta', 'negociacion'),
('11111111-0000-0000-0000-000000000001', now() - interval '10 days', 'estado_cambiado', 'Contrato firmado. ¡Lead ganado!', 'NOK Team', 'negociacion', 'ganado'),
('11111111-0000-0000-0000-000000000001', now() - interval '2 days', 'nota', 'Onboarding completado. Propiedad ya está en plataformas de renta.', 'NOK Team', null, null),

-- Lead 2: Roberto Familia (GANADO)
('11111111-0000-0000-0000-000000000002', now() - interval '60 days', 'creacion', 'Lead creado desde Instagram.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000002', now() - interval '55 days', 'whatsapp', 'Respondió DM de Instagram. Quiere saber más del servicio.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000002', now() - interval '50 days', 'llamada', 'Llamada larga. Villa con piscina y 4 habitaciones. Ocupación actual 40%.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000002', now() - interval '40 days', 'propuesta_enviada', 'Propuesta enviada con proyección de ingresos a 12 meses.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000002', now() - interval '30 days', 'contrato', 'Contrato firmado. Comisión acordada 18%.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000002', now() - interval '1 day', 'nota', 'Primera reserva confirmada para fin de semana. Cliente muy contento.', 'NOK Team', null, null),

-- Lead 3: Ana Patricia Díaz (NEGOCIACIÓN)
('11111111-0000-0000-0000-000000000003', now() - interval '30 days', 'creacion', 'Lead creado. Referida por María Guzmán.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000003', now() - interval '28 days', 'llamada', 'Primer contacto. Tiene penthouse en Bella Vista, quiere maximizar ingresos.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000003', now() - interval '25 days', 'estado_cambiado', 'Pasó a Contactado.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000003', now() - interval '20 days', 'reunion', 'Reunión en el penthouse. Propiedad espectacular. Vistas a la ciudad.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000003', now() - interval '15 days', 'propuesta_enviada', 'Enviamos propuesta. Valor estimado mayor al que esperaba.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000003', now() - interval '10 days', 'estado_cambiado', 'Está en negociación activa. Comparando con Airbnb directo.', 'NOK Team', 'propuesta', 'negociacion'),
('11111111-0000-0000-0000-000000000003', now() - interval '3 days', 'whatsapp', 'Le mandamos comparativo de resultados vs Airbnb directo. Reunión viernes.', 'NOK Team', null, null),

-- Lead 4: Carlos Hernández (NEGOCIACIÓN)
('11111111-0000-0000-0000-000000000004', now() - interval '25 days', 'creacion', 'Llegó por formulario web.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000004', now() - interval '22 days', 'llamada', 'Tiene 2 locales en Serrallés. Uno ocupado, uno vacío.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000004', now() - interval '18 days', 'email', 'Enviamos presentación corporativa y casos de éxito.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000004', now() - interval '12 days', 'reunion', 'Visita a los locales. Buena ubicación, necesitan pequeña inversión en mejoras.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000004', now() - interval '5 days', 'propuesta_enviada', 'Propuesta enviada para ambos locales con modelo de gestión.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000004', now() - interval '5 days', 'estado_cambiado', 'Entró en negociación. Quiere descuento por volumen.', 'NOK Team', 'propuesta', 'negociacion'),

-- Lead 5: Luisa Peralta (PROPUESTA)
('11111111-0000-0000-0000-000000000005', now() - interval '20 days', 'creacion', 'Referida por colega del trabajo.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000005', now() - interval '18 days', 'whatsapp', 'Primer contacto por WhatsApp. Apartamento en Gazcue histórico.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000005', now() - interval '15 days', 'llamada', 'Llamada. Apartamento de 2 habitaciones, amueblado. Ya tiene algunos huéspedes directos.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000005', now() - interval '10 days', 'estado_cambiado', 'Pasó a Propuesta tras llamada exitosa.', 'NOK Team', 'contactado', 'propuesta'),
('11111111-0000-0000-0000-000000000005', now() - interval '6 days', 'propuesta_enviada', 'Propuesta enviada. Esperando feedback.', 'NOK Team', null, null),

-- Lead 6: Jorge Santos (PROPUESTA)
('11111111-0000-0000-0000-000000000006', now() - interval '15 days', 'creacion', 'Comentó en post de Instagram sobre gestión vacacional.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000006', now() - interval '14 days', 'whatsapp', 'DM en Instagram. Interesado en servicio completo para torre de apartamentos.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000006', now() - interval '12 days', 'llamada', 'Llamada. Torre con 1 piso asignado a él, 4 apartamentos. Quiere gestión de los 4.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000006', now() - interval '10 days', 'estado_cambiado', 'Avanzó a Propuesta.', 'NOK Team', 'contactado', 'propuesta'),
('11111111-0000-0000-0000-000000000006', now() - interval '8 days', 'propuesta_enviada', 'Propuesta enviada con descuento por 4 unidades.', 'NOK Team', null, null),

-- Lead 7: Patricia Reyes (CONTACTADO - amber)
('11111111-0000-0000-0000-000000000007', now() - interval '18 days', 'creacion', 'Llamó al número de la empresa preguntando por servicios.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000007', now() - interval '16 days', 'llamada', 'Atendió la llamada. Apartamento en Los Prados, 1 habitación.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000007', now() - interval '14 days', 'estado_cambiado', 'Pasó a Contactado.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000007', now() - interval '9 days', 'nota', 'Prometió llamar de vuelta para esta semana. No lo hizo. Hacer seguimiento.', 'NOK Team', null, null),

-- Lead 8: Miguel Taveras (CONTACTADO - amber)
('11111111-0000-0000-0000-000000000008', now() - interval '22 days', 'creacion', 'Referido por Roberto Familia.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000008', now() - interval '20 days', 'llamada', 'Primera llamada. Villa grande en Naco, 5 habitaciones.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000008', now() - interval '18 days', 'reunion', 'Visitamos la villa. Excelente estado, piscina, terraza. Alto potencial.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000008', now() - interval '15 days', 'estado_cambiado', 'Pasó a Contactado. Quiere pensar.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000008', now() - interval '10 days', 'whatsapp', 'Le mandamos casos de éxito de villas similares. No respondió.', 'NOK Team', null, null),

-- Lead 9: Rosario Tejeda (CONTACTADO - ROJA 15 días)
('11111111-0000-0000-0000-000000000009', now() - interval '28 days', 'creacion', 'Llenó formulario en la web.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000009', now() - interval '25 days', 'llamada', 'Llamada sin respuesta. Dejé mensaje de voz.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000009', now() - interval '22 days', 'whatsapp', 'Respondió por WhatsApp. Apartamento en Piantini, bien ubicado.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000009', now() - interval '20 days', 'estado_cambiado', 'Pasó a Contactado tras respuesta de WhatsApp.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000009', now() - interval '15 days', 'llamada', 'Sin respuesta. Difícil de contactar. Intentar en diferentes horarios.', 'NOK Team', null, null),

-- Lead 10: Fernando Almonte (PROSPECTO - ROJA 18 días)
('11111111-0000-0000-0000-000000000010', now() - interval '35 days', 'creacion', 'Comentó en Instagram pero nunca respondió DM.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000010', now() - interval '30 days', 'whatsapp', 'Primer mensaje por WhatsApp. No respondió.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000010', now() - interval '25 days', 'llamada', 'Llamada sin respuesta.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000010', now() - interval '18 days', 'whatsapp', 'Último intento por WhatsApp. Sin respuesta. Marcar como frío.', 'NOK Team', null, null),

-- Lead 11: Carmen Flores (PROSPECTO reciente)
('11111111-0000-0000-0000-000000000011', now() - interval '5 days', 'creacion', 'Referida por Ana Díaz. Penthouse de lujo en Serrallés.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000011', now() - interval '3 days', 'llamada', 'Primera llamada. Muy interesada. Penthouse 300m² con terraza y jacuzzi.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000011', now() - interval '2 days', 'whatsapp', 'Mandó fotos del penthouse. Impresionante. Agendar visita esta semana.', 'NOK Team', null, null),

-- Lead 12: Ramón Polanco (PROSPECTO nuevo)
('11111111-0000-0000-0000-000000000012', now() - interval '1 day', 'creacion', 'Llenó formulario web ayer. Tiene edificio de 4 apartamentos en Los Prados.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000012', now() - interval '1 day', 'nota', 'Contactar hoy por teléfono. Alto potencial por volumen de unidades.', 'NOK Team', null, null),

-- Lead 13: Elena Castillo (PERDIDO)
('11111111-0000-0000-0000-000000000013', now() - interval '50 days', 'creacion', 'Lead creado desde llamada entrante.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000013', now() - interval '45 days', 'llamada', 'Primera llamada. Apartamento en Gazcue. Tiene inquilino actual.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000013', now() - interval '40 days', 'propuesta_enviada', 'Enviamos propuesta. Competencia también cotizó.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000013', now() - interval '30 days', 'llamada', 'Llamada. Dice que la otra empresa cobró menos comisión.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000013', now() - interval '20 days', 'estado_cambiado', 'Perdido. Eligió competencia por precio.', 'NOK Team', 'propuesta', 'perdido'),

-- Lead 14: Andrés Cruz (PERDIDO)
('11111111-0000-0000-0000-000000000014', now() - interval '70 days', 'creacion', 'Referido por familiar.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000014', now() - interval '65 days', 'reunion', 'Reunión en la villa. Le explicamos el servicio completo.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000014', now() - interval '60 days', 'propuesta_enviada', 'Propuesta enviada.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000014', now() - interval '50 days', 'llamada', 'Dice que prefiere manejarlo él mismo. Quería solo plataformas.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000014', now() - interval '30 days', 'estado_cambiado', 'Perdido. No quiere gestión externa.', 'NOK Team', 'propuesta', 'perdido'),

-- Lead 15: Valentina Suero (CONTACTADO - ROJA 21 días)
('11111111-0000-0000-0000-000000000015', now() - interval '40 days', 'creacion', 'Lead desde Instagram. Tiene 3 apartamentos en Evaristo Morales.', 'NOK Team', null, 'prospecto'),
('11111111-0000-0000-0000-000000000015', now() - interval '38 days', 'whatsapp', 'Respondió rápido al DM. Muy interesada, 3 aptos de 2 hab. cada uno.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000015', now() - interval '35 days', 'llamada', 'Llamada larga. Actualmente los alquila por separado con contratos anuales. Quiere cambiar a corto plazo.', 'NOK Team', null, null),
('11111111-0000-0000-0000-000000000015', now() - interval '32 days', 'estado_cambiado', 'Pasó a Contactado. Alto interés.', 'NOK Team', 'prospecto', 'contactado'),
('11111111-0000-0000-0000-000000000015', now() - interval '21 days', 'whatsapp', 'Mandé mensaje de seguimiento. Sin respuesta desde hace 3 semanas. URGENTE contactar.', 'NOK Team', null, null);
