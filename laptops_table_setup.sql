-- Activer l'extension uuid-ossp si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Créer la fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la table laptops
CREATE OR REPLACE FUNCTION create_laptops_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS laptops;
  
  -- Création de la table laptops
  CREATE TABLE laptops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL,
    nom TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    processor TEXT NOT NULL,
    graphics TEXT NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    display TEXT NOT NULL,
    condition TEXT NOT NULL,
    description TEXT,
    prix_achat DECIMAL(12, 2) NOT NULL,
    prix_vente DECIMAL(12, 2) NOT NULL,
    quantite INTEGER NOT NULL DEFAULT 0,
    depot_id UUID REFERENCES depots(id),
    team_member_id UUID REFERENCES team_members(id),
    code_barres TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les laptops" 
    ON laptops FOR SELECT USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent créer des laptops" 
    ON laptops FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les laptops" 
    ON laptops FOR UPDATE USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des laptops" 
    ON laptops FOR DELETE USING (auth.role() = 'authenticated');

  -- Créer un déclencheur pour mettre à jour automatiquement le champ updated_at
  CREATE TRIGGER update_laptops_modtime
  BEFORE UPDATE ON laptops
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter la fonction pour créer la table
SELECT create_laptops_table();

-- Insertion de données d'exemple
INSERT INTO laptops (
  id, reference, nom, brand, model, processor, graphics, ram, storage, display, condition, 
  description, prix_achat, prix_vente, quantite, depot_id
)
VALUES 
(
  uuid_generate_v4(), 
  'LAP-2023-001', 
  'Laptop Pro X1', 
  'Lenovo', 
  'ThinkPad X1 Carbon', 
  'Intel Core i7-1165G7', 
  'Intel Iris Xe Graphics', 
  '16 Go', 
  '512 Go SSD', 
  '14 pouces FHD IPS', 
  'Neuf', 
  'Laptop professionnel ultra-léger avec excellente autonomie', 
  900, 1499, 5, 
  (SELECT id FROM depots LIMIT 1)
),
(
  uuid_generate_v4(), 
  'LAP-2023-002', 
  'Gaming Beast X15', 
  'ASUS', 
  'ROG Strix', 
  'AMD Ryzen 9 5900HX', 
  'NVIDIA GeForce RTX 3080', 
  '32 Go', 
  '1 To SSD', 
  '15.6 pouces 165Hz QHD', 
  'Neuf', 
  'Laptop gaming haute performance pour les jeux les plus exigeants', 
  1500, 2499, 3, 
  (SELECT id FROM depots LIMIT 1)
); 