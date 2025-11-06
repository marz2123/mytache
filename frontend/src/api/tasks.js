// Utiliser le backend local en développement, Railway en production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mytache-production.up.railway.app' 
  : 'http://localhost:5000';

// Fonction helper pour obtenir les headers avec l'utilisateur connecté
const getHeaders = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return {
    "Content-Type": "application/json",
    ...(currentUser && { "x-current-user": JSON.stringify(currentUser) })
  };
};

export const getTasks = async (filters = {}) => {
  // Construire l'URL avec les filtres
  const params = new URLSearchParams();
  if (filters.date) params.append('date', filters.date);
  if (filters.category) params.append('category', filters.category);
  if (filters.employee_name) params.append('employee_name', filters.employee_name);
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/api/tasks?${queryString}` : `${API_BASE_URL}/api/tasks`;
  
  const response = await fetch(url, {
    headers: getHeaders() // ✅ Ajouter les headers avec l'utilisateur
  });
  return response.json();
};

export const addTask = async (task) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: getHeaders(), // ✅ Ajouter les headers
    body: JSON.stringify(task)
  });
  return response.json();
};

export const updateTask = async (id, task) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(), // ✅ Ajouter les headers
    body: JSON.stringify(task)
  });
  return response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders() // ✅ Ajouter les headers
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression de la tâche");
  return response.json();
};

export const sendReminder = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/remind`, {
    method: 'POST',
    headers: getHeaders() // ✅ Ajouter les headers
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'envoi du rappel");
  }
  return response.json();
}; 