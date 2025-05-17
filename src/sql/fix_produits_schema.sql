-- Script pour corriger le problème de colonne dans la table produits
-- Ce script vérifie si la colonne category_id existe et la renomme en categorieId si nécessaire
-- Ou si la colonne categorieId existe mais n'est pas reconnue par le cache de schéma

-- Vérifier si la colonne category_id existe
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Vérifier si la colonne category_id existe
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'category_id'
    ) INTO column_exists;

    -- Si category_id existe, le renommer en categorieId
    IF column_exists THEN
        EXECUTE 'ALTER TABLE produits RENAME COLUMN category_id TO "categorieId"';
        RAISE NOTICE 'La colonne category_id a été renommée en categorieId';
    ELSE
        -- Vérifier si la colonne categorieId existe
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'produits' AND column_name = 'categorieId'
        ) INTO column_exists;
        
        IF column_exists THEN
            -- La colonne existe déjà, essayer de rafraîchir le cache de schéma
            RAISE NOTICE 'La colonne categorieId existe déjà, rafraîchissement du cache de schéma';
        ELSE
            RAISE NOTICE 'Ni category_id ni categorieId n''existent dans la table produits';
        END IF;
    END IF;
END $$;

-- Afficher la structure actuelle de la table produits
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'produits'
ORDER BY ordinal_position; 