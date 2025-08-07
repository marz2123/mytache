import React, { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import { login } from '../api/auth';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger la liste des utilisateurs actifs
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        console.log('🔍 Chargement des employés...');
        const data = await getEmployees();
        console.log('✅ Employés chargés:', data);
        setEmployees(data); // Supprimer le filtre actif
      } catch (err) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', err);
      }
    };
    
    // Charger les employés au démarrage, pas seulement quand la modal s'ouvre
    loadEmployees();
  }, []); // Dépendance vide pour charger une seule fois

  // Gérer la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!selectedEmployee || !password) {
      setError('Veuillez saisir votre email et mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Tentative de connexion pour:', selectedEmployee);
      console.log('📧 Email envoyé:', selectedEmployee);
      console.log(' Mot de passe envoyé:', password);
      
      const response = await login({
        email: selectedEmployee, // ✅ Envoyer email au lieu de nom
        password: password
      });
      
      console.log('✅ Réponse de connexion:', response);
      
      if (response.success) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        onLogin(response.user);
        onClose();
      } else {
        setError(response.error || 'Erreur de connexion');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      setError('Erreur de connexion');
    }
    
    setLoading(false);
  };

  // Réinitialiser le formulaire
  const handleClose = () => {
    setSelectedEmployee('');
    setPassword('');
    setShowPassword(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Connexion</h2>
          <p className="text-gray-600 mt-2">Entrez vos identifiants pour continuer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              Email *
            </label>
            <input
              type="email"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              placeholder="Entrez votre email"
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center mr-2">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 