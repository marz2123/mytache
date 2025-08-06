const taskModel = require('../models/taskModel');

// Ajouter une tâche
exports.addTask = async (req, res) => {
  try {
    const newTask = await taskModel.addTask(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Erreur ajout tâche:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche' });
  }
};

// Récupérer toutes les tâches (avec filtres et permissions)
exports.getTasks = async (req, res) => {
  try {
    const filters = {
      date: req.query.date,
      category: req.query.category,
      employee_name: req.query.employee_name,
      status: req.query.status
    };

    // Récupérer l'utilisateur connecté depuis les headers ou session
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    
    // Si c'est un utilisateur normal (non-admin), filtrer par son nom
    if (currentUser && currentUser.role !== 'admin') {
      filters.employee_name = currentUser.nom;
    }

    const tasks = await taskModel.getTasks(filters);
    res.json(tasks);
  } catch (err) {
    console.error('Erreur récupération tâches:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
};

// Récupérer une tâche par ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Vérifier les permissions
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Erreur récupération tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    console.log('=== UPDATE TASK ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    // Vérifier les permissions avant la mise à jour
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    console.log('Current user:', currentUser);
    
    const existingTask = await taskModel.getTaskById(req.params.id);
    console.log('Existing task:', existingTask);
    
    if (!existingTask) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Seul l'admin ou le propriétaire de la tâche peut la modifier
    if (currentUser && currentUser.role !== 'admin' && existingTask.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres tâches' });
    }
    
    const updatedTask = await taskModel.updateTask(req.params.id, req.body);
    console.log('Updated task:', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    console.error('Erreur mise à jour tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    // Vérifier les permissions avant la suppression
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    const existingTask = await taskModel.getTaskById(req.params.id);
    
    if (!existingTask) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Seul l'admin ou le propriétaire de la tâche peut la supprimer
    if (currentUser && currentUser.role !== 'admin' && existingTask.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres tâches' });
    }
    
    const deletedTask = await taskModel.deleteTask(req.params.id);
    res.json({ message: 'Tâche supprimée avec succès', task: deletedTask });
  } catch (err) {
    console.error('Erreur suppression tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
}; 