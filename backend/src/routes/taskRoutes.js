const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Ajouter une tâche
router.post('/', taskController.addTask);

// Récupérer toutes les tâches (avec filtres) - DOIT être avant /:id
router.get('/', taskController.getTasks);

// IMPORTANT: Les routes spécifiques (avec chemin complet) doivent être AVANT les routes génériques /:id
// Envoyer un rappel manuel pour une tâche - AVANT /:id pour éviter les conflits
router.post('/:id/remind', taskController.sendReminder);

// Mettre à jour une tâche
router.put('/:id', taskController.updateTask);

// Récupérer une tâche par ID
router.get('/:id', taskController.getTaskById);

// Supprimer une tâche
router.delete('/:id', taskController.deleteTask);

module.exports = router; 