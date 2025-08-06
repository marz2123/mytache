const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Authentifier un utilisateur
export const login = async (nom, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nom, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de l\'authentification');
  }
  
  return response.json();
}; 