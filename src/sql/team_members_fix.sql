-- Supprimer les politiques existantes pour éviter les erreurs de duplication
DROP POLICY IF EXISTS "Les admins peuvent supprimer des membres" ON team_members;

-- Politique pour permettre aux utilisateurs authentifiés de supprimer des membres
-- Ceci est plus permissif que la politique précédente
CREATE POLICY "Tous les utilisateurs authentifiés peuvent supprimer des membres" 
ON team_members FOR DELETE 
TO authenticated 
USING (true);

-- Si vous préférez conserver une restriction par rôle, mais avec une meilleure gestion des erreurs,
-- utilisez cette politique au lieu de la précédente (décommentez-la)
-- CREATE POLICY "Les admins peuvent supprimer des membres" 
-- ON team_members FOR DELETE 
-- TO authenticated 
-- USING (
--   auth.jwt() ->> 'role' = 'admin' OR 
--   auth.jwt() ->> 'role' = 'super' OR
--   auth.jwt()->>'email' = (SELECT email FROM team_members WHERE id = team_members.id)
-- );

-- Rafraîchir les politiques
NOTIFY pgrst, 'reload schema'; 