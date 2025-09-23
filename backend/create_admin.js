const { Client } = require('pg');
require('dotenv').config();

// Configuration de la base de données (même que dans l'app)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 60000
});

async function createAdmin() {
  try {
    await client.connect();
    console.log('✅ Connexion à la base de données établie');

    // Option 1: Créer un nouvel utilisateur admin
    const newAdmin = {
      nom: 'Admin',
      email: 'admin@mytache.com',
      fonction: 'Administrateur',
      departement: 'IT',
      role: 'admin',
      password: 'admin123'
    };

    // Vérifier si l'admin existe déjà
    const existingAdmin = await client.query(
      'SELECT * FROM employees WHERE email = $1 OR nom = $2',
      [newAdmin.email, newAdmin.nom]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('👤 Utilisateur admin existe déjà, mise à jour du rôle...');
      await client.query(
        'UPDATE employees SET role = $1 WHERE email = $2',
        ['admin', newAdmin.email]
      );
      console.log('✅ Rôle admin mis à jour');
    } else {
      console.log('👤 Création d\'un nouvel utilisateur admin...');
      await client.query(
        `INSERT INTO employees (nom, email, fonction, departement, role, password, actif)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newAdmin.nom, newAdmin.email, newAdmin.fonction, newAdmin.departement, newAdmin.role, newAdmin.password, true]
      );
      console.log('✅ Utilisateur admin créé');
    }

    // Option 2: Mettre à jour un utilisateur existant en admin
    console.log('\n📋 Pour mettre à jour un utilisateur existant en admin, utilisez cette requête SQL:');
    console.log('UPDATE employees SET role = \'admin\' WHERE nom = \'NOM_UTILISATEUR\';');
    
    // Afficher tous les utilisateurs
    const allUsers = await client.query('SELECT nom, email, role FROM employees ORDER BY nom');
    console.log('\n👥 Liste de tous les utilisateurs:');
    allUsers.rows.forEach(user => {
      console.log(`- ${user.nom} (${user.email}) - Rôle: ${user.role}`);
    });

  } catch (err) {
    console.error('❌ Erreur:', err);
  } finally {
    await client.end();
  }
}

createAdmin();
