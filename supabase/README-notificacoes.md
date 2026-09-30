# Notificações push do painel

- Chaves VAPID e segredo do webhook ficam no Vault do Supabase
  (push_vapid_publica, push_vapid_privada, push_webhook_segredo).
- Aparelhos cadastrados: tabela public.push_inscricoes (sem acesso direto).
- Quando um cliente agenda pelo site, _criar_agendamento chama
  _avisar_push, que faz um POST (pg_net) para a Edge Function
  avisar-agendamento, que envia o push para todos os aparelhos.
