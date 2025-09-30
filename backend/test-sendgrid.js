const { sendMail } = require('./src/utils/emailSendGrid');
const dotenv = require('dotenv');
dotenv.config();

async function testSendGrid() {
  console.log('🧪 Test du système SendGrid...');
  console.log('📧 Configuration:');
  console.log(`  - API Key: ${process.env.SENDGRID_API_KEY ? '***configuré***' : '❌ MANQUANT'}`);
  console.log(`  - From: ${process.env.EMAIL_FROM || 'admin@groupemyhome.com'}`);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('❌ SENDGRID_API_KEY manquant dans le fichier .env');
    return;
  }

  try {
    await sendMail({
      to: 'admin@groupemyhome.com',
      subject: '🎯 Test SendGrid - MyTâches',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎯 Test SendGrid</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Bonjour !</h2>
            
            <p style="font-size: 16px; color: #555;">
              Ceci est un email de test pour vérifier que SendGrid fonctionne correctement avec MyTâches.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #155724; margin: 0;">✅ SendGrid est opérationnel !</h3>
              <p style="color: #155724; margin: 10px 0 0 0;">
                Votre système de notifications MyTâches est maintenant prêt.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Cet email a été envoyé automatiquement par le système MyTâches via SendGrid.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email de test envoyé avec succès via SendGrid !');
    console.log('📧 Vérifiez votre boîte email');
    
  } catch (error) {
    console.error('❌ Erreur lors du test SendGrid:', error.message);
  }
}

testSendGrid();
