// src/app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'mytache',
});

// Test de connexion à la base
pool.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL'))
  .catch(err => console.error('❌ Erreur connexion PostgreSQL', err));

// Exemple de route de test
app.get('/', (req, res) => {
  res.send('API MyTâches opérationnelle !');
});

// Importer les routes
const taskRoutes = require('./routes/taskRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

require('./cronJobs');

// Créer la table employees au démarrage (sans faire planter l'app)
const { Pool } = require('pg');

// Debug pour voir les variables d'environnement
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');

// Forcer l'utilisation de DATABASE_URL pour Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
    // Ne pas faire planter l'application
  }
}

// Récupérer tous les employés
async function getEmployees() {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY nom');
    return result.rows;
  } catch (err) {
    console.error('❌ Erreur récupération employés:', err);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${port}`);
});

module.exports = app;
