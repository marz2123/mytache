const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Ajouter une tâche
router.post('/', taskController.addTask);

// Récupérer toutes les tâches (avec filtres)
router.get('/', taskController.getTasks);

// Récupérer une tâche par ID
router.get('/:id', taskController.getTaskById);

// Mettre à jour une tâche
router.put('/:id', taskController.updateTask);

// Supprimer une tâche
router.delete('/:id', taskController.deleteTask);

module.exports = router; 