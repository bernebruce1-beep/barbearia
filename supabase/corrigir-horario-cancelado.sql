-- Horário cancelado voltava a ficar livre só no site, mas o banco
-- recusava: o índice único antigo contava também os cancelados.
-- (Já aplicado no Supabase.)

create unique index if not exists agendamento_unico_ativo
    on public.agendamentos (barbeiro_id, data_agendamento, horario)
    where status <> 'cancelado';

drop index if exists public.agendamento_unico;
