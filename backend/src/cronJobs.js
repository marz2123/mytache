const cron = require('node-cron');
const { sendMail } = require('./utils/emailGraph');
const taskModel = require('./models/taskModel');
const employeeModel = require('./models/employeeModel');
const logger = require('./utils/logger');
const dotenv = require('dotenv');
dotenv.config();

// Configurer le timezone français
process.env.TZ = 'Europe/Paris';

// Liste des employés (à récupérer dynamiquement)
let EMPLOYEES = [];

// Fonction pour charger les employés
async function loadEmployees() {
  try {
    const employees = await employeeModel.getEmployees();
    EMPLOYEES = employees.filter(emp => emp.actif);
    logger.info(`✅ ${EMPLOYEES.length} employés chargés pour les rappels`);
  } catch (error) {
    logger.error('❌ Erreur chargement employés', error);
    EMPLOYEES = [];
  }
}

// Charger les employés au démarrage
loadEmployees();

// 1. Rappel quotidien à 9h pour saisir les tâches
cron.schedule('0 9 * * *', async () => {
  logger.info('🕘 Début rappel quotidien 9h');
  const today = new Date().toISOString().slice(0, 10);
  
  for (const emp of EMPLOYEES) {
    try {
      const tasks = await taskModel.getTasks({ date: today, employee_name: emp.nom });
    if (tasks.length === 0) {
      await sendMail({
        to: emp.email,
        subject: 'Rappel : Merci de saisir vos tâches du jour',
          text: `Bonjour ${emp.nom},\n\nMerci de saisir vos tâches du jour sur MyTâches.\n\nCordialement,\nL'équipe MyTâches`
      });
        logger.info(`✅ Email de rappel envoyé à ${emp.email}`);
      }
    } catch (error) {
      logger.error(`❌ Erreur rappel ${emp.nom}`, error);
    }
  }
  logger.info('✅ Rappels quotidiens terminés');
});

