const { Client } = require('pg');

// Utiliser Client au lieu de Pool pour éviter les problèmes SASL
let client = null;

async function getClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await client.connect();
  }
  return client;
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
    comment
  } = task;
  
  const result = await getClient().then(client =>
    client.query(
      `INSERT INTO tasks (employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment]
    )
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
    const dbClient = await getClient();
    const result = await dbClient.query(query, values);
    return result.rows;
  } catch (err) {
    console.error('❌ Erreur récupération tâches:', err);
    return [];
  }
}

// Récupérer une tâche par ID
async function getTaskById(id) {
  const result = await getClient().then(client =>
    client.query('SELECT * FROM tasks WHERE id = $1', [id])
  );
  return result.rows[0];
}

// Mettre à jour une tâche
async function updateTask(id, updates) {
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
    comment
  } = updates;
  
  const result = await getClient().then(client =>
    client.query(
      `UPDATE tasks 
       SET employee_name = $1, category = $2, task_name = $3, status = $4, date = $5, 
           start_time = $6, location = $7, estimated_duration = $8, priority = $9, comment = $10
       WHERE id = $11 
       RETURNING *`,
      [employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment, id]
    )
  );
  return result.rows[0];
}

// Supprimer une tâche
async function deleteTask(id) {
  const result = await getClient().then(client =>
    client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])
  );
  return result.rows[0];
}

module.exports = {
  addTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
}; 