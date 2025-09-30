# 📧 Guide du Système d'Email Automatique MyTâches

## 🎯 **FONCTIONNALITÉS IMPLÉMENTÉES**

### **1. 📨 Email automatique lors de création de tâche**
- ✅ **Déclenchement** : Automatique à chaque création de tâche
- ✅ **Destinataire** : La personne assignée à la tâche
- ✅ **Contenu** : Détails complets de la tâche avec design professionnel
- ✅ **Template** : Email HTML responsive avec toutes les informations

### **2. ⏰ Système de rappels automatiques**
- ✅ **Rappel 5 minutes avant** : Email automatique 5 minutes avant le début
- ✅ **Vérification** : Toutes les 5 minutes
- ✅ **Filtrage** : Seulement les tâches non terminées
- ✅ **Design** : Email d'alerte avec code couleur rouge

### **3. 📅 Récapitulatif quotidien**
- ✅ **Heure** : 8h00 chaque matin
- ✅ **Contenu** : Toutes les tâches de la journée
- ✅ **Destinataire** : Chaque employé avec ses tâches
- ✅ **Format** : Email structuré et professionnel

### **4. 📊 Récapitulatif admin**
- ✅ **Heure** : 18h00 chaque soir
- ✅ **Contenu** : Récapitulatif de toutes les tâches du jour
- ✅ **Destinataire** : Email admin configuré
- ✅ **Format** : Tableau HTML avec toutes les informations

---

## ⚙️ **CONFIGURATION REQUISE**

### **1. Fichier `.env` dans le dossier `backend` :**
```env
# Configuration de la base de données
DATABASE_URL=postgresql://username:password@localhost:5432/mytache

# Configuration du serveur
PORT=5000

# Configuration email Microsoft 365
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@groupemyhome.com
EMAIL_PASS=rwxjkmbjcdcpqmqd

# Email admin pour les récapitulatifs (optionnel)
BOSS_EMAIL=admin@groupemyhome.com
```

### **2. Dépendances installées :**
```bash
npm install nodemailer node-cron dotenv
```

---

## 🧪 **TEST DU SYSTÈME**

### **1. Test de l'email :**
```bash
cd backend
node test-email.js
```

### **2. Test de création de tâche :**
1. Créez une tâche via l'interface
2. Vérifiez que l'email est envoyé à la personne assignée
3. Vérifiez le contenu de l'email

### **3. Test des rappels :**
1. Créez une tâche avec une heure de début dans 10 minutes
2. Attendez 5 minutes
3. Vérifiez que le rappel est envoyé

---

## 📋 **FONCTIONNEMENT DÉTAILLÉ**

### **Email de création de tâche :**
- **Déclenchement** : Immédiat lors de `addTask()`
- **Contenu** : Nom de la tâche, date, heure, lieu, durée, priorité, statut, commentaires
- **Design** : Template HTML professionnel avec couleurs et icônes
- **Lien** : Bouton vers l'application MyTâches

### **Email de rappel :**
- **Déclenchement** : 5 minutes avant `start_time`
- **Contenu** : Informations essentielles de la tâche
- **Design** : Template d'alerte avec code couleur rouge
- **Fréquence** : Vérification toutes les 5 minutes

### **Récapitulatif quotidien :**
- **Déclenchement** : 8h00 chaque matin
- **Contenu** : Toutes les tâches de la journée par employé
- **Design** : Template structuré avec liste des tâches
- **Personnalisation** : Un email par employé avec ses tâches

---

## 🚀 **DÉPLOIEMENT EN PRODUCTION**

### **1. Variables d'environnement :**
- ✅ **EMAIL_HOST** : `smtp.office365.com`
- ✅ **EMAIL_PORT** : `587`
- ✅ **EMAIL_SECURE** : `false`
- ✅ **EMAIL_USER** : `admin@groupemyhome.com`
- ✅ **EMAIL_PASS** : `rwxjkmbjcdcpqmqd`

### **2. Configuration Railway :**
```bash
# Dans Railway, ajoutez ces variables d'environnement
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@groupemyhome.com
EMAIL_PASS=rwxjkmbjcdcpqmqd
```

### **3. Vérification :**
- ✅ **Test email** : `node test-email.js`
- ✅ **Logs** : Vérifiez les logs Railway
- ✅ **Fonctionnement** : Créez une tâche et vérifiez l'email

---

## 🔧 **DÉPANNAGE**

### **Problèmes courants :**

1. **Email non envoyé :**
   - Vérifiez les variables d'environnement
   - Vérifiez les logs du serveur
   - Testez avec `node test-email.js`

2. **Rappels non fonctionnels :**
   - Vérifiez que les cron jobs sont actifs
   - Vérifiez les logs des cron jobs
   - Vérifiez le format des dates/heures

3. **Erreurs de connexion :**
   - Vérifiez les paramètres SMTP
   - Vérifiez le mot de passe d'application
   - Vérifiez la configuration Microsoft 365

---

## 📈 **AMÉLIORATIONS FUTURES**

### **Fonctionnalités avancées :**
- 🔄 **Rappels personnalisés** : Choix du délai (5min, 15min, 1h)
- 📱 **Notifications push** : Intégration avec les notifications navigateur
- 🎨 **Templates personnalisés** : Personnalisation des emails par l'admin
- 📊 **Statistiques** : Suivi des emails envoyés et ouverts
- 🔔 **Rappels multiples** : Plusieurs rappels à différents moments

---

## ✅ **STATUT ACTUEL**

- ✅ **Email automatique** : Implémenté et fonctionnel
- ✅ **Rappels 5 minutes** : Implémenté et fonctionnel
- ✅ **Récapitulatif quotidien** : Implémenté et fonctionnel
- ✅ **Récapitulatif admin** : Implémenté et fonctionnel
- ✅ **Configuration Microsoft 365** : Configuré et testé
- ✅ **Templates HTML** : Design professionnel implémenté

**Le système d'email automatique est maintenant opérationnel ! 🎉**
