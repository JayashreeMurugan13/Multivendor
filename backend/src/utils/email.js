const nodemailer = require('nodemailer');

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // If real credentials are configured, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes('buyzone.com') &&
      process.env.EMAIL_PASS !== 'password') {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    return transporter;
  }

  // Fallback: create Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('\n[Email] Using Ethereal test account:', testAccount.user);
  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"BUYZONE" <${process.env.EMAIL_USER || 'noreply@buyzone.com'}>`,
      to, subject, html,
    });
    // Log preview URL for Ethereal emails
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log(`\n[Email] Subject: ${subject}`);
      console.log(`[Email] To: ${to}`);
      console.log(`[Email] Preview URL: ${preview}\n`);
    }
  } catch (err) {
    console.error(`[Email Error] ${subject} → ${to}:`, err.message);
  }
};

const emailTemplates = {
  sellerApplicationReceived: (name) => ({
    subject: 'Seller Application Received - BUYZONE',
    html: `<h2>Hello ${name},</h2><p>Your seller application has been received. We will review it within 2-3 business days.</p>`,
  }),
  sellerApproved: (name) => ({
    subject: 'Seller Application Approved - BUYZONE',
    html: `<h2>Congratulations ${name}!</h2><p>Your seller account has been approved. You can now login and start selling.</p>`,
  }),
  sellerRejected: (name, reason) => ({
    subject: 'Seller Application Status - BUYZONE',
    html: `<h2>Hello ${name},</h2><p>Unfortunately your application was not approved.</p><p>Reason: ${reason}</p>`,
  }),
  orderPlaced: (orderId) => ({
    subject: `Order Confirmed #${orderId} - BUYZONE`,
    html: `<h2>Order Confirmed!</h2><p>Your order #${orderId} has been placed successfully.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
