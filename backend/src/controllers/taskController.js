const taskModel = require('../models/taskModel');
const { sendMail } = require('../utils/emailGraph');
const employeeModel = require('../models/employeeModel');

// Ajouter une tâche
exports.addTask = async (req, res) => {
  try {
    // Récupérer l'utilisateur connecté depuis les headers
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    
    // Si l'utilisateur n'est pas admin, vérifier qu'il ne peut créer que des tâches pour lui-même
    if (currentUser && currentUser.role !== 'admin') {
      if (req.body.employee_name !== currentUser.nom) {
        return res.status(403).json({ 
          error: 'Vous ne pouvez créer des tâches que pour vous-même' 
        });
      }
    }
    
    const newTask = await taskModel.addTask(req.body);
    
    // Envoyer un email automatique à la personne assignée
    try {
      const employee = await employeeModel.getEmployeeByName(req.body.employee_name);
      if (employee && employee.email) {
        const emailContent = {
          to: employee.email,
          subject: `🎯 Nouvelle tâche assignée : ${req.body.task_name}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Nouvelle Tâche Assignée</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 15px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Tâche" width="30" height="30" style="vertical-align:middle;">
                  </div>
                  <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Nouvelle Tâche Assignée</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px 20px;">
                  <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 20px; font-weight: 500;">Bonjour ${employee.nom},</h2>
                  <p style="color: #4a5568; font-size: 16px; margin: 0 0 25px 0; line-height: 1.5;">Une nouvelle tâche vous a été assignée :</p>
                  
                  <!-- Task Card -->
                  <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                      <div style="width: 40px; height: 40px; background: #48bb78; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                        <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Tâche" width="20" height="20" style="vertical-align:middle;">
                      </div>
                      <h3 style="color: #2d3748; margin: 0; font-size: 18px; font-weight: 600;">${req.body.task_name}</h3>
                    </div>
                    
                    <!-- Task Details Grid -->
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                      
                      <!-- Date -->
                      <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Calendrier" width="16" height="16" style="vertical-align:middle;">
                        </div>
                        <div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                          <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.date || 'Non spécifiée'}</div>
                        </div>
                      </div>
                      
                      <!-- Time -->
                      <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="width: 32px; height: 32px; background: #ed8936; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Horloge" width="16" height="16" style="vertical-align:middle;">
                        </div>
                        <div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Heure</div>
                          <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.start_time || 'Non spécifiée'}</div>
                        </div>
                      </div>
                      
                      <!-- Location -->
                      <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Localisation" width="16" height="16" style="vertical-align:middle;">
                        </div>
                        <div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${req.body.locationType === 'projet' ? 'Projet' : req.body.locationType === 'chantier' ? 'Chantier' : 'Lieu'}</div>
                          <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.location || 'Non spécifié'}</div>
                        </div>
                      </div>
                      
                      <!-- Duration -->
                      <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="width: 32px; height: 32px; background: #38b2ac; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Durée" width="16" height="16" style="vertical-align:middle;">
                        </div>
                        <div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Durée</div>
                          <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.estimated_duration || 'Non spécifiée'}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Status & Priority -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                      <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                          <div style="width: 24px; height: 24px; background: #3182ce; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Statut" width="14" height="14" style="vertical-align:middle;">
                          </div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Statut</div>
                        </div>
                        <span style="background: #e6fffa; color: #234e52; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                          ${req.body.status || 'En attente'}
                        </span>
                      </div>
                      
                      <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                          <div style="width: 24px; height: 24px; background: #e53e3e; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Priorité" width="14" height="14" style="vertical-align:middle;">
                          </div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Priorité</div>
                        </div>
                        <span style="background: #fef5e7; color: #744210; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                          ${req.body.priority || 'Normale'}
                        </span>
                      </div>
                    </div>
                    
                    ${req.body.comment ? `
                      <div style="margin-top: 20px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                          <div style="width: 24px; height: 24px; background: #ec4899; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Commentaires" width="14" height="14" style="vertical-align:middle;">
                          </div>
                          <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Commentaires</div>
                        </div>
                        <div style="color: #4a5568; font-size: 14px; font-style: italic; line-height: 1.4;">${req.body.comment}</div>
                      </div>
                    ` : ''}
                  </div>
                  
                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'https://mytache.groupemyhome.com'}" 
                       style="display:inline-block;
                              background-color:#667eea;
                              color:#ffffff;
                              padding:14px 28px;
                              text-decoration:none;
                              border-radius:8px;
                              font-weight:600;
                              font-size:16px;">
                      Accéder à MyTâches
                    </a>
                  </div>
                </div>
                
                <!-- Footer -->
                <div style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.4;">
                    Cet email a été envoyé automatiquement par le système MyTâches.<br>
                    Pour toute question, contactez votre administrateur.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        
        await sendMail(emailContent);
        console.log(`✅ Email envoyé à ${employee.email} pour la tâche : ${req.body.task_name}`);
      }
      
      // Envoyer des emails aux collaborateurs si ils sont spécifiés
      if (req.body.collaborator && req.body.collaborator.trim() !== '') {
        const collaboratorNames = req.body.collaborator.split(',').map(name => name.trim()).filter(name => name !== '');
        
        for (const collaboratorName of collaboratorNames) {
          try {
            const collaborator = await employeeModel.getEmployeeByName(collaboratorName);
            if (collaborator && collaborator.email) {
              // Email spécifique pour les collaborateurs
              const collaboratorEmailContent = {
                to: collaborator.email,
                subject: `🤝 Collaboration : ${req.body.task_name}`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Collaboration Tâche</title>
                  </head>
                  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                      
                      <!-- Header -->
                      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 15px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Collaboration" width="30" height="30" style="vertical-align:middle;">
                        </div>
                        <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Collaboration Demandée</h1>
                      </div>
                      
                      <!-- Content -->
                      <div style="padding: 30px 20px;">
                        <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 20px; font-weight: 500;">Bonjour ${collaborator.nom},</h2>
                        <p style="color: #4a5568; font-size: 16px; margin: 0 0 25px 0; line-height: 1.5;">Vous avez été invité à collaborer sur cette tâche :</p>
                        
                        <!-- Task Card -->
                        <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                          <div style="display: flex; align-items: center; margin-bottom: 20px;">
                            <div style="width: 40px; height: 40px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Tâche" width="20" height="20" style="vertical-align:middle;">
                            </div>
                            <h3 style="color: #2d3748; margin: 0; font-size: 18px; font-weight: 600;">${req.body.task_name}</h3>
                          </div>
                          
                          <!-- Task Details -->
                          <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Calendrier" width="16" height="16" style="vertical-align:middle;">
                              </div>
                              <div>
                                <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                                <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.date || 'Non spécifiée'}</div>
                              </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <div style="width: 32px; height: 32px; background: #ed8936; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Horloge" width="16" height="16" style="vertical-align:middle;">
                              </div>
                              <div>
                                <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Heure</div>
                                <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.start_time || 'Non spécifiée'}</div>
                              </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Localisation" width="16" height="16" style="vertical-align:middle;">
                              </div>
                              <div>
                                <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${req.body.locationType === 'projet' ? 'Projet' : req.body.locationType === 'chantier' ? 'Chantier' : 'Lieu'}</div>
                                <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.location || 'Non spécifié'}</div>
                              </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <div style="width: 32px; height: 32px; background: #38b2ac; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Durée" width="16" height="16" style="vertical-align:middle;">
                              </div>
                              <div>
                                <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Durée</div>
                                <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${req.body.estimated_duration || 'Non spécifiée'}</div>
                              </div>
                            </div>
                          </div>
                          
                          ${req.body.collaboration ? `
                            <div style="margin-top: 20px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                <div style="width: 24px; height: 24px; background: #ec4899; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Collaboration" width="14" height="14" style="vertical-align:middle;">
                                </div>
                                <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Détails de la collaboration</div>
                              </div>
                              <div style="color: #4a5568; font-size: 14px; font-style: italic; line-height: 1.4;">${req.body.collaboration}</div>
                            </div>
                          ` : ''}
                          
                          <div style="margin-top: 20px; padding: 12px; background: #fef3cd; border-radius: 8px; border: 1px solid #f6e05e;">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                              <div style="width: 24px; height: 24px; background: #f59e0b; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Assigné" width="14" height="14" style="vertical-align:middle;">
                              </div>
                              <div style="color: #92400e; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Tâche assignée à</div>
                            </div>
                            <div style="color: #92400e; font-size: 14px; font-weight: 500;">${employee.nom}</div>
                          </div>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${process.env.FRONTEND_URL || 'https://mytache.groupemyhome.com'}" 
                             style="display:inline-block;
                                    background-color:#10b981;
                                    color:#ffffff;
                                    padding:14px 28px;
                                    text-decoration:none;
                                    border-radius:8px;
                                    font-weight:600;
                                    font-size:16px;">
                            Voir la tâche dans MyTâches
                          </a>
                        </div>
                      </div>
                      
                      <!-- Footer -->
                      <div style="background: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <p style="color: #718096; font-size: 14px; margin: 0; line-height: 1.4;">
                          Cet email a été envoyé automatiquement par le système MyTâches.<br>
                          Pour toute question, contactez votre administrateur.
                        </p>
                      </div>
                    </div>
                  </body>
                  </html>
                `
              };
              
              await sendMail(collaboratorEmailContent);
              console.log(`🤝 Email de collaboration envoyé à ${collaborator.email} pour la tâche : ${req.body.task_name}`);
            } else {
              console.log(`⚠️ Collaborateur "${collaboratorName}" non trouvé ou pas d'email`);
            }
          } catch (collaboratorError) {
            console.error(`❌ Erreur envoi email collaborateur "${collaboratorName}":`, collaboratorError);
          }
        }
      }
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Ne pas faire échouer la création de tâche si l'email échoue
    }
    
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Erreur ajout tâche:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la tâche' });
  }
};

