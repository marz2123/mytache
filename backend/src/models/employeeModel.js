const { Client } = require('pg');

// Debug pour voir les variables d'environnement
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');

// Configuration plus robuste pour éviter les déconnexions
let client = null;

async function getClient() {
  if (!client || client.connection && client.connection.stream && client.connection.stream.destroyed) {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.log('Client déjà fermé');
      }
    }
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      // Options pour éviter les déconnexions
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 1
    });
    
    try {
      await client.connect();
      console.log('✅ Connexion à la base de données établie');
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      throw err;
    }
  }
  return client;
}

// Créer la table employees si elle n'existe pas
async function createEmployeesTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      fonction VARCHAR(100),
      departement VARCHAR(100),
      actif BOOLEAN DEFAULT true,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      role VARCHAR(20) DEFAULT 'user',
      password VARCHAR(255) DEFAULT 'password123'
    );
  `;
  
  try {
    const dbClient = await getClient();
    await dbClient.query(createTableQuery);
    console.log('✅ Table employees créée/vérifiée');
  } catch (err) {
    console.error('❌ Erreur création table employees:', err);
  }
}

// Ajouter un employé
async function addEmployee(employee) {
  const {
    nom,
    email,
    fonction,
    departement,
    actif = true,
    role = 'user',
    password = 'password123'
  } = employee;
  
  const result = await getClient().then(client =>
    client.query(
      `INSERT INTO employees (nom, email, fonction, departement, actif, role, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nom, email, fonction, departement, actif, role, password]
    )
  );
  return result.rows[0];
}

// Récupérer tous les employés
async function getEmployees() {
  try {
    const dbClient = await getClient();
    const result = await dbClient.query('SELECT * FROM employees ORDER BY nom');
    return result.rows;
  } catch (err) {
    console.error('❌ Erreur récupération employés:', err);
    return [];
  }
}

// Récupérer un employé par ID
async function getEmployeeById(id) {
  const result = await getClient().then(client =>
    client.query('SELECT * FROM employees WHERE id = $1', [id])
  );
  return result.rows[0];
}

// Récupérer un employé par email
async function getEmployeeByEmail(email) {
  try {
    const dbClient = await getClient();
    const result = await dbClient.query('SELECT * FROM employees WHERE email = $1', [email]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Erreur récupération employé par email:', err);
    return null;
  }
}

// Récupérer un employé par nom
async function getEmployeeByName(nom) {
  try {
    const dbClient = await getClient();
    const result = await dbClient.query('SELECT * FROM employees WHERE nom = $1', [nom]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Erreur récupération employé par nom:', err);
    return null;
  }
}

// Modifier un employé
async function updateEmployee(id, employee) {
  const {
    nom,
    email,
    fonction,
    departement,
    actif,
    role = 'user',
    password
  } = employee;
  
  const result = await getClient().then(client =>
    client.query(
      `UPDATE employees 
       SET nom = $1, email = $2, fonction = $3, departement = $4, actif = $5, role = $6, password = $7, date_modification = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [nom, email, fonction, departement, actif, role, password, id]
    )
  );
  return result.rows[0];
}

// Supprimer (désactiver) un employé
async function deleteEmployee(id) {
  const result = await getClient().then(client =>
    client.query(
      'UPDATE employees SET actif = false, date_modification = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    )
  );
  return result.rows[0];
}

// Initialiser la table au démarrage
createEmployeesTable();

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeByEmail,
  getEmployeeByName, // Ajouter cette fonction
  updateEmployee,
  deleteEmployee
}; 