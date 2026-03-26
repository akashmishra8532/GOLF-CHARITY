import nodemailer from "nodemailer";
import { env } from "../config/env";

function transporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.emailFrom) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort ? env.smtpPort === 465 : false,
    auth: { user: env.smtpUser, pass: env.smtpPass },
  });
}

export async function sendEmail(params: { to: string; subject: string; text: string; html?: string }) {
  const t = transporter();
  if (!t) {
    // If SMTP isn't configured, silently skip (still functional without email).
    return { skipped: true };
  }

  await t.sendMail({
    from: env.emailFrom,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });

  return { skipped: false };
}

// Email Templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: "Welcome to the Golf Charity Subscription Platform!",
    text: `Hi ${userName},

Welcome to our platform where your golf scores can make a difference!

Here's what you can do:
• Enter your latest 5 golf scores in Stableford format
• Participate in monthly prize draws
• Support your chosen charity with every subscription
• Track your winnings and charitable impact

Get started by entering your scores and exploring our charity partners.

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Welcome to the Golf Charity Platform!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to our platform where your golf scores can make a difference!</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get Started:</h3>
          <ul>
            <li>Enter your latest 5 golf scores in Stableford format</li>
            <li>Participate in monthly prize draws</li>
            <li>Support your chosen charity with every subscription</li>
            <li>Track your winnings and charitable impact</li>
          </ul>
        </div>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  }),

  subscriptionConfirmation: (userName: string, plan: string, nextBilling: string) => ({
    subject: "Subscription Confirmed - Welcome to the Golf Charity Platform!",
    text: `Hi ${userName},

Your ${plan} subscription has been successfully activated!

Next billing date: ${nextBilling}

You now have access to:
• Monthly prize draws with multiple winning tiers
• Score tracking and management
• Charity contribution tracking
• Winner verification and payout system

Thank you for joining our community of golfers making a difference!

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Subscription Confirmed! 🎉</h2>
        <p>Hi ${userName},</p>
        <p>Your <strong>${plan}</strong> subscription has been successfully activated!</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's Included:</h3>
          <ul>
            <li>✅ Monthly prize draws with multiple winning tiers</li>
            <li>✅ Score tracking and management</li>
            <li>✅ Charity contribution tracking</li>
            <li>✅ Winner verification and payout system</li>
          </ul>
          <p><strong>Next billing date:</strong> ${nextBilling}</p>
        </div>
        <p>Thank you for joining our community of golfers making a difference!</p>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  }),

  drawResults: (userName: string, drawMonth: string, won: boolean, tier?: string) => ({
    subject: `Draw Results for ${drawMonth}`,
    text: `Hi ${userName},

The draw results for ${drawMonth} are now available!

${won 
  ? `🎉 Congratulations! You won a ${tier}-match prize! Please check your dashboard for verification instructions.`
  : `Unfortunately, you didn't win this month. But don't worry - there's always next month!`
}

Log in to your dashboard to see the full results and your participation history.

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${won ? '#10b981' : '#6b7280'};">Draw Results for ${drawMonth}</h2>
        <p>Hi ${userName},</p>
        <div style="background: ${won ? '#f0fdf4' : '#f9fafb'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${won 
            ? `<h3 style="color: #10b981;">🎉 Congratulations!</h3>
               <p>You won a <strong>${tier}-match</strong> prize!</p>
               <p>Please check your dashboard for verification instructions.</p>`
            : `<p>Unfortunately, you didn't win this month. But don't worry - there's always next month!</p>`
          }
        </div>
        <p>Log in to your dashboard to see the full results and your participation history.</p>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  }),

  winnerVerification: (userName: string, tier: string, amount: string) => ({
    subject: "Action Required: Verify Your Winning Score",
    text: `Hi ${userName},

Congratulations! You've won a ${tier}-match prize of ${amount}!

To claim your prize, please:
1. Log in to your dashboard
2. Upload a screenshot of your winning scores from your golf platform
3. Submit for admin review

Once verified, your payment will be processed.

Please complete this verification within 7 days.

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">🏆 Winner Verification Required</h2>
        <p>Hi ${userName},</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Congratulations!</h3>
          <p>You've won a <strong>${tier}-match</strong> prize of <strong>${amount}</strong>!</p>
          <h4>To claim your prize:</h4>
          <ol>
            <li>Log in to your dashboard</li>
            <li>Upload a screenshot of your winning scores from your golf platform</li>
            <li>Submit for admin review</li>
          </ol>
          <p><strong>Please complete this verification within 7 days.</strong></p>
        </div>
        <p>Once verified, your payment will be processed.</p>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  }),

  paymentProcessed: (userName: string, amount: string, tier: string) => ({
    subject: "Payment Processed - Your Prize Has Been Sent!",
    text: `Hi ${userName},

Great news! Your prize payment of ${amount} for your ${tier}-match win has been processed.

The funds should appear in your account within 3-5 business days, depending on your bank.

Thank you for being part of our community. Good luck in next month's draw!

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">💰 Payment Processed!</h2>
        <p>Hi ${userName},</p>
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Great news!</h3>
          <p>Your prize payment of <strong>${amount}</strong> for your <strong>${tier}-match</strong> win has been processed.</p>
          <p>The funds should appear in your account within 3-5 business days, depending on your bank.</p>
        </div>
        <p>Thank you for being part of our community. Good luck in next month's draw!</p>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  }),

  subscriptionExpiring: (userName: string, expiryDate: string) => ({
    subject: "Action Required: Your Subscription is Expiring Soon",
    text: `Hi ${userName},

Your subscription will expire on ${expiryDate}.

To continue participating in monthly draws and supporting your chosen charity, please renew your subscription.

Log in to your dashboard to renew your subscription now.

Best regards,
The Golf Charity Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Subscription Expiring Soon</h2>
        <p>Hi ${userName},</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Your subscription will expire on <strong>${expiryDate}</strong>.</p>
          <p>To continue participating in monthly draws and supporting your chosen charity, please renew your subscription.</p>
        </div>
        <p>Log in to your dashboard to renew your subscription now.</p>
        <p>Best regards,<br>The Golf Charity Team</p>
      </div>
    `
  })
};

// Helper functions to send specific email types
export async function sendWelcomeEmail(to: string, userName: string) {
  const template = emailTemplates.welcome(userName);
  return sendEmail({ to, ...template });
}

export async function sendSubscriptionConfirmation(to: string, userName: string, plan: string, nextBilling: string) {
  const template = emailTemplates.subscriptionConfirmation(userName, plan, nextBilling);
  return sendEmail({ to, ...template });
}

export async function sendDrawResults(to: string, userName: string, drawMonth: string, won: boolean, tier?: string) {
  const template = emailTemplates.drawResults(userName, drawMonth, won, tier);
  return sendEmail({ to, ...template });
}

export async function sendWinnerVerification(to: string, userName: string, tier: string, amount: string) {
  const template = emailTemplates.winnerVerification(userName, tier, amount);
  return sendEmail({ to, ...template });
}

export async function sendPaymentProcessed(to: string, userName: string, amount: string, tier: string) {
  const template = emailTemplates.paymentProcessed(userName, amount, tier);
  return sendEmail({ to, ...template });
}

export async function sendSubscriptionExpiring(to: string, userName: string, expiryDate: string) {
  const template = emailTemplates.subscriptionExpiring(userName, expiryDate);
  return sendEmail({ to, ...template });
}

