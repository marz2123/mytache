const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

console.log('🧪 Test des variables Azure:');
console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID);
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID);
console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? '***présent***' : 'MANQUANT');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
  console.log('❌ Variables Azure manquantes !');
  process.exit(1);
}

// Test simple avec les credentials
const { ClientSecretCredential } = require('@azure/identity');

try {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );
  console.log('✅ Credentials créés avec succès !');
} catch (error) {
  console.error('❌ Erreur credentials:', error.message);
}
