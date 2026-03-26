import dotenv from "dotenv";

dotenv.config();

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  httpPort: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  
  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  jwtSecret: must("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  stripeSecretKey: must("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: must("STRIPE_WEBHOOK_SECRET"),
  stripePriceMonthlyId: must("STRIPE_PRICE_MONTHLY_ID"),
  stripePriceYearlyId: must("STRIPE_PRICE_YEARLY_ID"),
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL ?? "http://localhost:5173/subscription?success=1",
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL ?? "http://localhost:5173/subscription?canceled=1",

  // Used to compute a per-month prize pool from paid subscriptions.
  // If yearly plan is double priced / special priced, reflect it via Stripe price metadata or update this config.
  priceMonthlyAmountCents: Number(process.env.PRICE_MONTHLY_AMOUNT_CENTS ?? "1000"),
  priceYearlyAmountCents: Number(process.env.PRICE_YEARLY_AMOUNT_CENTS ?? "10000"),

  // Winner proof upload
  winnerProofUploadDir: process.env.WINNER_PROOF_UPLOAD_DIR ?? "./uploads",

  // Bootstrap admin (for first-run usability). If no Admin exists and these are set,
  // the backend will create an Admin user automatically on startup.
  adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL,
  adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD,

  // Email notifications
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM,
};

