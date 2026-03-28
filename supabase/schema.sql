-- Tabla principal de leads/propietarios
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  nombre text not null,
  telefono text,
  email text,
  propiedad text not null,
  zona text,
  valor_mensual_estimado numeric(10,2),
  estado text not null default 'prospecto'
    check (estado in ('prospecto','contactado','propuesta','negociacion','ganado','perdido')),
  fuente text default 'otro'
    check (fuente in ('referido','instagram','web','llamada','whatsapp','otro')),
  probabilidad integer default 50 check (probabilidad between 0 and 100),
  fecha_ultimo_contacto timestamptz,
  notas_rapidas text,
  asignado_a text default 'Growth Team',
  numero_unidades integer default 1
);

-- Hoja de vida del negocio (todos los eventos cronológicos)
create table lead_eventos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  lead_id uuid references leads(id) on delete cascade,
  fecha timestamptz default now(),
  tipo text not null
    check (tipo in ('llamada','whatsapp','email','reunion','propuesta_enviada',
                    'contrato','nota','estado_cambiado','creacion','tarea')),
  descripcion text not null,
  autor text default 'NOK Team',
  estado_anterior text,
  estado_nuevo text,
  metadata jsonb default '{}'
);

-- Índices para performance
create index leads_estado_idx on leads(estado);
create index leads_fecha_ultimo_contacto_idx on leads(fecha_ultimo_contacto);
create index lead_eventos_lead_id_idx on lead_eventos(lead_id);
create index lead_eventos_fecha_idx on lead_eventos(fecha desc);

-- Función para actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- View útil para el dashboard: leads con días sin contacto calculados
create view leads_con_actividad as
select
  l.*,
  extract(day from now() - coalesce(l.fecha_ultimo_contacto, l.created_at))::integer
    as dias_sin_contacto,
  (select count(*) from lead_eventos e where e.lead_id = l.id) as total_eventos,
  (select e.descripcion from lead_eventos e
   where e.lead_id = l.id order by e.fecha desc limit 1) as ultimo_evento
from leads l;

-- RLS: habilitar pero permitir todo (app interna)
alter table leads enable row level security;
alter table lead_eventos enable row level security;

create policy "Allow all" on leads for all using (true) with check (true);
create policy "Allow all" on lead_eventos for all using (true) with check (true);
