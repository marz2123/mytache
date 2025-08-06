import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation({ currentUser, onLogout }) {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center py-4 space-y-4 md:space-y-0">
          {/* Logo à gauche */}
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              MyTâches
            </h1>
          </div>
          
          {/* Navigation centrée */}
          <div className="flex-1 flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <Link
              to="/saisie"
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-center ${
                location.pathname === '/saisie'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Saisie des Tâches</span>
              <span className="sm:hidden">Saisie</span>
            </Link>
            
            {/* Dashboard accessible à tous mais avec des permissions différentes */}
            <Link
              to="/dashboard"
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-center ${
                location.pathname === '/dashboard'
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              {currentUser.role === 'admin' ? 'Dashboard' : 'Mes Tâches'}
            </Link>
          </div>
          
          {/* Informations utilisateur à droite */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Avatar avec initiales nom et prénom */}
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-semibold">
              {currentUser.nom.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
            </div>
            
            {/* Rôle utilisateur - caché sur mobile */}
            <div className={`hidden sm:block px-2 md:px-3 py-1 rounded-full text-xs font-medium ${
              currentUser.role === 'admin' 
                ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {currentUser.role === 'admin' ? 'Admin' : 'User'}
            </div>
            
            {/* Bouton de déconnexion moderne - juste icône */}
            <button
              onClick={onLogout}
              className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-full hover:from-error-600 hover:to-error-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              title="Déconnexion"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 