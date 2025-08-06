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

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${port}`);
});

module.exports = app;
