const employeeModel = require('../models/employeeModel');

// Authentifier un utilisateur
exports.login = async (req, res) => {
  try {
    const { nom, password } = req.body;
    
    // Récupérer l'employé par nom
    const employees = await employeeModel.getEmployees();
    const employee = employees.find(emp => emp.nom === nom);
    
    if (!employee) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (!employee.actif) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }
    
    if (employee.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    // Authentification réussie
    res.json({
      success: true,
      user: {
        id: employee.id,
        nom: employee.nom,
        email: employee.email,
        role: employee.role,
        fonction: employee.fonction,
        departement: employee.departement
      }
    });
    
  } catch (err) {
    console.error('Erreur authentification:', err);
    res.status(500).json({ error: 'Erreur lors de l\'authentification' });
  }
}; 