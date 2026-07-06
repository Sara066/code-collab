const nodemailer = require('nodemailer');

// Gmail SMTP with an "app password" — fine for club-scale volume.
// If this ever needs to scale up, swap this transporter for Resend/SendGrid
// without touching anything that calls sendPasswordResetEmail.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, resetLink) {
  await transporter.sendMail({
    from: `"CodeCollab" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your CodeCollab password',
    html: `
      <p>Someone requested a password reset for this account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a> — this link expires in 15 minutes.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `
  });
}

module.exports = { sendPasswordResetEmail };

