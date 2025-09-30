const { sendMail } = require('./src/utils/emailGraph');
const dotenv = require('dotenv');
dotenv.config();

async function testGraphAPI() {
  console.log('🧪 Test du système Microsoft Graph API...');
  console.log('📧 Configuration:');
  console.log(`  - Tenant ID: ${process.env.AZURE_TENANT_ID ? '***configuré***' : '❌ MANQUANT'}`);
  console.log(`  - Client ID: ${process.env.AZURE_CLIENT_ID ? '***configuré***' : '❌ MANQUANT'}`);
  console.log(`  - Client Secret: ${process.env.AZURE_CLIENT_SECRET ? '***configuré***' : '❌ MANQUANT'}`);
  console.log(`  - From: ${process.env.EMAIL_FROM || 'admin@groupemyhome.com'}`);
  
  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    console.log('❌ Variables Azure manquantes dans le fichier .env');
    console.log('Ajoutez :');
    console.log('AZURE_TENANT_ID=b0cb1298-7713-433c-836c-aa774cdab322');
    console.log('AZURE_CLIENT_ID=3205362f-dab6-455d-a093-82d1daeb4207');
    console.log('AZURE_CLIENT_SECRET=7ga8Q~~_qGtyKRohDwP.-KI.ZPUNup Z4fV6_Ybnd');
    return;
  }

  try {
    await sendMail({
      to: 'admin@groupemyhome.com',
      subject: '🎯 Test Microsoft Graph API - MyTâches',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0078d4 0%, #106ebe 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎯 Test Microsoft Graph API</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Bonjour !</h2>
            
            <p style="font-size: 16px; color: #555;">
              Ceci est un email de test pour vérifier que Microsoft Graph API fonctionne correctement avec MyTâches.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0;">✅ Microsoft Graph API est opérationnel !</h3>
              <p style="color: #155724; margin: 10px 0 0 0;">
                Votre système de notifications MyTâches utilise maintenant la solution officielle Microsoft.
              </p>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin: 0;">🔒 Sécurité parfaite</h3>
              <p style="color: #1976d2; margin: 10px 0 0 0;">
                OAuth2 + Security Defaults activé = Solution 100% sécurisée et gratuite !
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par le système MyTâches via Microsoft Graph API.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email de test envoyé avec succès via Microsoft Graph API !');
    console.log('📧 Vérifiez votre boîte email');
    
  } catch (error) {
    console.error('❌ Erreur lors du test Graph API:', error.message);
  }
}

testGraphAPI();
