-- Fonction pour insérer un produit en contournant les problèmes de cache de schéma
CREATE OR REPLACE FUNCTION insert_product(product_data JSONB)
RETURNS JSONB AS $$
DECLARE
    new_id UUID;
    result JSONB;
    category_column TEXT;
    depot_column TEXT;
    team_member_column TEXT;
    sql_query TEXT;
    column_names TEXT[];
BEGIN
    -- Générer un nouvel ID si non fourni
    IF product_data->>'id' IS NULL THEN
        new_id := uuid_generate_v4();
    ELSE
        new_id := (product_data->>'id')::UUID;
    END IF;

    -- Déterminer les noms réels des colonnes
    SELECT array_agg(column_name) INTO column_names
    FROM information_schema.columns
    WHERE table_name = 'produits';

    -- Construire la requête dynamiquement
    sql_query := 'INSERT INTO produits (id, nom, description, reference, codeBarres, prixAchat, prixVente, quantite';
    
    -- Vérifier si la colonne categorieId existe
    IF 'categorieId' = ANY(column_names) THEN
        sql_query := sql_query || ', "categorieId"';
        category_column := 'categorieId';
    ELSIF 'category_id' = ANY(column_names) THEN
        sql_query := sql_query || ', category_id';
        category_column := 'category_id';
    END IF;
    
    -- Vérifier si la colonne depotId existe
    IF 'depotId' = ANY(column_names) THEN
        sql_query := sql_query || ', "depotId"';
        depot_column := 'depotId';
    ELSIF 'depot_id' = ANY(column_names) THEN
        sql_query := sql_query || ', depot_id';
        depot_column := 'depot_id';
    END IF;
    
    -- Vérifier si la colonne teamMemberId existe
    IF 'teamMemberId' = ANY(column_names) THEN
        sql_query := sql_query || ', "teamMemberId"';
        team_member_column := 'teamMemberId';
    ELSIF 'team_member_id' = ANY(column_names) THEN
        sql_query := sql_query || ', team_member_id';
        team_member_column := 'team_member_id';
    END IF;
    
    -- Ajouter les colonnes compose et composants si elles existent
    IF 'compose' = ANY(column_names) THEN
        sql_query := sql_query || ', compose';
    END IF;
    
    IF 'composants' = ANY(column_names) THEN
        sql_query := sql_query || ', composants';
    END IF;
    
    -- Compléter la requête avec les valeurs
    sql_query := sql_query || ') VALUES ($1, $2, $3, $4, $5, $6, $7, $8';
    
    -- Ajouter les paramètres pour les colonnes optionnelles
    DECLARE param_index INT := 9;
    BEGIN
        IF category_column IS NOT NULL THEN
            sql_query := sql_query || ', $' || param_index;
            param_index := param_index + 1;
        END IF;
        
        IF depot_column IS NOT NULL THEN
            sql_query := sql_query || ', $' || param_index;
            param_index := param_index + 1;
        END IF;
        
        IF team_member_column IS NOT NULL THEN
            sql_query := sql_query || ', $' || param_index;
            param_index := param_index + 1;
        END IF;
        
        IF 'compose' = ANY(column_names) THEN
            sql_query := sql_query || ', $' || param_index;
            param_index := param_index + 1;
        END IF;
        
        IF 'composants' = ANY(column_names) THEN
            sql_query := sql_query || ', $' || param_index;
            param_index := param_index + 1;
        END IF;
    END;
    
    -- Finaliser la requête
    sql_query := sql_query || ') RETURNING *';
    
    -- Exécuter la requête avec les paramètres appropriés
    EXECUTE sql_query INTO result USING 
        new_id,
        product_data->>'nom',
        product_data->>'description',
        product_data->>'reference',
        product_data->>'codeBarres',
        (product_data->>'prixAchat')::DECIMAL,
        (product_data->>'prixVente')::DECIMAL,
        (product_data->>'quantite')::INTEGER,
        CASE WHEN category_column IS NOT NULL THEN 
            CASE WHEN category_column = 'categorieId' THEN (product_data->>'categorieId')::UUID
                 ELSE (product_data->>'categorieId')::UUID END
        END,
        CASE WHEN depot_column IS NOT NULL THEN 
            CASE WHEN depot_column = 'depotId' THEN (product_data->>'depotId')::UUID
                 ELSE (product_data->>'depotId')::UUID END
        END,
        CASE WHEN team_member_column IS NOT NULL AND product_data->>'teamMemberId' IS NOT NULL THEN 
            (product_data->>'teamMemberId')::UUID
        END,
        CASE WHEN 'compose' = ANY(column_names) AND product_data->>'compose' IS NOT NULL THEN 
            (product_data->>'compose')::BOOLEAN
        END,
        CASE WHEN 'composants' = ANY(column_names) AND product_data->'composants' IS NOT NULL THEN 
            product_data->'composants'
        END;
    
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in insert_product: %', SQLERRM;
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 