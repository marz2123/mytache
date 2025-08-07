const { getEmployeeByEmail, getEmployeeByName } = require('../models/employeeModel');

exports.login = async (req, res) => {
  try {
    const { email, password, nom } = req.body;
    
    console.log('🔍 Tentative de connexion pour:', email || nom);
    
    // Essayer d'abord par email, puis par nom
    let employee = null;
    if (email) {
      employee = await getEmployeeByEmail(email);
    } else if (nom) {
      employee = await getEmployeeByName(nom);
    }
    
    if (!employee) {
      console.log('❌ Utilisateur non trouvé:', email || nom);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    if (employee.password !== password) {
      console.log('❌ Mot de passe incorrect pour:', email || nom);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('✅ Connexion réussie pour:', employee.nom);
    res.json({
      success: true,
      user: {
        id: employee.id,
        nom: employee.nom,
        email: employee.email,
        role: employee.role,
        departement: employee.departement
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}; 