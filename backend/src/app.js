// src/app.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Charger les variables d'environnement depuis .env
dotenv.config();

// Configurer le timezone français
process.env.TZ = 'Europe/Paris';

// ============================================
// GESTION GLOBALE DES ERREURS (pour éviter les crashes)
// ============================================

const logger = require('./utils/logger');

// Gérer les promesses rejetées non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 UNHANDLED REJECTION - L\'application pourrait crasher!', reason);
  logger.error('Promise rejetée', promise);
  // Ne pas quitter le processus, juste logger l'erreur
  // Railway redémarrera automatiquement si nécessaire
});

// Gérer les exceptions non capturées
process.on('uncaughtException', (error) => {
  logger.error('🚨 UNCAUGHT EXCEPTION - Crash imminent!', error);
  // Pour les exceptions non capturées, on doit quitter proprement
  // Mais on donne le temps de logger l'erreur
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Gérer les warnings
process.on('warning', (warning) => {
  logger.warn('⚠️ Warning système: ' + warning.message);
});

// Gérer la fin propre du processus
process.on('SIGTERM', () => {
  logger.info('📴 SIGTERM reçu - Arrêt propre de l\'application');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('📴 SIGINT reçu - Arrêt propre de l\'application');
  process.exit(0);
});

logger.info('✅ Gestion globale des erreurs initialisée');

// ============================================

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
logger.info(`🔍 DATABASE_URL: ${process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'}`);

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
  logger.info(`🚀 Serveur backend démarré sur http://localhost:${port}`);
  logger.info(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📅 Timezone: ${process.env.TZ}`);
});

// Gestion des erreurs Express
app.use((err, req, res, next) => {
  logger.error('Erreur Express non gérée', err);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
