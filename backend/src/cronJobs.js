const cron = require('node-cron');
const { sendMail } = require('./utils/email');
const taskModel = require('./models/taskModel');
const dotenv = require('dotenv');
dotenv.config();

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