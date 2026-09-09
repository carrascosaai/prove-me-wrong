import "server-only";
import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./env";

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe requested without STRIPE_SECRET_KEY");
  }
  // Pin to the SDK's own default API version to avoid type drift on upgrades.
  client ??= new Stripe(STRIPE_SECRET_KEY);
  return client;
}
