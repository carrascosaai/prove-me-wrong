import { NextResponse } from "next/server";
import { getPredictionBySlug } from "@/lib/db";
import { PRO_PRICE_CENTS, STRIPE_LIVE, STRIPE_PRICE_PRO } from "@/lib/env";
import { siteUrl } from "@/lib/site";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  let slug = "";
  try {
    const body = (await req.json()) as { slug?: string };
    slug = String(body.slug ?? "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const p = await getPredictionBySlug(slug);
  if (!p) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }
  if (p.is_pro) {
    return NextResponse.json({ url: `/p/${slug}` });
  }

  // Simulation mode — no Stripe contact.
  if (!STRIPE_LIVE) {
    return NextResponse.json({ url: `/pro/${slug}/simulate` });
  }

  try {
    const origin = await siteUrl();
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/pro/success?slug=${slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro/${slug}`,
      client_reference_id: slug,
      metadata: { slug, product: "pro_prediction" },
      line_items: [
        STRIPE_PRICE_PRO
          ? { price: STRIPE_PRICE_PRO, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: PRO_PRICE_CENTS,
                product_data: {
                  name: "PRO prediction",
                  description: `Upgrade for prediction ${slug}`,
                },
              },
            },
      ],
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("stripe checkout error", err);
    return NextResponse.json(
      { error: "Payment provider error" },
      { status: 502 },
    );
  }
}
