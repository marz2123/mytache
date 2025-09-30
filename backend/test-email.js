const { sendMail } = require('./src/utils/email');
const dotenv = require('dotenv');
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Test du système d\'email...');
    console.log('📧 Configuration:');
    console.log('  - Host:', process.env.EMAIL_HOST);
    console.log('  - Port:', process.env.EMAIL_PORT);
    console.log('  - User:', process.env.EMAIL_USER);
    console.log('  - Pass:', process.env.EMAIL_PASS ? '***configuré***' : '❌ MANQUANT');
    
    if (!process.env.EMAIL_PASS) {
      console.log('❌ EMAIL_PASS manquant dans le fichier .env');
      return;
    }
    
    const testEmail = {
      to: process.env.EMAIL_USER, // Envoyer à soi-même pour le test
      subject: '🧪 Test du système d\'email MyTâches',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🧪 Test Email MyTâches</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">✅ Système d'email opérationnel !</h2>
            
            <p style="font-size: 16px; color: #555;">
              Si vous recevez cet email, cela signifie que le système d'email automatique 
              de MyTâches est correctement configuré et fonctionnel.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0;">🎯 Fonctionnalités activées :</h3>
              <ul style="color: #155724; margin: 10px 0;">
                <li>✅ Email automatique lors de création de tâche</li>
                <li>✅ Rappels 5 minutes avant le début</li>
                <li>✅ Récapitulatif quotidien à 8h</li>
                <li>✅ Récapitulatif pour l'admin à 18h</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par le système de test MyTâches.
            </p>
          </div>
        </div>
      `
    };
    
    await sendMail(testEmail);
    console.log('✅ Email de test envoyé avec succès !');
    console.log('📧 Vérifiez votre boîte email :', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Erreur lors du test email:', error);
  }
}

testEmail();
