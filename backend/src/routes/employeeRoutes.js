const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Récupérer tous les employés
router.get('/', employeeController.getEmployees);

// Récupérer un employé par ID
router.get('/:id', employeeController.getEmployeeById);

// Ajouter un employé
router.post('/', employeeController.addEmployee);

// Modifier un employé
router.put('/:id', employeeController.updateEmployee);

// Supprimer (désactiver) un employé
router.delete('/:id', employeeController.deleteEmployee);

// Créer un utilisateur admin
router.post('/create-admin', employeeController.createAdmin);

// Promouvoir un utilisateur en admin
router.put('/:id/make-admin', employeeController.makeAdmin);

module.exports = router; 