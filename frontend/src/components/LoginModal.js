import React, { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import { login } from '../api/auth';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
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
      setError('Veuillez sélectionner un utilisateur et saisir le mot de passe');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await login({
        email: selectedEmployee.email,
        password: password
      });
      
      console.log('✅ Réponse de connexion:', response);
      
      if (response.success) {
        // Connexion réussie
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        onLogin(response.user);
        onClose();
      } else {
        // Erreur de connexion
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-bounce-in">
        {/* En-tête */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
          <p className="text-sm md:text-base text-gray-600">Sélectionnez votre compte pour continuer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Sélectionner un utilisateur *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            >
                              <option value="">Choisir un utilisateur</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.nom}>
                  {emp.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 7-3 9-3 9s3 2 3 9a6 6 0 006-6m-8-4a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                placeholder="Entrez votre mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-primary-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error-50 text-error-700 rounded-lg border-2 border-error-200 text-sm animate-bounce-in">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border-2 border-gray-200 hover:border-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>

        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>
    </div>
  );
} 