import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const sig  = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {

      // Pagamento confirmado → ativar Premium
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const parentId = session.metadata?.parent_id;
        if (!parentId) { console.warn('parent_id ausente no metadata'); break; }

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await admin.from('subscriptions').upsert({
          parent_id:                parentId,
          plan:                     'premium',
          provider:                 'stripe',
          provider_subscription_id: sub.id,
          provider_customer_id:     sub.customer as string,
          current_period_end:       new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: 'parent_id' });
        break;
      }

      // Renovação ou mudança de status
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription;
        const active = ['active', 'trialing'].includes(sub.status);
        await admin.from('subscriptions')
          .update({
            plan:               active ? 'premium' : 'free',
            current_period_end: active
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          })
          .eq('provider_customer_id', sub.customer as string);
        break;
      }

      // Cancelamento
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await admin.from('subscriptions')
          .update({ plan: 'free', current_period_end: null })
          .eq('provider_customer_id', sub.customer as string);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
