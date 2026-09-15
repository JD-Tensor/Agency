// Supabase Edge Function: admin-users
//
// Creates, resets, and deletes Supabase Auth logins for team members and
// client portal accounts. This needs the service role key, so it must run on
// the server and never in the browser.
//
// Deploy: npx supabase functions deploy admin-users --project-ref <ref>

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Kind = 'user' | 'client';
type Action = 'provision' | 'delete';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const generateTemporaryPassword = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8)}!`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identify the caller from their session token.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    auth: { persistSession: false },
  });
  const { data: callerAuth } = await callerClient.auth.getUser();
  if (!callerAuth?.user) return json({ error: 'Not signed in' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: actor } = await admin
    .from('users')
    .select('id, roleLevel, status')
    .eq('auth_user_id', callerAuth.user.id)
    .maybeSingle();
  if (!actor || actor.status === 'offboarded') {
    return json({ error: 'Only active team members can manage accounts' }, 403);
  }

  let body: { action?: Action; kind?: Kind; id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  const { action, kind, id } = body;
  if (!id || (kind !== 'user' && kind !== 'client') || (action !== 'provision' && action !== 'delete')) {
    return json({ error: 'Expected { action: provision|delete, kind: user|client, id }' }, 400);
  }

  const table = kind === 'user' ? 'users' : 'clients';
  const { data: target, error: targetError } = await admin
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (targetError) return json({ error: targetError.message }, 500);
  if (!target) return json({ error: 'Account not found' }, 404);

  // Same hierarchy rules as the database policies.
  const actorLevel = Number(actor.roleLevel) || 0;
  const allowed = kind === 'user'
    ? actorLevel >= 60 && Number(target.roleLevel) < actorLevel
    : actorLevel >= 60;
  if (!allowed) {
    return json({ error: 'Hierarchy violation: you cannot manage this account' }, 403);
  }

  if (action === 'delete') {
    if (target.auth_user_id) {
      const { error } = await admin.auth.admin.deleteUser(target.auth_user_id);
      if (error) return json({ error: error.message }, 500);
    }
    const { error } = await admin.from(table).delete().eq('id', id);
    if (error) return json({ error: error.message }, 500);
    return json({ success: true });
  }

  // provision: create the login, or issue a new temporary password.
  const temporaryPassword = generateTemporaryPassword();
  let authUserId: string = target.auth_user_id;

  if (authUserId) {
    const { error } = await admin.auth.admin.updateUserById(authUserId, { password: temporaryPassword });
    if (error) return json({ error: error.message }, 500);
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: target.email,
      password: temporaryPassword,
      email_confirm: true,
    });
    if (error || !created.user) {
      return json({ error: error?.message ?? 'Could not create login' }, 400);
    }
    authUserId = created.user.id;
  }

  const { error: linkError } = await admin
    .from(table)
    .update({
      auth_user_id: authUserId,
      mustChangePassword: true,
      generatedAt: new Date().toISOString(),
    })
    .eq('id', id);
  if (linkError) return json({ error: linkError.message }, 500);

  return json({ success: true, temporaryPassword });
});