// 2. Récapitulatif quotidien à 18h pour le boss
cron.schedule('0 18 * * *', async () => {
  logger.info('🕕 Début récapitulatif quotidien 18h');
  const today = new Date().toISOString().slice(0, 10);
  
  try {
    const allTasks = await taskModel.getTasks({ date: today });
    
    if (allTasks.length === 0) {
      logger.info('📝 Aucune tâche aujourd\'hui');
      return;
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Récapitulatif des tâches du ${today}</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <h2>📊 Récapitulatif des tâches du ${today}</h2>
        <p>Total des tâches : ${allTasks.length}</p>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px;">Employé</th>
            <th style="padding: 8px;">Tâche</th>
            <th style="padding: 8px;">Statut</th>
            <th style="padding: 8px;">Heure</th>
            <th style="padding: 8px;">Lieu</th>
            <th style="padding: 8px;">Priorité</th>
          </tr>
    `;

    for (const task of allTasks) {
      html += `
        <tr>
          <td style="padding: 8px;">${task.employee_name}</td>
          <td style="padding: 8px;">${task.task_name}</td>
          <td style="padding: 8px;">${task.status}</td>
          <td style="padding: 8px;">${task.start_time || ''}</td>
          <td style="padding: 8px;">${task.location || ''}</td>
          <td style="padding: 8px;">${task.priority || ''}</td>
        </tr>
      `;
    }

    html += `
        </table>
        <p style="margin-top: 20px; color: #666;">
          Ce récapitulatif est envoyé automatiquement par MyTâches.
        </p>
      </body>
      </html>
    `;

    if (process.env.BOSS_EMAIL) {
  await sendMail({
    to: process.env.BOSS_EMAIL,
    subject: `Récapitulatif des tâches du ${today}`,
        html: html
      });
      logger.info(`✅ Récapitulatif envoyé au boss (${process.env.BOSS_EMAIL}) pour le ${today}`);
    } else {
      logger.warn('⚠️ BOSS_EMAIL non configuré. Le récapitulatif quotidien ne sera pas envoyé.');
    }
    
  } catch (error) {
    logger.error('❌ Erreur récapitulatif', error);
  }
});

// 3. Système de rappels automatiques pour les tâches
// Vérifier toutes les 5 minutes les tâches qui commencent bientôt
const sentReminders = new Set();

cron.schedule('*/5 * * * *', async () => {
  try {
    // Recharger les employés périodiquement
    if (EMPLOYEES.length === 0) {
      await loadEmployees();
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    
    // Récupérer toutes les tâches d'aujourd'hui
    const tasks = await taskModel.getTasks({ date: today });
    
    for (const task of tasks) {
      if (!task.start_time || !task.reminder) continue;
      
      try {
        // Calculer le temps de rappel
        const [hours, minutes] = task.start_time.split(':').map(Number);
        const taskDateTime = new Date(today + 'T' + task.start_time);
        const reminderMinutes = parseInt(task.reminder);
        
        if (isNaN(reminderMinutes)) continue;
        
        const reminderTime = new Date(taskDateTime.getTime() - (reminderMinutes * 60 * 1000));
        const timeDiff = now.getTime() - reminderTime.getTime();
        
        // Vérifier si c'est le moment d'envoyer le rappel (dans les 5 dernières minutes)
        if (timeDiff >= 0 && timeDiff <= 5 * 60 * 1000) {
          const reminderKey = `${task.id}_${reminderMinutes}`;
          
          if (sentReminders.has(reminderKey)) continue;
          
          // Trouver l'employé
          const employee = EMPLOYEES.find(emp => emp.nom === task.employee_name);
          if (!employee || !employee.email) continue;
          
          // Créer le message de rappel
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
                <title>Rappel de Tâche</title>
              </head>
              <body style="font-family: Arial, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h2 style="color: #2d3748;">⏰ Rappel de Tâche</h2>
                  <p>Bonjour ${employee.nom},</p>
                  <p style="font-size: 18px; color: #e53e3e; font-weight: bold;">${reminderMessage}</p>
                  <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <h3>Détails de la tâche :</h3>
                    <p><strong>${task.task_name}</strong></p>
                    <p>Date : ${task.date} à ${task.start_time}</p>
                    ${task.location ? `<p>Lieu : ${task.location}</p>` : ''}
                    ${task.priority ? `<p>Priorité : ${task.priority}</p>` : ''}
                  </div>
                  <p style="text-align: center;">
                    <a href="https://mytache.groupemyhome.com" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir sur MyTâches</a>
                  </p>
                </div>
              </body>
              </html>
            `
          });
          
          logger.info(`✅ Rappel envoyé à ${employee.email} pour la tâche : ${task.task_name}`);
          
          // Envoyer des rappels aux collaborateurs si ils sont spécifiés
          if (task.collaborator && task.collaborator.trim() !== '') {
            const collaboratorNames = task.collaborator.split(',').map(name => name.trim()).filter(name => name !== '');
            
            for (const collaboratorName of collaboratorNames) {
              try {
                const collaborator = await employeeModel.getEmployeeByName(collaboratorName);
                if (collaborator && collaborator.email) {
                  const collaboratorReminderKey = `${task.id}_${reminderMinutes}_${collaboratorName}`;
                  
                  if (!sentReminders.has(collaboratorReminderKey)) {
                    await sendMail({
                      to: collaborator.email,
                      subject: `🤝 Rappel collaboration : ${reminderMessage}`,
                      html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <meta charset="utf-8">
                          <title>Rappel de Collaboration</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; background-color: #f8fafc;">
                          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d3748;">🤝 Rappel de Collaboration</h2>
                            <p>Bonjour ${collaborator.nom},</p>
                            <p style="font-size: 18px; color: #e53e3e; font-weight: bold;">${reminderMessage}</p>
                            <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; margin: 20px 0;">
                              <h3>Détails de la tâche :</h3>
                              <p><strong>${task.task_name}</strong></p>
                              <p>Date : ${task.date} à ${task.start_time}</p>
                              <p>Assigné à : ${task.employee_name}</p>
                              ${task.location ? `<p>Lieu : ${task.location}</p>` : ''}
                              ${task.priority ? `<p>Priorité : ${task.priority}</p>` : ''}
                            </div>
                            <p style="text-align: center;">
                              <a href="https://mytache.groupemyhome.com" style="background-color: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Voir sur MyTâches</a>
                            </p>
                          </div>
                        </body>
                        </html>
                      `
                    });
                    
                    sentReminders.add(collaboratorReminderKey);
                    logger.info(`🤝 Rappel collaboration envoyé à ${collaborator.email} pour la tâche : ${task.task_name}`);
                  }
                } else {
                  logger.warn(`⚠️ Collaborateur "${collaboratorName}" non trouvé ou pas d'email pour le rappel`);
                }
              } catch (collaboratorReminderError) {
                logger.error(`❌ Erreur rappel collaborateur "${collaboratorName}"`, collaboratorReminderError);
              }
            }
          }
          
          // Marquer comme envoyé pour éviter les doublons
          sentReminders.add(reminderKey);
          logger.info(`📝 Rappel marqué comme envoyé: ${reminderKey}`);
        }
      } catch (taskError) {
        logger.error(`❌ Erreur traitement tâche ${task.id}`, taskError);
      }
    }
  } catch (error) {
    logger.error('❌ Erreur système de rappels', error);
  }
});

// 4. Nettoyage périodique des rappels envoyés (toutes les heures)
cron.schedule('0 * * * *', () => {
  logger.info(`🧹 Nettoyage des rappels - ${sentReminders.size} rappels en mémoire`);
});

logger.info('📧 Système de rappels email initialisé');
logger.info('⏰ Rappels quotidiens : 9h (saisie tâches) et 18h (récapitulatif boss)');
logger.info('🔔 Rappels tâches : toutes les 5 minutes selon timing choisi');