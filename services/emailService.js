const nodemailer = require('nodemailer');

/**
 * Creates and configures the Nodemailer SMTP transporter.
 * Supports standard SMTP providers (Gmail, SendGrid, Mailgun, Amazon SES, etc.).
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/[\s"]/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 or other ports
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Generic email dispatch utility.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - Rendered HTML body content
 * @param {Array} [options.attachments] - Array of Nodemailer attachment objects
 * @returns {Promise<Object>} Result object with success flag and messageId or error
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.warn(
        '⚠️ [EmailService] SMTP credentials not configured in .env. Email dispatch skipped for:',
        to
      );
      return { success: false, message: 'SMTP credentials not configured' };
    }

    const transporter = createTransporter();
    const fromAddress =
      process.env.EMAIL_FROM || '"Mahid Aromas" <orders@mahidaromas.pk>';

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ [EmailService] Email sent successfully to ${to} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`❌ [EmailService] Failed to send email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  sendEmail,
};
