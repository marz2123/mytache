const { Pool } = require('pg');

// Utiliser DATABASE_URL pour Supabase
const pool = new Pool(
  process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'mytache',
      }
);

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
    await pool.query(createTableQuery);
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
  
  const result = await pool.query(
    `INSERT INTO employees (nom, email, fonction, departement, actif, role, password)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [nom, email, fonction, departement, actif, role, password]
  );
  return result.rows[0];
}

// Récupérer tous les employés
async function getEmployees() {
  const result = await pool.query('SELECT * FROM employees ORDER BY nom');
  return result.rows;
}

// Récupérer un employé par ID
async function getEmployeeById(id) {
  const result = await pool.query('SELECT * FROM employees WHERE id = $1', [id]);
  return result.rows[0];
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
  
  const result = await pool.query(
    `UPDATE employees 
     SET nom = $1, email = $2, fonction = $3, departement = $4, actif = $5, role = $6, password = $7, date_modification = CURRENT_TIMESTAMP
     WHERE id = $8 RETURNING *`,
    [nom, email, fonction, departement, actif, role, password, id]
  );
  return result.rows[0];
}

// Supprimer (désactiver) un employé
async function deleteEmployee(id) {
  const result = await pool.query(
    'UPDATE employees SET actif = false, date_modification = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
}

// Initialiser la table au démarrage
createEmployeesTable();

module.exports = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
}; 