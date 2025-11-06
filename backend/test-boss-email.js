// Script pour tester la configuration BOSS_EMAIL
require('dotenv').config();
const { sendMail } = require('./src/utils/emailGraph');
const logger = require('./src/utils/logger');

async function testBossEmail() {
  console.log('\n🔍 Vérification de la configuration BOSS_EMAIL...\n');
  
  // Vérifier si BOSS_EMAIL est configuré
  if (!process.env.BOSS_EMAIL) {
    console.log('❌ BOSS_EMAIL n\'est PAS configuré dans les variables d\'environnement');
    console.log('\n📝 Pour configurer BOSS_EMAIL :');
    console.log('   1. Créez ou modifiez le fichier .env à la racine du projet');
    console.log('   2. Ajoutez la ligne : BOSS_EMAIL=admin@groupemyhome.com');
    console.log('   3. Redémarrez le serveur backend\n');
    return;
  }
  
  console.log(`✅ BOSS_EMAIL est configuré : ${process.env.BOSS_EMAIL}\n`);
  
  // Vérifier la configuration Azure
  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    console.log('⚠️  Configuration Azure manquante - Les emails ne pourront pas être envoyés');
    console.log('   Variables requises : AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET\n');
    return;
  }
  
  console.log('✅ Configuration Azure détectée\n');
  console.log('📧 Test d\'envoi d\'email à BOSS_EMAIL...\n');
  
  try {
    const testEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test de notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2d3748;">✅ Test de notification admin</h2>
          <p>Bonjour,</p>
          <p>Ceci est un email de test pour vérifier que les notifications admin fonctionnent correctement.</p>
          <p>Si vous recevez cet email, cela signifie que la configuration BOSS_EMAIL est correcte !</p>
        </div>
      </body>
      </html>
    `;
    
    await sendMail({
      to: process.env.BOSS_EMAIL,
      subject: '✅ Test de notification admin MyTâches',
      html: testEmailHtml
    });
    
    console.log(`✅ Email de test envoyé avec succès à ${process.env.BOSS_EMAIL}`);
    console.log('   Vérifiez votre boîte de réception (et les spams si nécessaire)\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de test :');
    console.error(`   ${error.message}\n`);
    if (error.stack) {
      console.error(`   Stack: ${error.stack.substring(0, 300)}\n`);
    }
  }
}

testBossEmail();


