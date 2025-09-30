# 🧪 Guide de Test du Système de Rappels

## ✅ **FONCTIONNALITÉS IMPLÉMENTÉES**

### **1. 🎯 Interface Utilisateur**
- ✅ **Champ rappel** ajouté dans le formulaire de tâche
- ✅ **Position** : Juste en dessous de "Date - Heure de début - Durée estimée"
- ✅ **Design** : Style Outlook avec liste déroulante
- ✅ **Options** : Aucun, 0 min, 1 min, 5 min, 10 min, 15 min, 30 min, 1h, 2h, 3h, 4h, 8h, 1 jour, 2 jours, 1 semaine

### **2. 🗄️ Base de Données**
- ✅ **Colonne `reminder`** ajoutée à la table `tasks`
- ✅ **Type** : INTEGER (minutes)
- ✅ **Valeurs** : NULL (aucun), 0 (au début), 5 (5 min avant), etc.

### **3. 🔧 Backend**
- ✅ **Fonction `addTask`** : Gère le champ reminder
- ✅ **Fonction `updateTask`** : Gère le champ reminder
- ✅ **Système de rappels** : Utilise le délai personnalisé

### **4. ⏰ Système de Rappels**
- ✅ **Vérification** : Toutes les 5 minutes
- ✅ **Logique** : Rappel selon le délai choisi par l'utilisateur
- ✅ **Messages** : Dynamiques selon le délai (minutes/heures/jours)
- ✅ **Filtrage** : Seulement les tâches avec rappel activé

---

## 🧪 **TESTS À EFFECTUER**

### **Test 1 : Interface Utilisateur**
1. **Ouvrir** le formulaire de création de tâche
2. **Vérifier** que le champ "Rappel" est présent
3. **Tester** la liste déroulante avec toutes les options
4. **Vérifier** le design (couleur jaune, icône horloge)

### **Test 2 : Création de Tâche**
1. **Créer** une tâche avec rappel "5 min avant"
2. **Vérifier** que la tâche est sauvegardée avec le rappel
3. **Créer** une tâche avec rappel "Aucun"
4. **Vérifier** que la tâche est sauvegardée sans rappel

### **Test 3 : Modification de Tâche**
1. **Modifier** une tâche existante
2. **Changer** le rappel de "Aucun" à "10 min avant"
3. **Vérifier** que la modification est sauvegardée

### **Test 4 : Système de Rappels**
1. **Créer** une tâche avec heure de début dans 10 minutes
2. **Définir** le rappel à "5 min avant"
3. **Attendre** 5 minutes
4. **Vérifier** que l'email de rappel est envoyé

### **Test 5 : Messages Dynamiques**
1. **Tester** avec rappel "0 min" → "Votre tâche commence maintenant !"
2. **Tester** avec rappel "5 min" → "Votre tâche commence dans 5 minutes !"
3. **Tester** avec rappel "60 min" → "Votre tâche commence dans 1 heure !"
4. **Tester** avec rappel "1440 min" → "Votre tâche commence dans 1 jour !"

---

## 📋 **ÉTAPES DE DÉPLOIEMENT**

### **1. Mise à jour de la base de données**
```sql
-- Exécuter le script SQL
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder INTEGER DEFAULT NULL;
```

### **2. Redémarrage du serveur**
```bash
# Arrêter le serveur
# Redémarrer le serveur
npm start
```

### **3. Test de l'interface**
1. **Ouvrir** l'application
2. **Créer** une tâche avec rappel
3. **Vérifier** que le champ fonctionne

### **4. Test du système de rappels**
1. **Créer** une tâche avec rappel court (1-2 minutes)
2. **Attendre** le délai
3. **Vérifier** l'email de rappel

---

## 🎯 **RÉSULTATS ATTENDUS**

### **Interface Utilisateur**
- ✅ Champ rappel visible et fonctionnel
- ✅ Liste déroulante avec toutes les options
- ✅ Design cohérent avec le reste du formulaire

### **Base de Données**
- ✅ Colonne `reminder` créée
- ✅ Valeurs sauvegardées correctement
- ✅ Mise à jour fonctionnelle

### **Système de Rappels**
- ✅ Rappels envoyés selon le délai choisi
- ✅ Messages dynamiques selon le délai
- ✅ Emails avec design professionnel

### **Fonctionnalités**
- ✅ Création de tâche avec rappel
- ✅ Modification de tâche avec rappel
- ✅ Suppression de rappel (choix "Aucun")
- ✅ Rappels automatiques fonctionnels

---

## 🚀 **DÉPLOIEMENT EN PRODUCTION**

### **1. Script SQL en production**
```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder INTEGER DEFAULT NULL;
```

### **2. Redéploiement**
```bash
git add .
git commit -m "Ajout du système de rappels personnalisés"
git push origin main
```

### **3. Vérification**
- ✅ Interface fonctionnelle
- ✅ Base de données mise à jour
- ✅ Système de rappels opérationnel

**Le système de rappels personnalisés est maintenant prêt ! 🎉**
