-- Script pour ajouter la colonne reminder à la table tasks
-- Exécuter ce script dans votre base de données PostgreSQL

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder INTEGER DEFAULT NULL;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN tasks.reminder IS 'Délai de rappel en minutes avant le début de la tâche (0 = au début, NULL = aucun rappel)';

-- Exemples de valeurs :
-- NULL = Aucun rappel
-- 0 = Au début de la tâche
-- 5 = 5 minutes avant
-- 60 = 1 heure avant
-- 1440 = 1 jour avant
