import React, { useState, useEffect } from 'react';
import TaskDashboard from '../components/TaskDashboard';
import EmployeeManager from '../components/EmployeeManager';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' ou 'employees'
  const [currentUser, setCurrentUser] = useState(null);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-2 md:px-4">

        
        {/* Onglets - seulement pour les admins */}
        {isAdmin && (
          <div className="flex mb-4 md:mb-6 bg-white rounded-lg shadow-lg">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 text-center font-medium rounded-l-lg transition-colors text-sm md:text-base ${
                activeTab === 'tasks'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tâches
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex-1 py-2 md:py-3 px-3 md:px-4 text-center font-medium rounded-r-lg transition-colors text-sm md:text-base ${
                activeTab === 'employees'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Utilisateurs
            </button>
          </div>
        )}

        {/* Contenu des onglets */}
        {isAdmin ? (
                      // Pour les admins : onglets avec tâches et utilisateurs
          activeTab === 'tasks' ? (
            <TaskDashboard />
          ) : (
            <EmployeeManager />
          )
        ) : (
                      // Pour les utilisateurs : seulement les tâches
          <TaskDashboard />
        )}
      </div>
    </div>
  );
} 