# 🚀 Checklist de mise en production - MyTâches

## ✅ Corrections techniques terminées

- [x] URLs hardcodées corrigées (localhost → variables d'environnement)
- [x] Modèles d'email avec icônes modernes
- [x] Emails aux collaborateurs implémentés
- [x] Système de rappels amélioré
- [x] Champ Projet/Chantier/Lieu ajouté

## 🔧 Actions à effectuer

### **1. Base de données**
- [ ] Exécuter le script `add_location_type_column.sql` sur Railway
- [ ] Vérifier que la colonne `locationType` est ajoutée

### **2. Variables d'environnement Railway**
- [ ] `FRONTEND_URL` = `https://mytache.groupemyhome.com`
- [ ] `DATABASE_URL` = URL de votre base PostgreSQL Railway
- [ ] `EMAIL_FROM` = Votre adresse email d'envoi
- [ ] `BOSS_EMAIL` = Email du responsable pour les récapitulatifs
- [ ] Vérifier les credentials Microsoft Graph API ou SendGrid

### **3. Variables d'environnement Vercel (Frontend)**
- [ ] `REACT_APP_API_URL` = `https://mytache-production.up.railway.app`

### **4. Tests en production**
- [ ] Créer une tâche test
- [ ] Vérifier l'email de création
- [ ] Tester un rappel (tâche dans 5-10 minutes)
- [ ] Tester avec des collaborateurs
- [ ] Vérifier les liens dans les emails

### **5. Monitoring**
- [ ] Vérifier les logs Railway
- [ ] Surveiller les erreurs d'email
- [ ] Tester les cron jobs (rappels automatiques)

### **6. Sécurité**
- [ ] Vérifier les permissions CORS
- [ ] S'assurer que les credentials sont sécurisés
- [ ] Tester l'authentification

## 🎯 URLs de production

- **Frontend** : https://mytache.groupemyhome.com
- **Backend API** : https://mytache-production.up.railway.app
- **Base de données** : PostgreSQL sur Railway

## 📧 Configuration email

Vérifier que l'un de ces systèmes fonctionne :
1. **Microsoft Graph API** (recommandé)
2. **SendGrid** (alternatif)
3. **SMTP classique** (fallback)

## 🔄 Déploiement

1. **Backend** : Push vers Railway (automatique)
2. **Frontend** : Push vers Vercel (automatique)
3. **Base de données** : Exécuter les migrations SQL

## ⚠️ Points d'attention

- Les cron jobs ne fonctionnent que si le serveur Railway reste actif
- Tester les rappels avec des heures proches
- Vérifier que tous les employés ont des emails valides
- Surveiller les logs pour détecter les erreurs

