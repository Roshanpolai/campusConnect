import nodemailer from "nodemailer";

let cachedTransporter = null;

// Returns a nodemailer transporter, or null if SMTP env vars aren't set —
// callers should fall back to logging/dev behavior in that case rather than
// throwing, so the app keeps working out of the box without email configured.
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cachedTransporter;
}

// Sends an email. Returns { sent: true } on success, or { sent: false, reason }
// if SMTP isn't configured or the send failed — never throws, so a broken/missing
// mail config can't crash a request like forgot-password.
export async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    return { sent: false, reason: "SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing in .env)" };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"CampusConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
}

export function buildResetPasswordEmail(resetUrl) {
  return {
    subject: "Reset your CampusConnect password",
    text: `Reset your password using this link (valid 30 minutes): ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#6D5EF8;">Reset your password</h2>
        <p>We received a request to reset your CampusConnect password. This link is valid for 30 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#6D5EF8;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a></p>
        <p style="color:#6B6785;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}
