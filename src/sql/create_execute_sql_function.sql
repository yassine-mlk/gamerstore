-- Fonction pour exécuter des requêtes SQL arbitraires
-- ATTENTION: Cette fonction est potentiellement dangereuse et ne devrait être utilisée
-- que temporairement pour résoudre des problèmes de cache de schéma.
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Exécuter la requête SQL et capturer le résultat au format JSON
    EXECUTE 'WITH result AS (' || sql_query || ') SELECT json_agg(result) FROM result' INTO result;
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exemple d'utilisation:
-- SELECT execute_sql('INSERT INTO produits (id, nom, reference) VALUES (''123'', ''Test'', ''REF-123'') RETURNING *');
-- SELECT execute_sql('SELECT * FROM produits LIMIT 5');

-- IMPORTANT: N'oubliez pas de supprimer cette fonction après avoir résolu le problème
-- DROP FUNCTION execute_sql(TEXT); 