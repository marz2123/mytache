const dotenv = require('dotenv');

// Test 1: Charger depuis le backend
console.log('🧪 Test 1: Chargement depuis backend/');
dotenv.config({ path: '../.env' });

console.log('Variables trouvées:');
console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID ? '✅ Présent' : '❌ Manquant');
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID ? '✅ Présent' : '❌ Manquant');
console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? '✅ Présent' : '❌ Manquant');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Présent' : '❌ Manquant');

// Test 2: Charger depuis la racine
console.log('\n🧪 Test 2: Chargement depuis racine/');
dotenv.config({ path: './.env' });

console.log('Variables trouvées:');
console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID ? '✅ Présent' : '❌ Manquant');
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID ? '✅ Présent' : '❌ Manquant');
console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? '✅ Présent' : '❌ Manquant');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Présent' : '❌ Manquant');
