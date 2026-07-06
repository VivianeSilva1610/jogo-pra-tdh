import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const APP_URL   = Deno.env.get('APP_URL')        || 'https://jogo-pra-tdh.vercel.app';
const PRICE_ID  = Deno.env.get('STRIPE_PRICE_ID')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // ── Auth ─────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response('Unauthorized', { status: 401 });

    const parentId    = user.id;
    const parentEmail = user.email!;

    const { type = 'checkout' } = await req.json().catch(() => ({}));

    // Admin client (ignora RLS)
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── Buscar ou criar customer no Stripe ───────────────────
    const { data: sub } = await admin
      .from('subscriptions')
      .select('provider_customer_id')
      .eq('parent_id', parentId)
      .maybeSingle();

    let customerId: string = sub?.provider_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: parentEmail,
        metadata: { parent_id: parentId },
      });
      customerId = customer.id;
      await admin.from('subscriptions').upsert(
        { parent_id: parentId, plan: 'free', provider: 'stripe', provider_customer_id: customerId },
        { onConflict: 'parent_id' }
      );
    }

    // ── Checkout ou Portal ───────────────────────────────────
    if (type === 'portal') {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: APP_URL,
      });
      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer:    customerId,
      mode:        'subscription',
      line_items:  [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/?payment=success`,
      cancel_url:  `${APP_URL}/?payment=cancel`,
      metadata:    { parent_id: parentId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });

  } catch (err) {
    console.error('stripe-checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status:  500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});
