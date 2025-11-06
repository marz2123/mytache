import React, { useEffect, useState } from 'react';
import { getTasks, deleteTask, updateTask, sendReminder } from '../api/tasks';
import TaskEditModal from './TaskEditModal';

export default function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ 
    date: '', 
    category: '', 
    employee_name: '', 
    status: '', 
    priority: '' 
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    
    // Si c'est un utilisateur normal, pré-remplir le filtre avec son nom
    if (user && user.role !== 'admin') {
      setFilters(prev => ({ ...prev, employee_name: user.nom }));
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getTasks(filters);
      setTasks(data);
    } catch (err) {
      console.error('Erreur lors du chargement des tâches:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [filters]);

  const handleEdit = (task) => {
    // Vérifier les permissions
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      alert('Vous ne pouvez modifier que vos propres tâches');
      return;
    }
    
    // Ouvrir la modal d'édition
    setSelectedTask(task);
    setShowEditModal(true);
  };

  // Nouvelle fonction pour changer rapidement le statut
  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Vérifier les permissions
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      alert('Vous ne pouvez modifier que vos propres tâches');
      return;
    }

    try {
      // Ne mettre à jour que le statut pour éviter les problèmes de conversion de date
      // On récupère la tâche complète depuis le backend après la mise à jour
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (taskId) => {
    // Vérifier les permissions
    const task = tasks.find(t => t.id === taskId);
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      alert('Vous ne pouvez supprimer que vos propres tâches');
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      alert('Erreur lors de la suppression de la tâche');
    }
  };

  const handleSendReminder = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Vérifier les permissions
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      alert('Vous ne pouvez envoyer un rappel que pour vos propres tâches');
      return;
    }

    if (!window.confirm(`Envoyer un rappel par email à ${task.employee_name} pour la tâche "${task.task_name}" ?`)) {
      return;
    }

    try {
      const result = await sendReminder(taskId);
      alert(result.message || 'Rappel envoyé avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'envoi du rappel');
    }
  };

  const handleUpdate = (updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Terminé': return 'bg-success-100 text-success-800';
      case 'En cours': return 'bg-primary-100 text-primary-800';
      case 'À faire': return 'bg-info-100 text-info-800';
      case 'En pause': return 'bg-warning-100 text-warning-800';
      case 'Annulé': return 'bg-error-100 text-error-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgente': return 'bg-error-100 text-error-800';
      case 'Normale': return 'bg-primary-100 text-primary-800';
      case 'Basse': return 'bg-success-100 text-success-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir la date française actuelle
  const getFrenchDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}));
  };

  const calculateTimeRemaining = (task) => {
    console.log('=== CALCUL TIME REMAINING ===');
    console.log('Task data:', {
      id: task.id,
      employee_name: task.employee_name,
      date: task.date,
      start_time: task.start_time,
      estimated_duration: task.estimated_duration
    });

    // Vérifier si on a au moins une date
    if (!task.date) {
      return { text: 'Aucune date', color: 'bg-gray-100 text-gray-800' };
    }

    const taskDate = new Date(task.date);
    const today = getFrenchDate();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    
    console.log('Date comparison:', {
      taskDate: taskDate,
      today: today,
      taskDateMs: taskDate.getTime(),
      todayMs: today.getTime()
    });

    // Si date < date d'aujourd'hui (passée)
    if (taskDate.getTime() < today.getTime()) {
      if (task.status === 'Terminé') {
        return { text: 'Terminé', color: 'bg-success-100 text-success-800' };
      }
      const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        text: `En retard de ${daysDiff}j`, 
        color: 'bg-error-100 text-error-800' 
      };
    }
    
    // Si la date est aujourd'hui
    if (taskDate.getTime() === today.getTime()) {
      console.log('Date = aujourd\'hui');
      
      if (!task.start_time) {
        return { text: 'Date aujourd\'hui', color: 'bg-blue-100 text-blue-800' };
      }

      const now = getFrenchDate();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit
      
      // Parser l'heure de début (format "HH:MM:SS")
      const startTimeParts = task.start_time.split(':');
      const startHour = parseInt(startTimeParts[0]);
      const startMinute = parseInt(startTimeParts[1]);
      const startTimeMinutes = startHour * 60 + startMinute;
      
      console.log('Time comparison:', {
        currentTime: currentTime,
        startTimeMinutes: startTimeMinutes,
        startTime: task.start_time
      });

      // Si l'heure de début est dans le futur
      if (startTimeMinutes > currentTime) {
        const diffMinutes = startTimeMinutes - currentTime;
        const diffHours = Math.floor(diffMinutes / 60);
        const remainingMinutes = diffMinutes % 60;
        
        let timeText = '';
        if (diffHours > 0) {
          timeText = `${diffHours}h`;
          if (remainingMinutes > 0) timeText += `${remainingMinutes}m`;
        } else {
          timeText = `${remainingMinutes}m`;
        }
        
        return { text: `Commence dans ${timeText}`, color: 'bg-blue-100 text-blue-800' };
      }

      // Si l'heure de début est passée ou actuelle
      if (!task.estimated_duration) {
        return { text: 'En cours', color: 'bg-yellow-100 text-yellow-800' };
      }

      // Calculer le temps restant basé sur la durée estimée
      const durationMatch = task.estimated_duration.match(/(\d+)h(\d+)?/);
      if (!durationMatch) {
        return { text: 'En cours', color: 'bg-yellow-100 text-yellow-800' };
      }

      const estimatedHours = parseInt(durationMatch[1]);
      const estimatedMinutes = durationMatch[2] ? parseInt(durationMatch[2]) : 0;
      const totalEstimatedMinutes = estimatedHours * 60 + estimatedMinutes;
      
      // Calculer quand la tâche devrait se terminer
      const endTimeMinutes = startTimeMinutes + totalEstimatedMinutes;
      const remainingMinutes = endTimeMinutes - currentTime;
      
      console.log('Duration calculation:', {
        estimatedHours,
        estimatedMinutes,
        totalEstimatedMinutes,
        endTimeMinutes,
        remainingMinutes
      });

      if (remainingMinutes <= 0) {
        // La durée estimée a dépassé
        const overdueHours = Math.floor(Math.abs(remainingMinutes) / 60);
        const overdueMinutes = Math.abs(remainingMinutes) % 60;
        
        let overdueText = '';
        if (overdueHours > 0) {
          overdueText = `${overdueHours}h`;
          if (overdueMinutes > 0) overdueText += `${overdueMinutes}m`;
        } else {
          overdueText = `${overdueMinutes}m`;
        }
        
        return { text: `En retard de ${overdueText}`, color: 'bg-red-100 text-red-800' };
      }

      // Afficher le temps restant
      const remainingHours = Math.floor(remainingMinutes / 60);
      const finalRemainingMinutes = remainingMinutes % 60;
      
      let remainingText = '';
      if (remainingHours > 0) {
        remainingText = `${remainingHours}h`;
        if (finalRemainingMinutes > 0) remainingText += `${finalRemainingMinutes}m`;
      } else {
        remainingText = `${finalRemainingMinutes}m`;
      }
      
      return { text: `${remainingText} restant`, color: 'bg-orange-100 text-orange-800' };
    }
    
    // Si date > date aujourd'hui (futur)
    const daysDiff = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { 
      text: `Dans ${daysDiff}j`, 
      color: 'bg-success-100 text-success-800' 
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="w-full space-y-6">
        
        {/* En-tête du dashboard avec design moderne */}
        {/* supprimé */}

        {/* Carte principale avec design moderne */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-blue-200/50 to-purple-200/50 p-6 md:p-8">
          
          {/* Filtres avec design moderne */}
          <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 border border-blue-200/50 p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                Filtres
              </h3>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilters({})}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date || ''}
                  onChange={e => setFilters({...filters, date: e.target.value})}
                  className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  Catégorie
                </label>
                <select
                  value={filters.category || ''}
                  onChange={e => setFilters({...filters, category: e.target.value})}
                  className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="">Toutes</option>
          <option value="Chantier">Chantier</option>
          <option value="Projet">Projet</option>
          <option value="Société">Société</option>
        </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Utilisateur
                </label>
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur"
                  value={filters.employee_name || ''}
                  onChange={e => setFilters({...filters, employee_name: e.target.value})}
                  className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  Statut
                </label>
                <select
                  value={filters.status || ''}
                  onChange={e => setFilters({...filters, status: e.target.value})}
                  className="w-full border-2 border-orange-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="">Tous</option>
                  <option value="À faire">À faire</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
        </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Priorité
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={e => setFilters({...filters, priority: e.target.value})}
                  className="w-full border-2 border-red-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="">Toutes</option>
          <option value="Basse">Basse</option>
          <option value="Normale">Normale</option>
          <option value="Urgente">Urgente</option>
        </select>
              </div>
            </div>
      </div>

          {/* Tableau des tâches avec design moderne */}
        <div className="overflow-x-auto">
            <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 border border-blue-200/50 rounded-2xl shadow-lg">
              <table className="min-w-[1400px] w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Utilisateur
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                        </div>
                        Catégorie
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Tâche
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        Statut
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-teal-500 to-teal-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Temps restant
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Priorité
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Lieu
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Collaboration
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Créée le
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </div>
                        Actions
                      </div>
                    </th>
              </tr>
            </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasks.map((task) => {
                    const timeRemaining = calculateTimeRemaining(task);
                    return (
                      <tr key={task.id} className="hover:bg-blue-50/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {task.employee_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {task.task_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all duration-200 cursor-pointer ${getStatusColor(task.status)}`}
                            >
                              <option value="À faire">À faire</option>
                              <option value="En cours">En cours</option>
                              <option value="Terminé">Terminé</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(task.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {task.collaborator ? (
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-700 font-medium">{task.collaborator}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(task.created_at).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleSendReminder(task.id)}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200 p-1 rounded-lg hover:bg-yellow-100"
                              title="Envoyer un rappel par email"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-lg hover:bg-blue-100"
                              title="Modifier la tâche"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-lg hover:bg-red-100"
                              title="Supprimer la tâche"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </td>
                </tr>
                    );
                  })}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && selectedTask && (
  <TaskEditModal
    task={selectedTask}
    isOpen={showEditModal}
    onClose={() => {
      setShowEditModal(false);
      setSelectedTask(null);
    }}
    onUpdate={handleUpdate}
  />
      )}
    </div>
  );
} 