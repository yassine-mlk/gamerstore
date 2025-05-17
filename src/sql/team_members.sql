-- Table pour stocker les membres de l'équipe
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT NOT NULL,
  role TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer la sécurité par ligne (RLS)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les erreurs de duplication
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire tous les membres" ON team_members;
DROP POLICY IF EXISTS "Les admins peuvent créer des membres" ON team_members;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des membres" ON team_members;
DROP POLICY IF EXISTS "Les admins peuvent mettre à jour des membres" ON team_members;
DROP POLICY IF EXISTS "Les admins peuvent supprimer des membres" ON team_members;

-- Politique pour permettre la lecture par tous les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent lire tous les membres" 
ON team_members FOR SELECT 
USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de créer des membres
-- Note: dans une application réelle, il faudrait peut-être restreindre davantage
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des membres" 
ON team_members FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Politique pour permettre aux administrateurs de mettre à jour des membres
CREATE POLICY "Les admins peuvent mettre à jour des membres" 
ON team_members FOR UPDATE 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super');

-- Politique pour permettre aux administrateurs de supprimer des membres
CREATE POLICY "Les admins peuvent supprimer des membres" 
ON team_members FOR DELETE 
TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super');

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à la table team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON team_members
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 