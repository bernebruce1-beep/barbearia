-- Cadastro de clientes (rode no SQL Editor do Supabase)

create table if not exists public.clientes (
    id bigint generated always as identity primary key,
    nome text not null,
    telefone text not null unique,
    aceita_promocoes boolean not null default true,
    criado_em timestamptz not null default now()
);

alter table public.clientes enable row level security;
-- Sem policies: o acesso é feito só pelas funções abaixo.

create or replace function public.cadastrar_cliente(
    p_nome text,
    p_telefone text,
    p_aceita_promocoes boolean default true
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_telefone text := regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g');
begin
    if length(trim(coalesce(p_nome, ''))) < 2 or length(v_telefone) < 10 then
        raise exception 'Dados inválidos';
    end if;

    insert into clientes (nome, telefone, aceita_promocoes)
    values (left(trim(p_nome), 100), v_telefone, coalesce(p_aceita_promocoes, true))
    on conflict (telefone) do update
        set nome = excluded.nome,
            aceita_promocoes = excluded.aceita_promocoes;
end;
$$;

create or replace function public.admin_list_clientes()
returns setof public.clientes
language sql
security definer
set search_path = public
as $$
    select * from clientes order by criado_em desc;
$$;

grant execute on function public.cadastrar_cliente(text, text, boolean) to anon, authenticated;
grant execute on function public.admin_list_clientes() to anon, authenticated;
