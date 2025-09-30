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

// Récupérer tous les employés
export const getEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/api/employees`);
  return response.json();
};

// Récupérer un employé par ID
export async function getEmployeeById(id) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error("Employé non trouvé");
  return response.json();
}

// Ajouter un employé
export async function addEmployee(employee) {
  const response = await fetch(`${API_BASE_URL}/api/employees`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(employee),
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout de l'employé");
  return response.json();
}

// Mettre à jour un employé
export async function updateEmployee(id, employee) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(employee),
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'employé");
  return response.json();
}

// Supprimer un employé
export async function deleteEmployee(id) {
  const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression de l'employé");
  return response.json();
} 