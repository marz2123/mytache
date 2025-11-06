# 📋 Guide : Comment voir les logs et diagnostiquer les problèmes sur Railway

## 🚨 Votre application MyTâches crash souvent sur Railway ?

Ce guide vous explique comment identifier et résoudre les problèmes.

---

## 🔍 **Méthode 1 : Voir les logs directement sur Railway (Recommandé)**

### Étape 1 : Accéder à votre projet Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **MyTâches**

### Étape 2 : Ouvrir les logs en temps réel
1. Cliquez sur votre **service backend** (celui qui exécute Node.js)
2. Cliquez sur l'onglet **"Logs"** ou **"Deployments"**
3. Vous verrez les logs en temps réel avec des timestamps

### Étape 3 : Filtrer les erreurs
Dans les logs, cherchez :
- `🚨 UNHANDLED REJECTION` - Promesses rejetées non gérées
- `🚨 UNCAUGHT EXCEPTION` - Exceptions non capturées
- `❌ Erreur` - Toutes les erreurs de l'application
- `⚠️ Warning` - Avertissements système

---

## 🔍 **Méthode 2 : Utiliser Railway CLI (Avancé)**

### Installation
```bash
npm install -g @railway/cli
railway login
```

### Voir les logs
```bash
# Se connecter au projet
railway link

# Voir les logs en temps réel
railway logs

# Voir les logs des dernières 100 lignes
railway logs --tail 100

# Filtrer les erreurs uniquement
railway logs | grep "ERROR"
```

---

## 🔍 **Méthode 3 : Exporter les logs**

### Via l'interface Railway
1. Dans l'onglet **Logs** de votre service
2. Cliquez sur **"Download"** ou **"Export"** (si disponible)
3. Les logs seront téléchargés au format texte

### Via Railway CLI
```bash
# Exporter les logs dans un fichier
railway logs > logs.txt

# Exporter uniquement les erreurs
railway logs | grep "ERROR" > errors.txt
```

---

## 🐛 **Types de problèmes courants et solutions**

### 1. **Erreurs de connexion à la base de données**
**Symptômes dans les logs :**
```
❌ Erreur de connexion: ...
❌ Erreur requête (tentative X/3): ...
```

**Solutions :**
- Vérifier que `DATABASE_URL` est bien configurée dans les variables d'environnement Railway
- Vérifier que la base de données PostgreSQL est active
- Les connexions sont maintenant automatiquement réessayées (3 tentatives)

### 2. **Erreurs d'envoi d'email**
**Symptômes dans les logs :**
```
❌ Erreur Graph API: ...
❌ Erreur rappel: ...
```

**Solutions :**
- Vérifier les variables Azure : `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
- Vérifier que `EMAIL_FROM` est configuré
- Les erreurs d'email ne font plus crasher l'application (elles sont catchées)

### 3. **Promesses rejetées non capturées**
**Symptômes dans les logs :**
```
🚨 UNHANDLED REJECTION - L'application pourrait crasher!
```

**Solutions :**
- Ces erreurs sont maintenant loggées mais ne font plus crasher l'application
- Cherchez le message d'erreur suivant pour identifier la cause
- Vérifiez les cron jobs et les appels API

### 4. **Exceptions non capturées**
**Symptômes dans les logs :**
```
🚨 UNCAUGHT EXCEPTION - Crash imminent!
```

**Solutions :**
- L'application va crasher mais les logs contiendront l'erreur complète
- Railway redémarrera automatiquement l'application
- Analysez la stack trace pour identifier le problème

---

## 📊 **Format des logs améliorés**

Tous les logs incluent maintenant :
- **Timestamp ISO** : `[2024-01-15T10:30:45.123Z]`
- **Niveau** : `[INFO]`, `[ERROR]`, `[WARN]`
- **Message** : Description claire de l'événement
- **Stack trace** : Pour les erreurs (si disponible)

**Exemple de log :**
```
[2024-01-15T10:30:45.123Z] [INFO] 🚀 Serveur backend démarré sur http://localhost:5000
[2024-01-15T10:30:46.456Z] [ERROR] ❌ Erreur chargement employés {
  message: 'Connection timeout',
  stack: '...',
  name: 'Error'
}
```

---

## 🔧 **Actions préventives mises en place**

✅ **Gestion globale des erreurs** : Toutes les erreurs non capturées sont maintenant loggées
✅ **Logging amélioré** : Tous les logs ont des timestamps et des niveaux
✅ **Retry automatique** : Les connexions DB sont réessayées 3 fois
✅ **Gestion des signaux** : Arrêt propre de l'application (SIGTERM, SIGINT)
✅ **Protection contre les crashes** : Les promesses rejetées ne font plus crasher l'app

---

## 🆘 **En cas de problème persistant**

1. **Copiez les logs** des 30 dernières minutes
2. **Identifiez le pattern** : Y a-t-il une erreur qui se répète ?
3. **Vérifiez les variables d'environnement** dans Railway
4. **Vérifiez l'état de la base de données** PostgreSQL
5. **Vérifiez les ressources** : Railway peut limiter la mémoire/CPU

---

## 📝 **Checklist de diagnostic**

- [ ] Les logs sont-ils visibles sur Railway ?
- [ ] Y a-t-il des erreurs `UNHANDLED REJECTION` ?
- [ ] Y a-t-il des erreurs `UNCAUGHT EXCEPTION` ?
- [ ] Les variables d'environnement sont-elles toutes configurées ?
- [ ] La base de données est-elle accessible ?
- [ ] Les cron jobs s'exécutent-ils correctement ?
- [ ] Y a-t-il des erreurs récurrentes à une heure précise ?

---

## 💡 **Astuces**

- **Surveillez les logs en temps réel** pendant les heures de pointe (9h, 18h)
- **Filtrez par niveau** : Cherchez `[ERROR]` pour voir uniquement les erreurs
- **Notez les timestamps** : Les erreurs peuvent être liées à des événements spécifiques
- **Vérifiez la fréquence** : Si l'app crash toutes les heures, c'est peut-être lié aux cron jobs

---

**Dernière mise à jour** : Après ajout de la gestion globale des erreurs et du logging amélioré


