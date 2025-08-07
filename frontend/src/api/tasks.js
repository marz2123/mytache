const API_BASE_URL = 'https://mytache.groupemyhome.com'; // ✅ Nouveau domaine

export const getTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`);
  return response.json();
};

export const addTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  return response.json();
};

export const updateTask = async (id, task) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression de la tâche");
  return response.json();
}; 