-- Importar leads desde Notion "Pipeline Growth Punta Cana"
-- Estado mapping: Cerrado→ganado, Comprometido→negociacion, Cotizacion→propuesta,
--   Perdido→perdido, Prospecto→prospecto, Pendiente Respuesta/Contactado/En espera/Pendiente reunion→contactado
-- Owner: NOK→ejecucion_nok=true, Propietario/Junio→ejecucion_nok=false

INSERT INTO leads (nombre, telefono, email, pais, estado, ejecucion_nok, fuente, probabilidad, propiedad, proyecto, apartamento, prioridad, pendientes, notas_rapidas, tipo_propiedad)
VALUES
(
  'Carlos Domenech Rubio',
  '+1 (787) 432-5100', 'cdomen1174@gmail.com',
  'Punta Cana', 'perdido', false, 'otro', 0,
  'Panorama Lake', 'Panorama Lake', 'C2-301', null,
  'Pendeinte respuesta de el propietario',
  'Se contacto al propietario', 'apartamento'
),
(
  'Patricia Leon',
  '+1 (809) 517-0880', 'patsdeleon@gmail.com',
  'Punta Cana', 'propuesta', true, 'otro', 50,
  'Jardines III', 'Jardines III', null, 'media',
  'Pendiente enviar informacion a el propietario sobre la cotizacion',
  'Se converso con ella sobre la propuesta', 'apartamento'
),
(
  'Jessica Santiago',
  '+1 (617) 230-5582', 'Jesssellsrealestate@gmail.com',
  'Punta Cana', 'propuesta', false, 'otro', 50,
  'Dumas Lux', 'Dumas Lux', 'C1', 'media',
  'Esta pendiente aprobacion de presupuesto',
  'Se contacto al propietario', 'apartamento'
),
(
  'Akeem Richards',
  '(437) 332-6232', 'akeem.richards1727@hotmail.com',
  'Punta Cana', 'contactado', true, 'otro', 30,
  'Sin proyecto', null, null, null,
  'No cuenta con WhatsApp',
  'Se contacto al propietario', 'apartamento'
),
(
  'Ana Vassallo',
  '(646) 732-4230', 'anahildap@gmail.com',
  'Punta Cana', 'propuesta', true, 'otro', 50,
  'Lagoon', 'Lagoon', null, null,
  'Enviar contrato, pagina web y Brochure via correo anahildap@gmail.com',
  'Se contacto al propietario', 'apartamento'
),
(
  'Ramon Antonio Hernandez Garcia',
  '+18182721568', null,
  'Punta Cana', 'perdido', false, 'otro', 0,
  'The Towers', 'The Towers', 'F-209', 'media',
  'Ya se hizo re-contacto',
  'Se envio presupuesto', 'apartamento'
),
(
  'Gregorio Medina',
  '+1 (954) 793-6279', 'gmedina77@hotmail.com',
  'Punta Cana', 'perdido', true, 'otro', 0,
  'The Village', 'The Village', null, 'baja',
  'Se recontacta 16-12',
  'Se envio primer Correo', 'apartamento'
),
(
  'Lissette Nunez',
  '+1 (631) 336-6860', null,
  'Punta Cana', 'negociacion', true, 'otro', 70,
  'Jardines III', 'Jardines III', null, 'media',
  'Ya se envio cotizacion, esta pendiente informacion',
  'Esta pendiente llamada', 'apartamento'
),
(
  'Yorquina',
  '+1 (829) 966-2607', null,
  'Punta Cana', 'propuesta', true, 'otro', 50,
  'The Towers', 'The Towers', 'D 402', 'alta',
  'Pendiente informacion con la mama para coordinar fecha de entrega',
  'Pendiente conversar con ella', 'apartamento'
),
(
  'Wanda Castillo',
  '(223) 278-5204', 'wandacastillo840@gmail.com',
  'Punta Cana', 'perdido', false, 'otro', 0,
  'Sin proyecto', null, null, 'baja',
  'Ya tiene otro Operador - Descartado',
  'Contactado', 'apartamento'
),
(
  'Cong Dang',
  '(647) 561-4134', 'YyzBjj@proton.me',
  'Punta Cana', 'perdido', false, 'otro', 0,
  'Sin proyecto', null, null, 'media',
  'Solo le interesa medias estadias',
  'Contactado', 'apartamento'
),
(
  'Manuel',
  '+57 301 5499367', null,
  'Punta Cana', 'perdido', true, 'otro', 0,
  'Jardines III', 'Jardines III', null, 'alta',
  'Pendiente contrato el 22 de diciembre',
  'Pendiente Informacion', 'apartamento'
),
(
  'Omar Briceno',
  '+1(321) 343-9450', null,
  'Punta Cana', 'perdido', false, 'otro', 0,
  'Panorama Garden', 'Panorama Garden', null, 'baja',
  'Ya se contacto la propietaria',
  'Se envio presupuesto', 'apartamento'
),
(
  'Ramona Lopez',
  '+1 (908) 720-1255', 'korylopez1987@gmail.com',
  'Punta Cana', 'prospecto', false, 'otro', 20,
  'Sin proyecto', null, 'A-019', 'alta',
  'Interesada - posible reunion, por correo solicito mensaje de WhatsApp',
  'Se realiza reunion se le explica el modelo', 'apartamento'
),
(
  'Joely Ventura',
  '(347) 499-7485', 'joely05@aol.com',
  'Punta Cana', 'negociacion', false, 'otro', 70,
  'Oasis del lago', 'Oasis del lago', null, null,
  'Tramitar permiso constructora para visita y cotizar mobiliario. 27-02-26: Realizo compras, solicita volver a conversar. 09-03-26: Contrato firmado esperando terminar obra',
  'Contrato en revision por parte de la propietaria', 'apartamento'
),
(
  'Paola Pimentel',
  '(829) 870-4907', 'Paopimentel@gmail.com',
  'Punta Cana', 'prospecto', true, 'otro', 20,
  'Panorama Lake', 'Panorama Lake', null, null,
  'Pendiente enviar contrato y Brochure',
  'Se contacto al propietario', 'apartamento'
),
(
  'Edilenia Lara',
  '(809) 769-0236', 'edilenialara@hotmail.com',
  'Punta Cana', 'contactado', false, 'otro', 30,
  'Panorama Lake', 'Panorama Lake', null, null,
  'Pendiente respuesta de el propietario',
  'Se contacto al propietario', 'apartamento'
),
(
  'Maria Alvarez',
  '(849) 915-4446', 'maria_alvarez09@hotmail.com',
  'Punta Cana', 'contactado', false, 'otro', 30,
  'Sin proyecto', null, null, null,
  'Pendiente respuesta de el propietario',
  'Se contacto al propietario', 'apartamento'
),
(
  'Shank',
  '+1 (678) 856-5614', null,
  'Punta Cana', 'ganado', true, 'otro', 100,
  'Sabana Vistacana', 'Sabana Vistacana', null, 'alta',
  'Pendiente revisar con el propietario para iniciar las compras',
  'Ya se realizo presupuesto, esta pendiente aprobacion', 'apartamento'
),
(
  'Dioniso',
  '+1 (809) 710-3767', null,
  'Punta Cana', 'ganado', true, 'otro', 100,
  'The Towers', 'The Towers', 'F-410', 'alta',
  'Pendiente recibir inmueble el dia lunes para la entrega',
  'Pendiente contacto con el propietario', 'apartamento'
),
(
  'Angel Rodriguez Rivera',
  '+1 (787) 617-3475', 'angelrodz475@gmail.com',
  'Punta Cana', 'ganado', false, 'otro', 100,
  'The Towers', 'The Towers', 'F-208', 'na',
  'Propietario ya esta con nosotros',
  'Propietario ya esta con nosotros', 'apartamento'
),
(
  'Celeste',
  '+1 917 916 1733', null,
  'Punta Cana', 'propuesta', true, 'otro', 50,
  'The Towers', 'The Towers', 'G-310', 'media',
  'Pendiente revisar en enero con la propietaria, importante servicio al cliente',
  'Tiene el contrato', 'apartamento'
),
(
  'Isaura Taveras',
  '(829) 861-3945', 'iss-ta@hotmail.com',
  'Punta Cana', 'contactado', false, 'otro', 30,
  'Sin proyecto', null, null, null,
  'Pendiente respuesta de el propietario',
  'Se contacto al propietario', 'apartamento'
),
(
  'Noemi',
  '+18574174934', null,
  'Punta Cana', 'ganado', false, 'otro', 100,
  'Unique', 'Unique', 'E-105', 'na',
  'Pendiente coordinar limpieza para que el inmueble salga a operacion',
  'Se envio presupuesto', 'apartamento'
),
(
  'Sergio Gonzalez',
  '+1(347) 279-9623', 'segopa636@gmail.com',
  'Punta Cana', 'contactado', false, 'otro', 30,
  'Residences', 'Residences', null, null,
  'Pendiente respuesta de el propietario',
  'Se contacto al propietario', 'apartamento'
);

-- Agregar evento de creacion para cada lead importado de Notion
INSERT INTO lead_eventos (lead_id, tipo, descripcion, autor)
SELECT id, 'creacion', 'Lead importado desde Notion Pipeline Growth Punta Cana. Fuente: ' || notas_rapidas, 'NOK Team'
FROM leads
WHERE pais = 'Punta Cana'
  AND created_at > now() - interval '1 minute';
