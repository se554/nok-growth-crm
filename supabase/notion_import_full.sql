-- ============================================================
-- NOK Growth CRM - Full Notion Import
-- Pipeline Growth Punta Cana
-- Generated: 2026-03-27
-- Total leads: 86
-- ============================================================

-- Dar un DEFAULT a la columna propiedad para que el import no falle
ALTER TABLE leads ALTER COLUMN propiedad SET DEFAULT 'Sin especificar';

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_estado_check;

UPDATE leads SET estado = 'cotizacion' WHERE estado = 'propuesta';
UPDATE leads SET estado = 'comprometido' WHERE estado = 'negociacion';
UPDATE leads SET estado = 'cerrado' WHERE estado = 'ganado';

ALTER TABLE leads ADD CONSTRAINT leads_estado_check CHECK (estado IN ('prospecto','contactado','cotizacion','comprometido','cerrado','perdido','en_espera','pendiente_contacto','pendiente_respuesta','pendiente_reunion'));

INSERT INTO leads (nombre, whatsapp, email, estado, fuente, zona, pais, proyecto, apartamento, prioridad, pendientes, fecha_ultimo_contacto)
VALUES
-- 1. Carlos Domenech Rubio
('Carlos Domenech Rubio', '17874325100', 'cdomen1174@gmail.com', 'perdido', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', 'C2-301', NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 2. Patricia Leon
('Patricia Leon', '18095170880', 'patsdeleon@gmail.com', 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'Jardines III', NULL, 'media', 'Pendiente enviar informacion a el propietario sobre la cotizacion', NOW() - INTERVAL '30 days'),

-- 3. Jessica Santiago
('Jessica Santiago', '16172305582', 'Jesssellsrealestate@gmail.com', 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'Dumas Lux', 'C1', 'media', 'esta pendiente aprobacion de presupuesto', NOW() - INTERVAL '30 days'),

-- 4. Akeem Richards
('Akeem Richards', '4373326232', 'akeem.richards1727@hotmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, NULL, 'No cuenta con WhatsApp', NOW() - INTERVAL '30 days'),

-- 5. Ana Vassallo
('Ana Vassallo', '6467324230', 'anahildap@gmail.com', 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'Lagoon', NULL, NULL, 'Enviar contrato, pagina web y Brochure via correo anahildap@gmail.com', NOW() - INTERVAL '30 days'),

-- 6. Lissette Nunez
('Lissette Nunez', '16313366860', NULL, 'comprometido', 'referido', 'Punta Cana', 'República Dominicana', 'Jardines III', NULL, 'media', 'ya se envio cotizacion esta pendiente informacion', NOW() - INTERVAL '30 days'),

-- 7. Yorquina
('Yorquina', '18299662607', NULL, 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'D 402', 'alta', 'Pendeinte informacio con la mama para cordinar fecha de entrega', NOW() - INTERVAL '30 days'),

-- 8. Manuel
('Manuel', '573015499367', NULL, 'perdido', 'referido', 'Punta Cana', 'República Dominicana', 'Jardines III', NULL, 'alta', 'Pendiente conracto el 22 de diciembre', NOW() - INTERVAL '30 days'),

-- 9. Ramona Lopez
('Ramona Lopez', '19087201255', 'korylopez1987@gmail.com', 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', NULL, 'A-019', 'alta', 'Interesada- posible reunion, por correo elec solicito WH mensaje', NOW() - INTERVAL '30 days'),

-- 10. Joely Ventura
('Joely Ventura', '3474997485', 'joely05@aol.com', 'comprometido', 'referido', 'Punta Cana', 'República Dominicana', 'Oasis del lago', NULL, NULL, 'Tramitar permiso ante la constructora para realizar visita y cotizar mobiliario-Jacuzzi  27-02-26 Realizo algunas compras y solicta volver a conversar a mitad  9-03-26 Contrato firmado esperando terminar obra', NOW() - INTERVAL '30 days'),

-- 11. Paola Pimentel
('Paola Pimentel', '8298704907', 'Paopimentel@gmail.com', 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', NULL, NULL, 'Pendiente enviar contrato y Brochure', NOW() - INTERVAL '30 days'),

-- 12. Edilenia Lara
('Edilenia Lara', '18097690236', 'edilenialara@hotmail.com', 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', 'C7-408', NULL, 'Recontactado 16-12', NOW() - INTERVAL '30 days'),

-- 13. Maria Alvarez
('Maria Alvarez', '8499154446', 'maria_alvarez09@hotmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 14. Shank
('Shank', '16788565614', NULL, 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'Sabana Vistacana', NULL, 'alta', 'Pendeinte revisar con el propietario para inciar las compras', NOW() - INTERVAL '30 days'),

-- 15. Dioniso
('Dioniso', '18097103767', NULL, 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'F-410', 'alta', 'Pendeinte recinri inmueble el dia lunes para la entrega', NOW() - INTERVAL '30 days'),

-- 16. Angel Rodriguez Rivera
('Angel Rodriguez Rivera', '17876173475', 'angelrodz475@gmail.com', 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'F-208', 'na', 'Propietario ya esta con nostros', NOW() - INTERVAL '30 days'),

-- 17. Celeste
('Celeste', '19179161733', NULL, 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'G-310', 'media', 'Pendienre revisar en enero con la propietaria importanets ervicio al cliente', NOW() - INTERVAL '30 days'),

-- 18. Isaura Taveras
('Isaura Taveras', '8298613945', 'iss-ta@hotmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 19. Sergio Gonzalez
('Sergio Gonzalez', '13472799623', 'segopa636@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Residences', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 20. Rachel Diaz
('Rachel Diaz', '8298808667', 'racheldiaz3025@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Urbe', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 21. Miguel Rosado
('Miguel Rosado', '2013009666', NULL, 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Garden', 'G1-211', 'na', 'Pendiente transferencia final', NOW() - INTERVAL '30 days'),

-- 22. Tom Steffen Veseth
('Tom Steffen Veseth', '4790608510', 'steffen@cicerodesign.no', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Melon Park', NULL, 'alta', 'Solicita reunion. en Ingles es noruego, interesado. 7-03-26 Santiago realiza reunion con el, propietario envia preguntas pdte respuesta', NOW() - INTERVAL '30 days'),

-- 23. Donnell
('Donnell', '12152753979', NULL, 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', 'Villa Vistacana', NULL, 'media', 'Recontactado 16-12', NOW() - INTERVAL '30 days'),

-- 24. Carlos Sued
('Carlos Sued', '18096570611', 'c.sued@suedechavarria.com', 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'F-310', 'na', 'Ya firmo contrato y va a salir live', NOW() - INTERVAL '30 days'),

-- 25. Sonia Hurliman
('Sonia Hurliman', '41791959977', NULL, 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'Oasis del lago', NULL, 'media', 'Levantamiento queda organizaod para enero', NOW() - INTERVAL '30 days'),

-- 26. Andrea Cordero
('Andrea Cordero', '7873180598', 'cordero.andrea89@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Garden', NULL, 'media', 'Reunion 24-03-26 5PM DOminicana', NOW() - INTERVAL '30 days'),

-- 27. Reynaldo Chevalier Ziba
('Reynaldo Chevalier Ziba', '7864053331', NULL, 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'media', '6 marzo - Atiende Santiago pendiente actualizacion', NOW() - INTERVAL '30 days'),

-- 28. Jose Maria Dominguez
('Jose Maria Dominguez', '8097739134', NULL, 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'media', '6 marzo - Atiende Santiago pendiente actualizacion', NOW() - INTERVAL '30 days'),

-- 29. Jessica The Towers
('Jessica The Towers', '18494796079', NULL, 'comprometido', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'D-307', 'media', 'Propietaria actualmente en el inmueble esta pendiente a que salga para que inicie operacion', NOW() - INTERVAL '30 days'),

-- 30. Ingrid
('Ingrid', NULL, NULL, 'cerrado', 'referido', 'Punta Cana', 'República Dominicana', 'The Towers', 'E 301', 'na', 'Pendiente que el inmueble salga a operacion', NOW() - INTERVAL '30 days'),

-- 31. Christian
('Christian', '8292629880', NULL, 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'media', 'Son Desarrolladores de proyectos , pendiente cita', NOW() - INTERVAL '30 days'),

-- 32. Danny
('Danny', '19177314411', NULL, 'cotizacion', 'referido', 'Punta Cana', 'República Dominicana', 'Sabana Vistacana', NULL, 'media', 'Se envio la cotizacion pendiente informacion en enero', NOW() - INTERVAL '30 days'),

-- 33. Joel Marquez
('Joel Marquez', '8296450316', NULL, 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Garden', NULL, 'alta', 'Visita 4 marzo 3.30 pm', NOW() - INTERVAL '30 days'),

-- 34. Virginia Lozano
('Virginia Lozano', '9709870393', 'valarq23@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Palms II', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 35. Katherine Nanita
('Katherine Nanita', '3476004774', 'knanita81@yahoo.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Park', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 36. Milqueylin Rodriguez
('Milqueylin Rodriguez', '7876432160', 'milqueylin2011@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Tropics Golf', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 37. Sergia Lluberes
('Sergia Lluberes', '8296036404', 'sergy-2@hotmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Cana loft', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 38. Maria Martinez
('Maria Martinez', '8299069690', 'tomasaria@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', 'A2- 401', 'media', 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 39. Maria Ramos
('Maria Ramos', '9883973309', 'mer6112@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, '301', 'media', 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 40. Roldan Perez
('Roldan Perez', '3475549542', 'roldan1783@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Luxury', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 41. Jose Mungarrieta
('Jose Mungarrieta', '7864449716', 'jmungarrieta@hotmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Melon paradise', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 42. Victor Alvarez
('Victor Alvarez', '8098820153', 'alvarez.victoreduardo@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 43. Manuel Alejandro Bordas Nina
('Manuel Alejandro Bordas Nina', '8294711581', 'M.BORDAS@LOGISTTICALEGAL.COM.DO', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Residences', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 44. Manuel Morales
('Manuel Morales', '8495642542', 'maca2429@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Oasis del lago', '21', 'media', 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 45. Emmanuel Oller
('Emmanuel Oller', '8293947202', 'oller223@gmail.com', 'pendiente_respuesta', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Lake', NULL, NULL, 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 46. Maria Rosa Federici Machado
('Maria Rosa Federici Machado', '8297534589', 'mariafedericim@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, 'VU82B', 'media', 'Pendeinte respuesta de el propietario', NOW() - INTERVAL '30 days'),

-- 47. Cristian Polanco
('Cristian Polanco', '8765646666', 'luzmariafarm@gmail.com', 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', 'Dumas Lux', NULL, NULL, 'LLamar en 2 semanas', NOW() - INTERVAL '30 days'),

-- 48. Jose Mawyin
('Jose Mawyin', '9175789436', 'perdomorosemary7@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Dumas Lux', 'E2', 'alta', 'Propietario solicita visita 3 marzo a las 10.30am se envia datos a santiago- Jaime', NOW() - INTERVAL '30 days'),

-- 49. Joan Asencio
('Joan Asencio', '8494329684', 'asencioj@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 50. Melvin Martinez
('Melvin Martinez', '8294236403', 'melvinmr@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 51. Katia Ortiz
('Katia Ortiz', '8093010098', 'katiaortiz2003@yahoo.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Sabado 11am - 21 marzo', NOW() - INTERVAL '30 days'),

-- 52. Aniake
('Aniake', '8493738877', 'smithaniake@icloud.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 53. Mario Manteuffell
('Mario Manteuffell', '8295268820', 'mario.manteuffel.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 54. Jhoany Sanchez
('Jhoany Sanchez', NULL, 'jhoany_sanchez@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 55. Jessica Mordechay
('Jessica Mordechay', '8099827304', NULL, 'prospecto', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Garden', NULL, 'alta', 'Se recontacta 24 marzo', NOW() - INTERVAL '30 days'),

-- 56. Gonzalo
('Gonzalo', NULL, 'gonhenderson@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 57. Andy Polanco 1
('Andy Polanco', NULL, 'polancoay@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 58. Andy Polanco 2 (second Notion entry for same person)
('Andy Polanco', NULL, 'polancoay@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 59. Yvelise Cantizano
('Yvelise Cantizano', NULL, 'ycantizanoa@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 60. Lissette Arias
('Lissette Arias', '8299169090', 'lisset.aria18@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 61. Jose Garcia
('Jose Garcia', '8095014387', 'robert1070@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 62. Jerry Lipinsky
('Jerry Lipinsky', NULL, 'jlipinski9@yahoo.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 63. Carlos Ogando
('Carlos Ogando', '8294221112', 'los.s03@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 64. Maria Delgado
('Maria Delgado', '8498673235', 'mariseladelgado006@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 65. Maria Jose
('Maria Jose', '8096962757', 'mvitienes@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 66. Manuel Antonio
('Manuel Antonio', '7187825973', 'manuelenriquez@live.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 67. Dorys Nunez
('Dorys Nunez', '51975414486', 'Dorysnunez@icloud.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 68. Reinter De Jesus
('Reinter De Jesus', '92923999016', 'reinterpalacio@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 69. Eva Taloni 1
('Eva Taloni', '4382202376', 'evataloni777@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 70. Eva Taloni 2 (second Notion entry)
('Eva Taloni', '7747374959', 'evatoloni777@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 71. Marlline Garcia
('Marlline Garcia', '4382202376', 'mgarcia919@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 72. Luc GAC
('Luc GAC', '5147777249', 'lgagnon007@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 73. Alexander Santana
('Alexander Santana', NULL, 'alexsantana26@yahoo.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 74. Julio Felix Silvestre
('Julio Felix Silvestre', '8299169090', 'lance13@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 75. Valerio Leal
('Valerio Leal', NULL, 'valerio-leal1@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 76. Fabio Gomez
('Fabio Gomez', '6464966240', 'villalonasalon@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 77. Anyelo Costa
('Anyelo Costa', NULL, 'anyelodoo@hotmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', 'Segumiento', NOW() - INTERVAL '30 days'),

-- 78. Cam Stevens (pre-fetched)
('Cam Stevens', '3166267096', 'stevencam@me.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 79. Wendy Cabrera (fetched)
('Wendy Cabrera', '7864491520', 'ediannygomez04@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', 'Panorama Garden', 'A11', 'media', 'Reunion programada martes 2pm 3-02-26', NOW() - INTERVAL '30 days'),

-- 80. Karla (pre-fetched)
('Karla', '8493579852', 'karlagon770@gmail.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 81. Manuel Antonio Enriquez (pre-fetched)
('Manuel Antonio Enriquez', '7747374959', 'Manuelenriquez@live.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 82. Jose Alexander Cabreja (pre-fetched)
('Jose Alexander Cabreja', '8099326810', 'jcabreja@cmsseguros.com.do', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 83. Pawell (pre-fetched)
('Pawell', NULL, 'dr_ozd@sbcglobal.net', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 84. Gabriel del Rio (pre-fetched)
('Gabriel del Rio', '2404725326', 'alexandramoquete@yahoo.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 85. soidiver berihuete (pre-fetched)
('soidiver berihuete', '9292581574', 'soidiver.34@icloud.com', 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days'),

-- 86. Noemi (pre-fetched)
('Noemi', NULL, NULL, 'contactado', 'referido', 'Punta Cana', 'República Dominicana', NULL, NULL, 'baja', NULL, NOW() - INTERVAL '30 days')

ON CONFLICT DO NOTHING;
