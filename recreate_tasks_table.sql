-- Script pour recréer la table tasks avec toutes les colonnes nécessaires
-- ATTENTION: Cela va supprimer toutes les données existantes !

DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    task_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'En attente',
    date DATE,
    start_time TIME,
    location VARCHAR(255),
    estimated_duration VARCHAR(50),
    priority VARCHAR(50) DEFAULT 'Normale',
    comment TEXT,
    collaborator VARCHAR(255) DEFAULT NULL,
    collaboration VARCHAR(255) DEFAULT NULL,
    reminder INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer quelques données de test
INSERT INTO tasks (employee_name, category, task_name, status, date, start_time, location, estimated_duration, priority, comment, collaborator, collaboration, reminder) VALUES
('Philippe', 'Maintenance', 'Test tâche locale', 'En attente', '2024-01-15', '09:00:00', 'Bureau', '2 heures', 'Haute', 'Test de la base locale', 'Jean', 'Collaboration test', 5);

-- Vérifier la structure
\d tasks;
