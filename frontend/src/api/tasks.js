// Remplacer les URLs locales par l'URL de production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mytache-production.up.railway.app';

// Fonction helper pour obtenir les headers avec l'utilisateur connecté
const getHeaders = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return {
    "Content-Type": "application/json",
    ...(currentUser && { "x-current-user": JSON.stringify(currentUser) })
  };
};

// Ajouter une tâche
export async function addTask(task) {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout de la tâche");
  return response.json();
}

// Récupérer toutes les tâches (avec filtres optionnels)
export async function getTasks(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/api/tasks?${params}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des tâches");
  return response.json();
}

// Récupérer une tâche par ID
export async function getTaskById(id) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
  if (!response.ok) throw new Error("Tâche non trouvée");
  return response.json();
}

// Mettre à jour une tâche
export async function updateTask(id, task) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour de la tâche");
  return response.json();
}

// Supprimer une tâche
export async function deleteTask(id) {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression de la tâche");
  return response.json();
} 