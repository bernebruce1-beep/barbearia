-- ============================================================
-- SEGURANÇA DO PAINEL ADMIN
-- Rode uma vez no Supabase: Dashboard → SQL Editor → Run.
--
-- Antes disso as funções admin_* podiam ser chamadas por
-- qualquer pessoa com a chave pública (que fica no site).
-- Depois disso só usuários logados (Supabase Auth) conseguem.
--
-- Crie o usuário do admin em: Authentication → Users → Add user.
-- Em Authentication → Providers → Email, desative "Allow new users
-- to sign up" para ninguém criar conta sozinho.
-- ============================================================

do $$
declare
    f record;
begin
    for f in
        select p.oid::regprocedure as assinatura
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname like 'admin\_%'
    loop
        execute format('revoke execute on function %s from public, anon', f.assinatura);
        execute format('grant execute on function %s to authenticated', f.assinatura);
        raise notice 'Protegida: %', f.assinatura;
    end loop;
end $$;
