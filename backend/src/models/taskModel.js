const { Client } = require('pg');

// Configurer le timezone français
process.env.TZ = 'Europe/Paris';

// Utiliser Client au lieu de Pool pour éviter les problèmes SASL
let client = null;

async function getClient() {
  if (!client || client.connection && client.connection.stream && client.connection.stream.destroyed) {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.log('Client déjà fermé');
      }
    }
    
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      // Options pour éviter les déconnexions
      connectionTimeoutMillis: 30000, // Augmenter à 30s
      idleTimeoutMillis: 60000, // Augmenter à 60s
      max: 1
    });
    
    try {
      await client.connect();
      console.log('✅ Connexion à la base de données établie');
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      throw err;
    }
  }
  return client;
}

// Ajouter une fonction pour gérer les erreurs de connexion
async function executeQuery(query, params = []) {
  let retries = 3;
  while (retries > 0) {
    try {
      const dbClient = await getClient();
      const result = await dbClient.query(query, params);
      return result;
    } catch (err) {
      console.error(`❌ Erreur requête (tentative ${4-retries}/3):`, err);
      retries--;
      
      if (retries === 0) {
        throw err;
      }
      
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Forcer une nouvelle connexion
      if (client) {
        try {
          await client.end();
        } catch (e) {
          console.log('Client déjà fermé');
        }
        client = null;
      }
    }
  }
}

// Ajouter une tâche
async function addTask(task) {
  const {
    employee_name,
    category,
    task_name,
    status,
    date,
    start_time,
    location,
    estimated_duration,
    priority,
    comment,
    collaborator,
    collaboration,
    reminder
  } = task;
  
  const result = await executeQuery(
    `INSERT INTO tasks (employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment, collaborator, collaboration, reminder) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment, collaborator, collaboration, reminder]
  );
  return result.rows[0];
}

// Récupérer toutes les tâches (avec filtres optionnels)
async function getTasks(filters = {}) {
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const values = [];
  let idx = 1;
  
  if (filters.date) {
    query += ` AND date::date = $${idx++}`;
    values.push(filters.date);
  }
  if (filters.category) {
    query += ` AND category = $${idx++}`;
    values.push(filters.category);
  }
  if (filters.employee_name) {
    query += ` AND employee_name ILIKE $${idx++}`;
    values.push(`%${filters.employee_name}%`);
  }
  if (filters.status) {
    query += ` AND status = $${idx++}`;
    values.push(filters.status);
  }
  
  query += ' ORDER BY id DESC';
  
  try {
    const result = await executeQuery(query, values);
    return result.rows;
  } catch (err) {
    console.error('❌ Erreur récupération tâches:', err);
    return [];
  }
}

// Récupérer une tâche par ID
async function getTaskById(id) {
  const result = await executeQuery('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0];
}

// Mettre à jour une tâche (mise à jour partielle - seulement les champs fournis)
async function updateTask(id, updates) {
  // Construire dynamiquement la requête SQL pour ne mettre à jour que les champs fournis
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  // Liste des champs possibles
  const allowedFields = [
    'employee_name', 'category', 'task_name', 'status', 'date', 
    'start_time', 'location', 'estimated_duration', 'priority', 
    'comment', 'collaborator', 'collaboration', 'reminder'
  ];
  
  // Construire la clause SET seulement pour les champs fournis
  for (const field of allowedFields) {
    if (updates.hasOwnProperty(field) && updates[field] !== undefined && updates[field] !== null) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }
  
  // Si aucun champ à mettre à jour, retourner la tâche existante
  if (fields.length === 0) {
    console.log('⚠️ Aucun champ à mettre à jour, retour de la tâche existante');
    return await getTaskById(id);
  }
  
  // Ajouter l'ID à la fin pour la clause WHERE
  values.push(id);
  
  const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await executeQuery(query, values);
  return result.rows[0];
}

// Supprimer une tâche
async function deleteTask(id) {
  const result = await executeQuery('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
}; 