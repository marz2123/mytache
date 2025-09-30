-- Script pour corriger la structure de la base de données locale
-- Ajouter les colonnes manquantes à la table tasks

-- Colonnes collaborator et collaboration
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS collaborator VARCHAR(255) DEFAULT NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS collaboration VARCHAR(255) DEFAULT NULL;

-- Colonne reminder (si pas déjà ajoutée)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder INTEGER DEFAULT NULL;

-- Vérifier la structure
\d tasks;
