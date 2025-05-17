-- Script pour corriger directement la structure de la table produits

-- Vérifier si la colonne categorieId existe
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'categorieId'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- Vérifier si la colonne category_id existe
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'produits' AND column_name = 'category_id'
        ) INTO column_exists;

        IF NOT column_exists THEN
            -- Aucune des deux colonnes n'existe, ajouter categorieId
            EXECUTE 'ALTER TABLE produits ADD COLUMN "categorieId" UUID REFERENCES categories(id)';
            RAISE NOTICE 'Colonne categorieId ajoutée';
        ELSE
            -- Renommer category_id en categorieId
            EXECUTE 'ALTER TABLE produits RENAME COLUMN category_id TO "categorieId"';
            RAISE NOTICE 'Colonne category_id renommée en categorieId';
        END IF;
    ELSE
        RAISE NOTICE 'La colonne categorieId existe déjà';
    END IF;
END $$;

-- Vérifier si la colonne codeBarres existe
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'codeBarres'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- Vérifier si la colonne code_barres existe
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'produits' AND column_name = 'code_barres'
        ) INTO column_exists;

        IF NOT column_exists THEN
            -- Aucune des deux colonnes n'existe, ajouter codeBarres
            EXECUTE 'ALTER TABLE produits ADD COLUMN "codeBarres" TEXT';
            RAISE NOTICE 'Colonne codeBarres ajoutée';
            
            -- Copier les valeurs de reference vers codeBarres
            EXECUTE 'UPDATE produits SET "codeBarres" = reference WHERE "codeBarres" IS NULL';
            RAISE NOTICE 'Valeurs de reference copiées vers codeBarres';
        ELSE
            -- Renommer code_barres en codeBarres
            EXECUTE 'ALTER TABLE produits RENAME COLUMN code_barres TO "codeBarres"';
            RAISE NOTICE 'Colonne code_barres renommée en codeBarres';
        END IF;
    ELSE
        RAISE NOTICE 'La colonne codeBarres existe déjà';
    END IF;
END $$;

-- Faire de même pour depotId
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'depotId'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- Vérifier si la colonne depot_id existe
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'produits' AND column_name = 'depot_id'
        ) INTO column_exists;

        IF NOT column_exists THEN
            -- Aucune des deux colonnes n'existe, ajouter depotId
            EXECUTE 'ALTER TABLE produits ADD COLUMN "depotId" UUID REFERENCES depots(id)';
            RAISE NOTICE 'Colonne depotId ajoutée';
        ELSE
            -- Renommer depot_id en depotId
            EXECUTE 'ALTER TABLE produits RENAME COLUMN depot_id TO "depotId"';
            RAISE NOTICE 'Colonne depot_id renommée en depotId';
        END IF;
    ELSE
        RAISE NOTICE 'La colonne depotId existe déjà';
    END IF;
END $$;

-- Faire de même pour teamMemberId
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produits' AND column_name = 'teamMemberId'
    ) INTO column_exists;

    IF NOT column_exists THEN
        -- Vérifier si la colonne team_member_id existe
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'produits' AND column_name = 'team_member_id'
        ) INTO column_exists;

        IF NOT column_exists THEN
            -- Aucune des deux colonnes n'existe, ajouter teamMemberId
            EXECUTE 'ALTER TABLE produits ADD COLUMN "teamMemberId" UUID REFERENCES team_members(id)';
            RAISE NOTICE 'Colonne teamMemberId ajoutée';
        ELSE
            -- Renommer team_member_id en teamMemberId
            EXECUTE 'ALTER TABLE produits RENAME COLUMN team_member_id TO "teamMemberId"';
            RAISE NOTICE 'Colonne team_member_id renommée en teamMemberId';
        END IF;
    ELSE
        RAISE NOTICE 'La colonne teamMemberId existe déjà';
    END IF;
END $$;

-- Vérifier la structure finale de la table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'produits'
ORDER BY ordinal_position; 