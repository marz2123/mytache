const cron = require('node-cron');
const { sendMail } = require('./utils/emailGraph');
const taskModel = require('./models/taskModel');
const employeeModel = require('./models/employeeModel');
const dotenv = require('dotenv');
dotenv.config();

// Configurer le timezone français
process.env.TZ = 'Europe/Paris';

// Set pour éviter les rappels multiples
const sentReminders = new Set();

// Liste statique des employés à surveiller (adapter selon besoin)
const EMPLOYEES = [
  { name: 'Alice', email: 'alice@exemple.com' },
  { name: 'Bob', email: 'bob@exemple.com' },
  // Ajoute tous les employés ici
];

// 1. Rappel à 9h si aucun formulaire n’a été soumis
cron.schedule('0 9 * * *', async () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const emp of EMPLOYEES) {
    const tasks = await taskModel.getTasks({ date: today, employee_name: emp.name });
    if (tasks.length === 0) {
      await sendMail({
        to: emp.email,
        subject: 'Rappel : Merci de saisir vos tâches du jour',
        text: `Bonjour ${emp.name},\n\nMerci de saisir vos tâches du jour sur MyTâches.`,
      });
    }
  }
  console.log('Rappels envoyés à 9h');
});

// 2. Récapitulatif au boss chaque fin de journée (ex: 18h)
cron.schedule('0 18 * * *', async () => {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = await taskModel.getTasks({ date: today });
  let html = `<h2>Récapitulatif des tâches du ${today}</h2>`;
  if (tasks.length === 0) {
    html += '<p>Aucune tâche saisie aujourd\'hui.</p>';
  } else {
    html += '<table border="1" cellpadding="4" cellspacing="0"><tr><th>Employé</th><th>Catégorie</th><th>Tâche</th><th>Statut</th><th>Deadline</th></tr>';
    for (const t of tasks) {
      html += `<tr>
        <td>${t.employee_name}</td>
        <td>${t.category}</td>
        <td>${t.task_name}</td>
        <td>${t.status}</td>
        <td>${t.deadline || ''}</td>
      </tr>`;
    }
    html += '</table>';
  }
  await sendMail({
    to: process.env.BOSS_EMAIL,
    subject: `Récapitulatif des tâches du ${today}`,
    html,
  });
  console.log('Récapitulatif envoyé au boss à 18h');
});

