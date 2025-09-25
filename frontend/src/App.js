import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import SaisiePage from './pages/SaisiePage';
import DashboardPage from './pages/DashboardPage';
import LoginModal from './components/LoginModal';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setShowLoginModal(true);
    }
  }, []);

  // Gérer la connexion
  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowLoginModal(true);
  };

  // Si pas d'utilisateur connecté, afficher la modale de connexion
  if (!currentUser) {
    return (
      <div className="App">
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation currentUser={currentUser} onLogout={handleLogout} />
        <Routes>
          <Route path="/saisie" element={<SaisiePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<SaisiePage />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;
