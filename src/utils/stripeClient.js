import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ stripeClient যেখান থেকেই import হোক, root .env load হবে
dotenv.config({ path: path.join(__dirname, "../../.env") });

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error("STRIPE_SECRET_KEY missing in .env");
}

export const stripe = new Stripe(key, {
  apiVersion: "2024-06-20",
});
export default stripe;