// Récupérer toutes les tâches (avec filtres et permissions)
exports.getTasks = async (req, res) => {
  try {
    const filters = {
      date: req.query.date,
      category: req.query.category,
      employee_name: req.query.employee_name,
      status: req.query.status
    };

    // Récupérer l'utilisateur connecté depuis les headers ou session
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    
    // Si c'est un utilisateur normal (non-admin), filtrer par son nom
    if (currentUser && currentUser.role !== 'admin') {
      filters.employee_name = currentUser.nom;
    }

    const tasks = await taskModel.getTasks(filters);
    res.json(tasks);
  } catch (err) {
    console.error('Erreur récupération tâches:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
};

// Récupérer une tâche par ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Vérifier les permissions
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    if (currentUser && currentUser.role !== 'admin' && task.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Accès non autorisé à cette tâche' });
    }
    
    res.json(task);
  } catch (err) {
    console.error('Erreur récupération tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la tâche' });
  }
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
  try {
    console.log('=== UPDATE TASK ===');
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    // Vérifier les permissions avant la mise à jour
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    console.log('Current user:', currentUser);
    
    const existingTask = await taskModel.getTaskById(req.params.id);
    console.log('Existing task:', existingTask);
    
    if (!existingTask) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Seul l'admin ou le propriétaire de la tâche peut la modifier
    if (currentUser && currentUser.role !== 'admin' && existingTask.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que vos propres tâches' });
    }
    
    const updatedTask = await taskModel.updateTask(req.params.id, req.body);
    console.log('Updated task:', updatedTask);
    res.json(updatedTask);
  } catch (err) {
    console.error('Erreur mise à jour tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  try {
    // Vérifier les permissions avant la suppression
    const currentUser = req.headers['x-current-user'] ? JSON.parse(req.headers['x-current-user']) : null;
    const existingTask = await taskModel.getTaskById(req.params.id);
    
    if (!existingTask) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Seul l'admin ou le propriétaire de la tâche peut la supprimer
    if (currentUser && currentUser.role !== 'admin' && existingTask.employee_name !== currentUser.nom) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres tâches' });
    }
    
    const deletedTask = await taskModel.deleteTask(req.params.id);
    res.json({ message: 'Tâche supprimée avec succès', task: deletedTask });
  } catch (err) {
    console.error('Erreur suppression tâche:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
}; 