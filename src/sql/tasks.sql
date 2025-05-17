-- Table pour stocker les tâches
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre TEXT NOT NULL,
  description TEXT,
  statut TEXT NOT NULL DEFAULT 'en attente',
  priorite TEXT NOT NULL DEFAULT 'normale',
  date_echeance TIMESTAMP WITH TIME ZONE,
  assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  assignee_email TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer la sécurité par ligne (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les erreurs de duplication
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire toutes les tâches" ON tasks;
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des tâches" ON tasks;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs tâches" ON tasks;
DROP POLICY IF EXISTS "Les administrateurs peuvent mettre à jour toutes les tâches" ON tasks;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs tâches" ON tasks;
DROP POLICY IF EXISTS "Les administrateurs peuvent supprimer toutes les tâches" ON tasks;

-- Politique pour permettre la lecture par tous les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent lire toutes les tâches"
ON tasks FOR SELECT 
USING (auth.role() = 'authenticated');

-- Politique pour permettre aux utilisateurs authentifiés de créer des tâches
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des tâches"
ON tasks FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres tâches (soit créées par eux, soit assignées à eux)
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs tâches"
ON tasks FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  assignee_email = auth.jwt()->>'email'
);

-- Politique pour permettre aux administrateurs de mettre à jour toutes les tâches
CREATE POLICY "Les administrateurs peuvent mettre à jour toutes les tâches"
ON tasks FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() ->> 'role' = 'super'
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres tâches
CREATE POLICY "Les utilisateurs peuvent supprimer leurs tâches"
ON tasks FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Politique pour permettre aux administrateurs de supprimer toutes les tâches
CREATE POLICY "Les administrateurs peuvent supprimer toutes les tâches"
ON tasks FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() ->> 'role' = 'super'
);

-- Trigger pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_task_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à la table tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE PROCEDURE update_task_updated_at_column(); 