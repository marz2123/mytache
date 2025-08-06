const employeeModel = require('../models/employeeModel');

// Récupérer tous les employés
exports.getEmployees = async (req, res) => {
  try {
    const employees = await employeeModel.getEmployees();
    res.json(employees);
  } catch (err) {
    console.error('Erreur récupération employés:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
};

// Récupérer un employé par ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeModel.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json(employee);
  } catch (err) {
    console.error('Erreur récupération employé:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'employé' });
  }
};

// Ajouter un employé
exports.addEmployee = async (req, res) => {
  try {
    const newEmployee = await employeeModel.addEmployee(req.body);
    res.status(201).json(newEmployee);
  } catch (err) {
    console.error('Erreur ajout employé:', err);
    if (err.code === '23505') { // Violation de contrainte unique
      res.status(400).json({ error: 'Un employé avec cet email existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'employé' });
    }
  }
};

// Modifier un employé
exports.updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await employeeModel.updateEmployee(req.params.id, req.body);
    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json(updatedEmployee);
  } catch (err) {
    console.error('Erreur modification employé:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Un employé avec cet email existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la modification de l\'employé' });
    }
  }
};

// Supprimer (désactiver) un employé
exports.deleteEmployee = async (req, res) => {
  try {
    const deletedEmployee = await employeeModel.deleteEmployee(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    res.json({ message: 'Employé désactivé avec succès' });
  } catch (err) {
    console.error('Erreur suppression employé:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
}; 