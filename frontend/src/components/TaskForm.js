import React, { useState, useEffect, useRef } from 'react';
import { addTask } from '../api/tasks';
import { getEmployees } from '../api/employees';

const emptyTask = (category) => ({
  task_name: '',
  status: 'À faire',
  date: new Date().toISOString().split('T')[0],
  start_time: '',
  location: '',
  estimated_duration: '',
  priority: 'Normale',
  comment: '',
  collaboration: '',
  collaborator: '',
  additional_collaborators: ''
});

export default function TaskForm() {
  // Nom utilisateur et catégorie mémorisés
  const [formData, setFormData] = useState({
    employee_name: '',
    category: '',
    task_name: '',
    status: 'À faire',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    location: '',
    estimated_duration: '',
    priority: 'Normale',
    comment: '',
    collaboration: '' // Added collaboration field
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [defaultCategory, setDefaultCategory] = useState('');
  const [tasks, setTasks] = useState([emptyTask('')]);
  const [message, setMessage] = useState('');
  const [employees, setEmployees] = useState([]); // Added employees state
  const [speechingIdx, setSpeechingIdx] = useState(null);
  let recognitionRef = useRef(null);
  const [showSpeechInfo, setShowSpeechInfo] = useState(false);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    
    // Si on a un utilisateur connecté, pré-remplir les champs
    if (user) {
      setFormData(prev => ({
        ...prev,
        employee_name: user.nom,
        category: user.departement || 'Non définie'
      }));
      setDefaultCategory(user.departement || 'Non définie');
    }
  }, []);

  // Charger la liste des utilisateurs et mettre à jour la catégorie si nécessaire
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employeesList = await getEmployees();
        setEmployees(employeesList.filter(emp => emp.actif));
        
        // Si on a un utilisateur connecté, mettre à jour sa catégorie depuis la liste
        if (currentUser) {
          const updatedUser = employeesList.find(emp => emp.nom === currentUser.nom);
          if (updatedUser && updatedUser.departement !== currentUser.departement) {
            setFormData(prev => ({
              ...prev,
              category: updatedUser.departement || 'Non définie'
            }));
            setDefaultCategory(updatedUser.departement || 'Non définie');
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    };
    loadEmployees();
  }, [currentUser]);

  // Mémoriser nom et catégorie à chaque changement
  useEffect(() => {
    if (formData.employee_name) localStorage.setItem('employee_name', formData.employee_name);
  }, [formData.employee_name]);
  useEffect(() => {
    if (defaultCategory) localStorage.setItem('employee_category', defaultCategory);
  }, [defaultCategory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskChange = (idx, e) => {
    const { name, value } = e.target;
    const newTasks = [...tasks];
    newTasks[idx][name] = value;
    // Si la catégorie change, mémorise-la
    if (name === 'category') setDefaultCategory(value);
    setTasks(newTasks);
  };

  const addRow = () => setTasks([...tasks, emptyTask(defaultCategory)]);

  const removeRow = idx => {
    if (tasks.length === 1) return;
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.employee_name) {
      setMessage('Veuillez sélectionner un utilisateur assigné.');
      return;
    }
    try {
      for (const task of tasks) {
        // Créer la tâche principale
        await addTask({ 
          ...task, 
          employee_name: formData.employee_name, 
          category: task.category || defaultCategory 
        });
        
        // Si un collaborateur est sélectionné, créer une tâche pour lui
        if (task.collaborator && task.collaborator.trim() !== '') {
          const collaborationTask = {
            ...task,
            employee_name: task.collaborator,
            task_name: `[Collaboration] ${task.task_name}`,
            comment: `Collaboration avec ${formData.employee_name}: ${task.collaboration || 'Pas de description'}`,
            category: task.category || defaultCategory
          };
          await addTask(collaborationTask);
        }

        // Si des collaborateurs supplémentaires sont spécifiés (pour les admins)
        if (task.additional_collaborators && task.additional_collaborators.trim() !== '') {
          const additionalCollaborators = task.additional_collaborators
            .split(',')
            .map(name => name.trim())
            .filter(name => name !== '');

          for (const collaboratorName of additionalCollaborators) {
            const additionalCollaborationTask = {
              ...task,
              employee_name: collaboratorName,
              task_name: `[Collaboration] ${task.task_name}`,
              comment: `Collaboration avec ${formData.employee_name}: ${task.collaboration || 'Pas de description'}`,
              category: task.category || defaultCategory
            };
            await addTask(additionalCollaborationTask);
          }
        }
      }
      setMessage('Tâches ajoutées avec succès !');
      setTasks([emptyTask(defaultCategory)]);
    } catch (err) {
      setMessage("Erreur lors de l'ajout des tâches");
    }
  };

  function handleStartSpeech(idx) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setShowSpeechInfo(true);
      setTimeout(() => setShowSpeechInfo(false), 5000);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setSpeechingIdx(null);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTasks(tasks => {
        const newTasks = [...tasks];
        newTasks[idx].comment = (newTasks[idx].comment ? newTasks[idx].comment + ' ' : '') + transcript;
        return newTasks;
      });
    };
    recognition.onend = () => {
      setSpeechingIdx(null);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setSpeechingIdx(null);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    setSpeechingIdx(idx);
    recognition.start();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
        
        {/* En-tête du formulaire avec design moderne */}
        {/* supprimé */}
        
        {/* Carte principale avec design moderne */}
        <div className="bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-gradient-to-r from-blue-200/50 to-purple-200/50 p-8 md:p-10">
          
          {/* Indicateur admin */}
          {currentUser && currentUser.role === 'admin' && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-800">Mode Administrateur</h3>
                  <p className="text-sm text-purple-600">Vous pouvez créer des tâches pour tous les utilisateurs et gérer les collaborations multiples.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Nom utilisateur et catégorie avec design moderne */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                Utilisateur assigné *
              </label>
              {currentUser && currentUser.role === 'admin' ? (
                <select
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleInputChange}
                  required
                  className="w-full border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.nom}>{emp.nom}</option>
                  ))}
                </select>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium">
                  {currentUser ? currentUser.nom : formData.employee_name || 'Non connecté'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                Catégorie
              </label>
              {currentUser ? (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium">
                  {defaultCategory || 'Non définie'}
                </div>
              ) : (
        <select
          name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value="">Non définie</option>
          <option value="Chantier">Chantier</option>
          <option value="Projet">Projet</option>
                  <option value="Société">Société</option>
        </select>
              )}
            </div>
      </div>

      {tasks.map((task, idx) => (
            <div key={idx} className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/30 border-2 border-gradient-to-r from-orange-200/50 to-red-200/50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-up mb-8 relative overflow-hidden">
              {/* Effet de fond décoratif */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/20 to-red-100/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-red-100/20 to-pink-100/20 rounded-full translate-y-12 -translate-x-12"></div>
              
              {/* En-tête de la tâche avec design moderne */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-2 sm:space-y-0 relative z-10">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                    <span className="text-white font-bold text-lg">#{idx + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Tâche #{idx + 1}</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeRow(idx)} 
                  className="text-red-500 hover:text-red-700 text-sm px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center border border-red-200 hover:border-red-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Supprimer
                </button>
              </div>

              {/* Nom de la tâche avec design moderne */}
              <div className="mb-6 relative z-10">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Nom de la tâche *
                </label>
                <div className="relative">
            <input
              name="task_name"
              value={task.task_name}
              onChange={e => handleTaskChange(idx, e)}
              required
                    placeholder="Ex: Réparer la machine à café"
                    className="w-full border-2 border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
            />
                  <div className="absolute inset-0 rounded-xl border-2 border-green-300/30 pointer-events-none"></div>
                </div>
          </div>

              {/* Grille des champs avec design moderne */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 relative z-10">
                {/* Ligne 1 : Statut - Date - Heure de début */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    Statut *
                  </label>
                  <div className="relative">
            <select
              name="status"
              value={task.status}
              onChange={e => handleTaskChange(idx, e)}
              required
                      className="w-full border-2 border-blue-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
            >
                      <option value="">Choisir</option>
                      <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-300/30 pointer-events-none"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Date
                  </label>
                  <div className="relative">
            <input
                      name="date"
              type="date"
                      value={task.date}
                      onChange={e => handleTaskChange(idx, e)}
                      className="w-full border-2 border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-purple-300/30 pointer-events-none"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Heure de début
                  </label>
                  <div className="relative">
                    <input
                      name="start_time"
                      type="time"
                      value={task.start_time || ''}
              onChange={e => handleTaskChange(idx, e)}
                      className="w-full border-2 border-orange-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-orange-300/30 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Ligne 2 : Priorité - Durée estimée - Lieu */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 relative z-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Priorité
                  </label>
                  <div className="relative">
            <select
              name="priority"
              value={task.priority}
              onChange={e => handleTaskChange(idx, e)}
                      className="w-full border-2 border-red-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
            >
                      <option value="">Choisir</option>
              <option value="Basse">Basse</option>
              <option value="Normale">Normale</option>
              <option value="Urgente">Urgente</option>
            </select>
                    <div className="absolute inset-0 rounded-xl border-2 border-red-300/30 pointer-events-none"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Durée estimée
                  </label>
                  <div className="relative">
            <input
              name="estimated_duration"
              value={task.estimated_duration}
              onChange={e => handleTaskChange(idx, e)}
                      placeholder="Ex: 2h30"
                      className="w-full border-2 border-teal-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl border-2 border-teal-300/30 pointer-events-none"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Lieu
                  </label>
                  <div className="relative">
            <input
              name="location"
              value={task.location}
              onChange={e => handleTaskChange(idx, e)}
                      placeholder="Ex: Bureau 3"
                      className="w-full border-2 border-indigo-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg"
            />
                    <div className="absolute inset-0 rounded-xl border-2 border-indigo-300/30 pointer-events-none"></div>
                  </div>
                </div>
          </div>

              {/* Description de la tâche divisée en deux colonnes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                {/* Colonne gauche - Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Description de la tâche
                  </label>
                  <div className="relative">
          <textarea
            name="comment"
            value={task.comment}
            onChange={e => handleTaskChange(idx, e)}
                      placeholder="Décrivez les détails de la tâche..."
                      className="w-full border-2 border-pink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg resize-none pr-12"
                      rows={5}
                    />
                    {showSpeechInfo && (
                      <div className="absolute left-0 right-0 -bottom-10 mx-auto w-max bg-pink-100 text-pink-800 border border-pink-300 rounded-lg px-4 py-2 text-sm shadow-lg animate-fade-in z-20">
                        La dictée vocale n'est disponible que sur Google Chrome ou Microsoft Edge.
                      </div>
                    )}
                    {/* Bouton micro speech-to-text */}
          <button 
            type="button" 
                      aria-label="Saisir par la voix"
                      onClick={() => handleStartSpeech(idx)}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white border border-pink-200 hover:bg-pink-50 ${speechingIdx === idx ? 'bg-pink-500 animate-pulse' : ''}`}
          >
                      {/* Nouvelle icône micro moderne (Heroicons solid) */}
                      <svg className={`w-6 h-6 ${speechingIdx === idx ? 'text-white' : 'text-pink-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3zm5-3a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 0014 0z" />
                      </svg>
          </button>
                    <div className="absolute inset-0 rounded-xl border-2 border-pink-300/30 pointer-events-none"></div>
                  </div>
                </div>

                {/* Colonne droite - Collaboration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center mr-2 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Collaboration
                  </label>
                  
                  <div className="space-y-3">
                    {/* Ligne 1 : Choisir la personne */}
                    <div>
                      <div className="relative">
                        <select
                          name="collaborator"
                          value={task.collaborator || ''}
                          onChange={e => handleTaskChange(idx, e)}
                          className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg text-sm"
                        >
                          <option value="">Sélectionner une personne</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.nom}>{emp.nom}</option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl border-2 border-green-300/30 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Ligne 2 : Description de la collaboration */}
                    <div>
                      <div className="relative">
                        <textarea
                          name="collaboration"
                          value={task.collaboration || ''}
                          onChange={e => handleTaskChange(idx, e)}
                          placeholder="Décrivez ce que vous devez faire ensemble..."
                          className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg resize-none"
                          rows={3}
                        />
                        <div className="absolute inset-0 rounded-xl border-2 border-green-300/30 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Ligne 3 : Collaborateurs supplémentaires (pour les admins) */}
                    {currentUser && currentUser.role === 'admin' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Collaborateurs supplémentaires (séparés par des virgules)
                        </label>
                        <div className="relative">
                          <input
                            name="additional_collaborators"
                            value={task.additional_collaborators || ''}
                            onChange={e => handleTaskChange(idx, e)}
                            placeholder="Ex: Jean Dupont, Marie Martin"
                            className="w-full border-2 border-green-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm shadow-md hover:shadow-lg text-sm"
                          />
                          <div className="absolute inset-0 rounded-xl border-2 border-green-300/30 pointer-events-none"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
        </div>
      ))}
      
          {/* Boutons avec design moderne */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <button 
          type="button" 
          onClick={addRow} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center border-2 border-blue-400/30"
        >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter une tâche
        </button>
        <button 
          type="submit" 
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center border-2 border-green-400/30"
        >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
          Valider
        </button>
      </div>
      
          {/* Message avec design moderne */}
      {message && (
            <div className={`mt-8 p-6 rounded-2xl border-2 animate-bounce-in ${
              message.includes('succès') 
                ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-lg' 
                : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 shadow-lg'
            }`}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 shadow-md ${
                  message.includes('succès') ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {message.includes('succès') ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    )}
                  </svg>
                </div>
                <span className="text-lg font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>
    </form>
    </div>
  );
} 