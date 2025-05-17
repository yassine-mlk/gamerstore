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

-- Fonction pour créer la table depots
CREATE OR REPLACE FUNCTION create_depots_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS depots;
  
  -- Création de la table depots
  CREATE TABLE depots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    adresse TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE depots ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les depots" 
    ON depots FOR SELECT USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent créer des depots" 
    ON depots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les depots" 
    ON depots FOR UPDATE USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des depots" 
    ON depots FOR DELETE USING (auth.role() = 'authenticated');

  -- Créer un déclencheur pour mettre à jour automatiquement le champ updated_at
  CREATE TRIGGER update_depots_modtime
  BEFORE UPDATE ON depots
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer la table categories
CREATE OR REPLACE FUNCTION create_categories_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS categories;
  
  -- Création de la table categories
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les categories" 
    ON categories FOR SELECT USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent créer des categories" 
    ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les categories" 
    ON categories FOR UPDATE USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des categories" 
    ON categories FOR DELETE USING (auth.role() = 'authenticated');

  -- Créer un déclencheur pour mettre à jour automatiquement le champ updated_at
  CREATE TRIGGER update_categories_modtime
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer la table settings
CREATE OR REPLACE FUNCTION create_settings_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS settings;
  
  -- Création de la table settings
  CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    accent_color TEXT DEFAULT 'blue',
    business_name TEXT DEFAULT 'BizzMax',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre aux utilisateurs de gérer leurs propres paramètres
  CREATE POLICY "Utilisateurs peuvent lire leurs propres paramètres" 
    ON settings FOR SELECT USING (auth.uid() = user_id);
    
  CREATE POLICY "Utilisateurs peuvent créer leurs propres paramètres" 
    ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres paramètres" 
    ON settings FOR UPDATE USING (auth.uid() = user_id);
    
  CREATE POLICY "Utilisateurs peuvent supprimer leurs propres paramètres" 
    ON settings FOR DELETE USING (auth.uid() = user_id);

  -- Créer un déclencheur pour mettre à jour automatiquement le champ updated_at
  CREATE TRIGGER update_settings_modtime
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter les fonctions pour créer les tables
SELECT create_depots_table();
SELECT create_categories_table();
SELECT create_settings_table(); 