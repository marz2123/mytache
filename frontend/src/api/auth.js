// Utiliser le backend local en développement, Railway en production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mytache-production.up.railway.app' 
  : 'http://localhost:5000';

export const login = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  return response.json();
}; 