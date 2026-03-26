import { stripe } from "../config/stripe";
import { AppError } from "../middlewares/error.middleware";
import { User } from "../models/User";
import { Subscription, type SubscriptionInterval, type SubscriptionStatus } from "../models/Subscription";
import { env } from "../config/env";

function mapStripeStatusToAppStatus(status: string): SubscriptionStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "canceled" || status === "unpaid") return "cancelled";
  // past_due, incomplete_expired, etc.
  return "expired";
}

function getAmountPerMonthCents(interval: SubscriptionInterval) {
  if (interval === "monthly") return env.priceMonthlyAmountCents;
  return Math.round(env.priceYearlyAmountCents / 12);
}

export async function getSubscriptionStatus(userId: string) {
  const sub = await Subscription.findOne({ userId }).lean();
  if (!sub) return { status: "expired" as const };

  const now = new Date();
  const effectiveStatus: SubscriptionStatus =
    sub.status === "active" && sub.currentPeriodEnd
      ? new Date(sub.currentPeriodEnd) > now
        ? "active"
        : "expired"
      : sub.status;

  return {
    status: effectiveStatus,
    planInterval: sub.planInterval,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

export async function createCheckoutSession(userId: string, interval: SubscriptionInterval) {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404);

  const stripePriceId = interval === "monthly" ? env.stripePriceMonthlyId : env.stripePriceYearlyId;
  const amountPerMonthCents = getAmountPerMonthCents(interval);

  // Create customer on demand
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId }, { new: false });
  }

  // Store/prepare local subscription record (will become "active" on webhook).
  await Subscription.findOneAndUpdate(
    { userId },
    {
      userId,
      stripeCustomerId,
      planInterval: interval,
      status: "expired",
      amountPerMonthCents,
    },
    { upsert: true, new: true }
  );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: stripeCustomerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: env.stripeSuccessUrl + "&session_id={CHECKOUT_SESSION_ID}",
    cancel_url: env.stripeCancelUrl,
    allow_promotion_codes: true,
    metadata: {
      userId,
      planInterval: interval,
    },
  });

  if (!session.url) throw new AppError("Stripe session URL missing", 500);
  return { url: session.url, sessionId: session.id };
}

export async function handleStripeWebhook(reqBody: any, signature: string | undefined) {
  // This function is called after `constructEvent` in the route handler.
  const event = reqBody;

  const type = event.type as string;
  const dataObj = event.data?.object;
  if (!dataObj) return { received: true };

  if (type === "checkout.session.completed") {
    const userId = dataObj.metadata?.userId as string | undefined;
    if (!userId) return { received: true };
    const stripeSubscriptionId = dataObj.subscription as string | undefined;
    const stripeCustomerId = dataObj.customer as string | undefined;

    if (stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      const interval = (subscription.items.data[0]?.price.recurring?.interval ??
        dataObj.metadata?.planInterval ??
        "monthly") as SubscriptionInterval;
      const mappedStatus = mapStripeStatusToAppStatus(subscription.status);

      await Subscription.findOneAndUpdate(
        { userId },
        {
          userId,
          stripeCustomerId: stripeCustomerId ?? subscription.customer?.toString(),
          stripeSubscriptionId,
          planInterval: interval,
          status: mappedStatus,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          amountPerMonthCents: getAmountPerMonthCents(interval),
        },
        { upsert: true, new: true }
      );
    }

    return { received: true };
  }

  if (type === "customer.subscription.updated") {
    const stripeSubscriptionId = dataObj.id as string;
    const userId = dataObj.metadata?.userId as string | undefined;
    if (!userId) return { received: true };

    const interval = (dataObj.items?.data?.[0]?.price?.recurring?.interval ??
      dataObj.metadata?.planInterval ??
      "monthly") as SubscriptionInterval;
    const mappedStatus = mapStripeStatusToAppStatus(dataObj.status);

    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        stripeSubscriptionId,
        stripeCustomerId: dataObj.customer?.toString(),
        planInterval: interval,
        status: mappedStatus,
        currentPeriodStart: dataObj.current_period_start ? new Date(dataObj.current_period_start * 1000) : undefined,
        currentPeriodEnd: dataObj.current_period_end ? new Date(dataObj.current_period_end * 1000) : undefined,
        cancelAtPeriodEnd: dataObj.cancel_at_period_end ?? false,
        amountPerMonthCents: getAmountPerMonthCents(interval),
      },
      { upsert: true, new: true }
    );

    return { received: true };
  }

  if (type === "customer.subscription.deleted") {
    const stripeSubscriptionId = dataObj.id as string;
    const userId = dataObj.metadata?.userId as string | undefined;
    if (!userId) return { received: true };

    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        stripeSubscriptionId,
        status: "cancelled",
      },
      { upsert: true, new: true }
    );

    return { received: true };
  }

  return { received: true };
}

