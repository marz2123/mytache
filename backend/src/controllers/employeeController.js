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

// Créer un utilisateur admin (endpoint spécial)
exports.createAdmin = async (req, res) => {
  try {
    const { nom, email, password = 'admin123' } = req.body;
    
    if (!nom || !email) {
      return res.status(400).json({ error: 'Nom et email requis' });
    }

    const adminData = {
      nom,
      email,
      fonction: 'Administrateur',
      departement: 'IT',
      role: 'admin',
      password,
      actif: true
    };

    const newAdmin = await employeeModel.addEmployee(adminData);
    res.status(201).json({ 
      message: 'Utilisateur admin créé avec succès', 
      admin: {
        id: newAdmin.id,
        nom: newAdmin.nom,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (err) {
    console.error('Erreur création admin:', err);
    if (err.code === '23505') { // Erreur de contrainte unique
      res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    } else {
      res.status(500).json({ error: 'Erreur lors de la création de l\'admin' });
    }
  }
};

// Mettre à jour le rôle d'un utilisateur en admin
exports.makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await employeeModel.updateEmployee(id, { role: 'admin' });
    res.json({ 
      message: 'Utilisateur promu administrateur avec succès', 
      employee: {
        id: updatedEmployee.id,
        nom: updatedEmployee.nom,
        email: updatedEmployee.email,
        role: updatedEmployee.role
      }
    });
  } catch (err) {
    console.error('Erreur promotion admin:', err);
    res.status(500).json({ error: 'Erreur lors de la promotion en admin' });
  }
}; 