const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Ajouter une tâche
router.post('/', taskController.addTask);

// Récupérer toutes les tâches (avec filtres) - DOIT être avant /:id
router.get('/', taskController.getTasks);

// Mettre à jour une tâche - AVANT getTaskById pour éviter les conflits
router.put('/:id', taskController.updateTask);

// Récupérer une tâche par ID
router.get('/:id', taskController.getTaskById);

// Supprimer une tâche
router.delete('/:id', taskController.deleteTask);

// Envoyer un rappel manuel pour une tâche
router.post('/:id/remind', taskController.sendReminder);

module.exports = router; 