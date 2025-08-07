// src/app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configuration CORS pour autoriser Vercel
app.use(cors({
  origin: [
    'https://mytache.vercel.app',
    'https://mytache-marzs-projects-6da00859.vercel.app',
    'http://localhost:3000' // Pour le développement local
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debug pour voir les variables d'environnement
console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');

// Importer les routes
const taskRoutes = require('./routes/taskRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes);

require('./cronJobs');

// Exemple de route de test
app.get('/', (req, res) => {
  res.send('API MyTâches opérationnelle !');
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${port}`);
});

module.exports = app;
