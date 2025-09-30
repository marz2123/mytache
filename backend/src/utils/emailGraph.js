const { Client } = require('@microsoft/microsoft-graph-client');
const { ClientSecretCredential } = require('@azure/identity');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

// Configuration Azure AD
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;

// Vérifier si les variables Azure sont configurées
let credential = null;
let graphClient = null;

if (tenantId && clientId && clientSecret) {
  try {
    // Créer les credentials seulement si les variables sont présentes
    credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    
    // Initialiser le client Graph
    graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse.token;
        }
      }
    });
    
    console.log('✅ Configuration Azure Graph API chargée');
  } catch (error) {
    console.error('❌ Erreur configuration Azure:', error);
    credential = null;
    graphClient = null;
  }
} else {
  console.warn('⚠️ Variables Azure non configurées - Emails désactivés');
  console.warn('   Variables manquantes: AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET');
}

async function sendMail({ to, subject, text, html }) {
  // Vérifier si Azure est configuré
  if (!graphClient) {
    console.log(`📧 Email désactivé - aurait été envoyé à ${to}: ${subject}`);
    return { success: false, reason: 'Azure non configuré' };
  }

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
