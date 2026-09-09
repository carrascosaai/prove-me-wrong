import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { markPredictionPro } from "@/lib/db";
import { HAS_DB_WRITE, STRIPE_WEBHOOK_SECRET } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

// Stripe needs the raw body — disable Next's parsing.
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const slug =
      session.metadata?.slug ?? session.client_reference_id ?? undefined;

    if (session.payment_status === "paid" && slug) {
      await markPredictionPro(slug);

      if (HAS_DB_WRITE) {
        await supabaseAdmin()
          .from("orders")
          .upsert(
            {
              stripe_session_id: session.id,
              prediction_slug: slug,
              product: session.metadata?.product ?? "pro_prediction",
              amount: session.amount_total ?? 0,
              currency: session.currency ?? "eur",
              status: "paid",
            },
            { onConflict: "stripe_session_id" },
          );
      }
    }
  }

  return NextResponse.json({ received: true });
}
