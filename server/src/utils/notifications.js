/**
 * Notification utility for price-drop alerts.
 *
 * Swap out sendEmail() for your mailer of choice:
 *   - Nodemailer + Gmail/SMTP
 *   - SendGrid  → require("@sendgrid/mail")
 *   - Resend    → require("resend")
 *   - AWS SES   → require("@aws-sdk/client-ses")
 *
 * The rest of the pipeline (finding alerts, marking notified) is in the controller.
 */

/**
 * Send a price-drop email to a subscriber.
 *
 * @param {Object} opts
 * @param {string} opts.to        - recipient email
 * @param {string} opts.listingName
 * @param {number} opts.oldPrice
 * @param {number} opts.newPrice
 * @param {string} opts.listingId - for the CTA link
 */
async function sendPriceDropEmail({
  to,
  listingName,
  oldPrice,
  newPrice,
  listingId,
}) {
  // ── Replace this block with your mailer ────────────────────
  // Example using Nodemailer (npm i nodemailer):
  //
  // const nodemailer = require("nodemailer");
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: 587,
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // });
  // await transporter.sendMail({
  //   from: `"Fixly Marketplace" <${process.env.SMTP_FROM}>`,
  //   to,
  //   subject: `Price drop on ${listingName}`,
  //   html: buildEmailHtml({ listingName, oldPrice, newPrice, listingId }),
  // });
  // ────────────────────────────────────────────────────────────

  // Placeholder — logs to console until you wire a real mailer
  console.log(
    `[Notifications] Price drop alert → ${to} | ${listingName} | KES ${oldPrice} → KES ${newPrice}`,
  );
}

/**
 * Simple HTML email template.
 * Replace with your own branded template or a transactional email service template.
 */
function buildEmailHtml({ listingName, oldPrice, newPrice, listingId }) {
  const frontendUrl = process.env.FRONTEND_URL || "https://yoursite.com";
  const link = `${frontendUrl}/product/${listingId}`;
  const savings = oldPrice - newPrice;
  const pct = Math.round((savings / oldPrice) * 100);

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="color:#0D1117">Price drop alert 🎉</h2>
      <p style="color:#555">${listingName} just dropped in price.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="color:#888;padding:8px 0">Was</td>
          <td style="text-align:right;text-decoration:line-through;color:#888">
            KES ${oldPrice.toLocaleString()}
          </td>
        </tr>
        <tr>
          <td style="color:#0D1117;font-weight:bold;padding:8px 0">Now</td>
          <td style="text-align:right;color:#16a34a;font-weight:bold;font-size:1.2em">
            KES ${newPrice.toLocaleString()}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="color:#16a34a;font-size:0.85em;padding-bottom:8px">
            You save KES ${savings.toLocaleString()} (${pct}% off)
          </td>
        </tr>
      </table>
      <a href="${link}"
         style="display:inline-block;background:#0D1117;color:#fff;
                padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
        View listing →
      </a>
      <p style="margin-top:24px;color:#aaa;font-size:0.8em">
        You're receiving this because you set a price alert on Fixly Marketplace.
        <a href="${frontendUrl}/alerts/unsubscribe" style="color:#aaa">Unsubscribe</a>
      </p>
    </div>
  `;
}

module.exports = { sendPriceDropEmail, buildEmailHtml };
