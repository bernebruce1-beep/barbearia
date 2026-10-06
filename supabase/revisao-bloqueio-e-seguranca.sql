-- (Já aplicado no Supabase.)
-- admin_bloquear_horario passou a checar conflito pela duração real do
-- atendimento; verificar_conflito_horario com search_path fixo;
-- get_booked_slots (não usada) fechada para acesso público.
alter function public.verificar_conflito_horario() set search_path = public;
revoke execute on function public.get_booked_slots(date, bigint) from public, anon;