// 3. Système de rappels automatiques pour les tâches
// Vérifier toutes les 5 minutes les tâches qui commencent bientôt
cron.schedule('*/5 * * * *', async () => {
  console.log('🔄 CRON JOB RAPPELS EXECUTE - Vérification toutes les 5 minutes');
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // Format HH:MM
    const currentDate = now.toISOString().slice(0, 10); // Format YYYY-MM-DD
    
    console.log(`🔍 Vérification des rappels à ${currentTime} le ${currentDate}`);
    
    // Récupérer toutes les tâches du jour
    const todayTasks = await taskModel.getTasks({ date: currentDate });
    console.log(`📋 ${todayTasks.length} tâches trouvées pour aujourd'hui`);
    
    for (const task of todayTasks) {
      console.log(`📝 Tâche: ${task.task_name}, Heure: ${task.start_time}, Rappel: ${task.reminder}, Statut: ${task.status}`);
      
      if (task.start_time && task.status !== 'Terminée' && task.reminder) {
        const taskTime = task.start_time.slice(0, 5); // Format HH:MM
        const taskDateTime = new Date(`${currentDate}T${task.start_time}`);
        const timeDiff = taskDateTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        console.log(`⏰ Tâche ${task.task_name}: ${minutesDiff} minutes avant le début`);
        
        // Rappel selon le délai choisi par l'utilisateur
        const reminderMinutes = parseInt(task.reminder);
        
        // Fenêtre élargie : rappel si on est dans la période avant la tâche
        const isTimeForReminder = (minutesDiff <= reminderMinutes && minutesDiff >= reminderMinutes - 10);
        
        // Test immédiat : si une tâche commence dans moins de 10 minutes, forcer un rappel
        const isImmediateReminder = (minutesDiff <= 10 && minutesDiff >= 0);
        
        if (isTimeForReminder || isImmediateReminder) {
          // Créer une clé unique pour éviter les rappels multiples (avec fallback)
          const reminderKey = `${task.id || task.task_name}-${task.employee_name}-${currentDate}`;
          console.log(`🔑 Clé de rappel générée: ${reminderKey}`);
          
          if (!sentReminders.has(reminderKey)) {
            console.log(`🚨 Rappel déclenché pour ${task.task_name} (${reminderMinutes} minutes)`);
            console.log(`👤 Recherche employé: "${task.employee_name}"`);
            const employee = await employeeModel.getEmployeeByName(task.employee_name);
            console.log(`👤 Employé trouvé pour rappel:`, employee ? `${employee.nom} (${employee.email})` : 'NON TROUVÉ');
            
            if (employee && employee.email) {
            // Générer le message selon le délai
            let reminderMessage = '';
            if (reminderMinutes === 0) {
              reminderMessage = 'Votre tâche commence maintenant !';
            } else if (reminderMinutes < 60) {
              reminderMessage = `Votre tâche commence dans ${reminderMinutes} minute${reminderMinutes > 1 ? 's' : ''} !`;
            } else if (reminderMinutes < 1440) {
              const hours = Math.floor(reminderMinutes / 60);
              reminderMessage = `Votre tâche commence dans ${hours} heure${hours > 1 ? 's' : ''} !`;
            } else {
              const days = Math.floor(reminderMinutes / 1440);
              reminderMessage = `Votre tâche commence dans ${days} jour${days > 1 ? 's' : ''} !`;
            }
            
            await sendMail({
              to: employee.email,
              subject: `⏰ Rappel : ${reminderMessage}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Rappel de Tâche</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px 20px; text-align: center;">
                      <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 15px;">
                        <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Rappel" width="30" height="30" style="vertical-align:middle;">
                      </div>
                      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Rappel de Tâche</h1>
                    </div>
                    
                    <!-- Alert Banner -->
                    <div style="background: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 0;">
                      <div style="display: flex; align-items: center;">
                        <div style="width: 32px; height: 32px; background: #f6ad55; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Alerte" width="16" height="16" style="vertical-align:middle;">
                        </div>
                        <h2 style="color: #744210; margin: 0; font-size: 18px; font-weight: 600;">${reminderMessage}</h2>
                      </div>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 30px 20px;">
                      <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 20px; font-weight: 500;">Bonjour ${employee.nom},</h2>
                      <p style="color: #4a5568; font-size: 16px; margin: 0 0 25px 0; line-height: 1.5;">Votre tâche commence bientôt :</p>
                      
                      <!-- Task Card -->
                      <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <div style="display: flex; align-items: center; margin-bottom: 20px;">
                          <div style="width: 40px; height: 40px; background: #48bb78; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                            <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Tâche" width="20" height="20" style="vertical-align:middle;">
                          </div>
                          <h3 style="color: #2d3748; margin: 0; font-size: 18px; font-weight: 600;">${task.task_name}</h3>
                        </div>
                        
                        <!-- Task Details Grid -->
                        <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                          
                          <!-- Time (Highlighted) -->
                          <div style="display: flex; align-items: center; padding: 16px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px;">
                            <div style="width: 36px; height: 36px; background: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Urgent" width="18" height="18" style="vertical-align:middle;">
                            </div>
                            <div>
                              <div style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Heure de début</div>
                              <div style="color: #dc2626; font-size: 18px; font-weight: 700;">${task.start_time}</div>
                            </div>
                          </div>
                          
                          <!-- Date -->
                          <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Calendrier" width="16" height="16" style="vertical-align:middle;">
                            </div>
                            <div>
                              <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                              <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.date}</div>
                            </div>
                          </div>
                          
                          <!-- Location -->
                          <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Localisation" width="16" height="16" style="vertical-align:middle;">
                            </div>
                            <div>
                              <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${task.locationType === 'projet' ? 'Projet' : task.locationType === 'chantier' ? 'Chantier' : 'Lieu'}</div>
                              <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.location || 'Non spécifié'}</div>
                            </div>
                          </div>
                          
                          <!-- Duration -->
                          <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="width: 32px; height: 32px; background: #38b2ac; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Durée" width="16" height="16" style="vertical-align:middle;">
                            </div>
                            <div>
                              <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Durée</div>
                              <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.estimated_duration || 'Non spécifiée'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Priority -->
                        <div style="margin-top: 20px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                          <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 24px; height: 24px; background: #e53e3e; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Priorité" width="14" height="14" style="vertical-align:middle;">
                            </div>
                            <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Priorité</div>
                          </div>
                          <span style="background: #fef5e7; color: #744210; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                            ${task.priority || 'Normale'}
                          </span>
                        </div>
                        
                        ${task.comment ? `
                          <div style="margin-top: 20px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                              <div style="width: 24px; height: 24px; background: #ec4899; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                                <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Commentaires" width="14" height="14" style="vertical-align:middle;">
                              </div>
                              <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Commentaires</div>
                            </div>
                            <div style="color: #4a5568; font-size: 14px; font-style: italic; line-height: 1.4;">${task.comment}</div>
                          </div>
                        ` : ''}
                      </div>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://mytache.groupemyhome.com'}" 
                           style="display:inline-block;
                                  background-color:#ff6b6b;
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
            });
            console.log(`✅ Rappel envoyé à ${employee.email} pour la tâche : ${task.task_name}`);
            
            // Envoyer des rappels aux collaborateurs si ils sont spécifiés
            if (task.collaborator && task.collaborator.trim() !== '') {
              const collaboratorNames = task.collaborator.split(',').map(name => name.trim()).filter(name => name !== '');
              
              for (const collaboratorName of collaboratorNames) {
                try {
                  const collaborator = await employeeModel.getEmployeeByName(collaboratorName);
                  if (collaborator && collaborator.email) {
                    // Créer une clé unique pour les rappels collaborateurs
                    const collaboratorReminderKey = `${task.id || task.task_name}-${collaboratorName}-${currentDate}-collaborator`;
                    
                    if (!sentReminders.has(collaboratorReminderKey)) {
                      await sendMail({
                        to: collaborator.email,
                        subject: `⏰ Rappel Collaboration : ${reminderMessage}`,
                        html: `
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta charset="utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Rappel Collaboration</title>
                          </head>
                          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                              
                              <!-- Header -->
                              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px 20px; text-align: center;">
                                <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 50%; margin-bottom: 15px;">
                                  <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Rappel" width="30" height="30" style="vertical-align:middle;">
                                </div>
                                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">Rappel Collaboration</h1>
                              </div>
                              
                              <!-- Alert Banner -->
                              <div style="background: #fef5e7; border-left: 4px solid #f6ad55; padding: 20px; margin: 0;">
                                <div style="display: flex; align-items: center;">
                                  <div style="width: 32px; height: 32px; background: #f6ad55; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                    <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Alerte" width="16" height="16" style="vertical-align:middle;">
                                  </div>
                                  <h2 style="color: #744210; margin: 0; font-size: 18px; font-weight: 600;">${reminderMessage}</h2>
                                </div>
                              </div>
                              
                              <!-- Content -->
                              <div style="padding: 30px 20px;">
                                <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 20px; font-weight: 500;">Bonjour ${collaborator.nom},</h2>
                                <p style="color: #4a5568; font-size: 16px; margin: 0 0 25px 0; line-height: 1.5;">Votre collaboration sur cette tâche commence bientôt :</p>
                                
                                <!-- Task Card -->
                                <div style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
                                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                                    <div style="width: 40px; height: 40px; background: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                      <img src="https://cdn-icons-png.flaticon.com/512/61/61112.png" alt="Tâche" width="20" height="20" style="vertical-align:middle;">
                                    </div>
                                    <h3 style="color: #2d3748; margin: 0; font-size: 18px; font-weight: 600;">${task.task_name}</h3>
                                  </div>
                                  
                                  <!-- Time Highlighted -->
                                  <div style="display: flex; align-items: center; padding: 16px; background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; margin-bottom: 15px;">
                                    <div style="width: 36px; height: 36px; background: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                      <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Urgent" width="18" height="18" style="vertical-align:middle;">
                                    </div>
                                    <div>
                                      <div style="color: #991b1b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Heure de début</div>
                                      <div style="color: #dc2626; font-size: 18px; font-weight: 700;">${task.start_time}</div>
                                    </div>
                                  </div>
                                  
                                  <!-- Task Details -->
                                  <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                                    <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                                      <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Calendrier" width="16" height="16" style="vertical-align:middle;">
                                      </div>
                                      <div>
                                        <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
                                        <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.date}</div>
                                      </div>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                                      <div style="width: 32px; height: 32px; background: #9f7aea; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Localisation" width="16" height="16" style="vertical-align:middle;">
                                      </div>
                                      <div>
                                        <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${task.locationType === 'projet' ? 'Projet' : task.locationType === 'chantier' ? 'Chantier' : 'Lieu'}</div>
                                        <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.location || 'Non spécifié'}</div>
                                      </div>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                                      <div style="width: 32px; height: 32px; background: #38b2ac; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/833/833593.png" alt="Durée" width="16" height="16" style="vertical-align:middle;">
                                      </div>
                                      <div>
                                        <div style="color: #4a5568; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Durée</div>
                                        <div style="color: #2d3748; font-size: 14px; font-weight: 500;">${task.estimated_duration || 'Non spécifiée'}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
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
                      });
                      
                      sentReminders.add(collaboratorReminderKey);
                      console.log(`🤝 Rappel collaboration envoyé à ${collaborator.email} pour la tâche : ${task.task_name}`);
                    }
                  } else {
                    console.log(`⚠️ Collaborateur "${collaboratorName}" non trouvé ou pas d'email pour le rappel`);
                  }
                } catch (collaboratorReminderError) {
                  console.error(`❌ Erreur rappel collaborateur "${collaboratorName}":`, collaboratorReminderError);
                }
              }
            }
            
            // Marquer comme envoyé pour éviter les doublons
            sentReminders.add(reminderKey);
            console.log(`📝 Rappel marqué comme envoyé: ${reminderKey}`);
            } else {
              console.log(`❌ Employé non trouvé ou pas d'email pour ${task.employee_name}`);
            }
          } else {
            console.log(`⚠️ Rappel déjà envoyé pour ${task.task_name} aujourd'hui`);
          }
        } else {
          console.log(`⏳ Pas encore l'heure du rappel pour ${task.task_name} (dans ${minutesDiff} min, rappel à ${reminderMinutes} min)`);
        }
      } else {
        console.log(`❌ Tâche ${task.task_name} ignorée: heure=${task.start_time}, statut=${task.status}, rappel=${task.reminder}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur système de rappels:', error);
  }
});

// 4. Rappel quotidien à 8h pour les tâches de la journée
cron.schedule('0 8 * * *', async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = await taskModel.getTasks({ date: today });
    
    // Grouper les tâches par employé
    const tasksByEmployee = {};
    for (const task of todayTasks) {
      if (!tasksByEmployee[task.employee_name]) {
        tasksByEmployee[task.employee_name] = [];
      }
      tasksByEmployee[task.employee_name].push(task);
    }
    
    // Envoyer un récapitulatif à chaque employé
    for (const [employeeName, tasks] of Object.entries(tasksByEmployee)) {
      const employee = await employeeModel.getEmployeeByName(employeeName);
      if (employee && employee.email) {
        let html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">📅 Vos Tâches du Jour</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-top: 0;">Bonjour ${employee.nom},</h2>
              <p style="font-size: 16px; color: #555;">Voici un récapitulatif de vos tâches pour aujourd'hui :</p>
        `;
        
        for (const task of tasks) {
          html += `
            <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 10px 0;">
              <h3 style="color: #667eea; margin: 0 0 10px 0;">📋 ${task.task_name}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                <div><strong>⏰ Heure :</strong> ${task.start_time || 'Non spécifiée'}</div>
                <div><strong>📍 Lieu :</strong> ${task.location || 'Non spécifié'}</div>
                <div><strong>⚡ Priorité :</strong> ${task.priority || 'Normale'}</div>
                <div><strong>🎯 Statut :</strong> ${task.status || 'En attente'}</div>
              </div>
            </div>
          `;
        }
        
        html += `
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  📱 Voir toutes vos tâches
                </a>
              </div>
            </div>
          </div>
        `;
        
        await sendMail({
          to: employee.email,
          subject: `📅 Récapitulatif de vos tâches du ${today}`,
          html
        });
        
        console.log(`✅ Récapitulatif quotidien envoyé à ${employee.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur récapitulatif quotidien:', error);
  }
}); 