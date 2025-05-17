-- Script pour vérifier les colonnes actuelles de la table produits

-- Afficher toutes les colonnes de la table produits
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'produits'
ORDER BY ordinal_position;

-- Vérifier si la table existe
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'produits'
) AS table_exists;

-- Vérifier si la table est vide
SELECT COUNT(*) AS row_count FROM produits;

-- Afficher les premières lignes pour comprendre la structure des données
SELECT * FROM produits LIMIT 3; 