const { getEmployeeByEmail } = require('../models/employeeModel');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Tentative de connexion pour:', email);
    
    // Récupérer l'employé par email
    const employee = await getEmployeeByEmail(email);
    
    if (!employee) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    if (employee.password !== password) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    console.log('✅ Connexion réussie pour:', email);
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