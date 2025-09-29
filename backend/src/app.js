// src/app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
dotenv.config();

// Configurer le timezone français
process.env.TZ = 'Europe/Paris';

const app = express();
const port = process.env.PORT || 5000;

// Configuration CORS pour autoriser le nouveau domaine
app.use(cors({
  origin: [
    'https://mytache.groupemyhome.com', // ✅ Nouveau domaine frontend
    'https://mytache.vercel.app',
    'https://mytache-marzs-projects-6da00859.vercel.app',
    'http://localhost:3000',
    'https://dashboard:1', // ✅ Ajout pour résoudre le problème CORS
    'https://mytache.groupemyhome.com:443' // ✅ Ajout pour résoudre le problème CORS
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-current-user']
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

// Route de test pour vérifier que l'API fonctionne
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API MyTâches fonctionne !',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'No Origin'
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${port}`);
});

module.exports = app;
