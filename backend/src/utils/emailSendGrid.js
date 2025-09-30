const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config();

// Configuration SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail({ to, subject, text, html }) {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM || 'admin@groupemyhome.com',
      name: 'MyTâches'
    },
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email SendGrid envoyé à ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur SendGrid:', error);
    throw error;
  }
}

module.exports = { sendMail };
