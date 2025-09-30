const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

// Configuration Azure AD
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

// Créer les credentials
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

// Initialiser le client Graph
const graphClient = Client.initWithMiddleware({
  authProvider: {
    getAccessToken: async () => {
      const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
      return tokenResponse.token;
    }
  }
});

async function sendMail({ to, subject, text, html }) {
  try {
    const message = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: html || text
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      },
      saveToSentItems: true
    };

    // Envoyer l'email via Graph API
    await graphClient
      .api(`/users/${process.env.EMAIL_FROM || 'admin@groupemyhome.com'}/sendMail`)
      .post(message);

    console.log(`✅ Email Graph API envoyé à ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur Graph API:', error);
    throw error;
  }
}

module.exports = { sendMail };
