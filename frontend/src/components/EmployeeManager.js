import React, { useState, useEffect } from 'react';
import { getEmployees, addEmployee, deleteEmployee } from '../api/employees';
import EmployeeEditModal from './EmployeeEditModal';

const ROLES = [
  { value: 'user', label: 'Utilisateur (saisie uniquement)' },
  { value: 'admin', label: 'Administrateur (dashboard + gestion)' },
];

export default function EmployeeManager() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    fonction: '',
    departement: '',
    actif: true,
    role: 'user',
    password: 'password123',
  });

  // Charger les utilisateurs
  const loadEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
              setError('Erreur lors du chargement des utilisateurs');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      nom: '',
      email: '',
      fonction: '',
      departement: '',
      actif: true,
      role: 'user',
      password: 'password123',
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  // Soumettre le formulaire (ajout uniquement)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addEmployee(formData);
      await loadEmployees();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

      // Éditer un utilisateur
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

      // Mettre à jour un utilisateur
  const handleUpdate = (updatedEmployee) => {
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
  };

      // Supprimer un utilisateur
  const handleDelete = async (id) => {
          if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          <svg className="w-7 h-7 inline-block mr-2 text-primary-500 align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Gestion des Utilisateurs
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold flex items-center gap-2 text-base hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 border border-error-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="mb-6 p-6 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Ajouter un nouvel utilisateur</h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleFormChange}
                  required
                  placeholder="Ex: Jean Dupont"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  placeholder="exemple@entreprise.com"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Fonction
                </label>
                <input
                  type="text"
                  name="fonction"
                  value={formData.fonction}
                  onChange={handleFormChange}
                  placeholder="Ex: Développeur"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Catégorie
                </label>
                <select
                  name="departement"
                  value={formData.departement}
                  onChange={handleFormChange}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value="">Non définie</option>
                  <option value="Chantier">Chantier</option>
                  <option value="Projet">Projet</option>
                  <option value="Société">Société</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  Rôle *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  required
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  placeholder="Mot de passe par défaut"
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="actif"
                checked={formData.actif}
                onChange={handleFormChange}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
              <label className="ml-2 text-sm text-gray-700">Utilisateur actif</label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm rounded-2xl overflow-hidden shadow-md bg-white">
            <thead className="bg-gradient-to-r from-primary-50 to-primary-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Nom</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fonction</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Département</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Rôle</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Statut</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-primary-50/60 transition-colors group">
                  <td className="px-4 py-3 font-medium text-left text-gray-900 whitespace-nowrap">{employee.nom}</td>
                  <td className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">{employee.email}</td>
                  <td className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">{employee.fonction || '-'}</td>
                  <td className="px-4 py-3 text-left text-gray-700 whitespace-nowrap">{employee.departement || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${{
                      admin: 'bg-primary-100 text-primary-800 border-primary-200',
                      user: 'bg-gray-100 text-gray-800 border-gray-200'
                    }[employee.role]}`}>{employee.role === 'admin' ? 'Admin' : 'Utilisateur'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${{
                      true: 'bg-success-100 text-success-800 border-success-200',
                      false: 'bg-error-100 text-error-800 border-error-200'
                    }[employee.actif]}`}>{employee.actif ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="bg-primary-100 hover:bg-primary-200 text-primary-700 hover:text-primary-900 p-2 rounded-full shadow-sm transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9-9a2.121 2.121 0 10-3-3l-9 9z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="bg-error-100 hover:bg-error-200 text-error-700 hover:text-error-900 p-2 rounded-full shadow-sm transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal d'édition */}
      <EmployeeEditModal
        employee={editingEmployee}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEmployee(null);
        }}
        onUpdate={handleUpdate}
      />
    </div>
  );
} 