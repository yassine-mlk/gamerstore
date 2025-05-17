-- Activer l'extension uuid-ossp si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonction pour créer la table fournisseurs
CREATE OR REPLACE FUNCTION create_fournisseurs_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS fournisseurs;
  
  -- Création de la table fournisseurs
  CREATE TABLE fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    societe TEXT NOT NULL,
    telephone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les fournisseurs" 
    ON fournisseurs FOR SELECT USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent créer des fournisseurs" 
    ON fournisseurs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les fournisseurs" 
    ON fournisseurs FOR UPDATE USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des fournisseurs" 
    ON fournisseurs FOR DELETE USING (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer la table produits_achetes
CREATE OR REPLACE FUNCTION create_produits_achetes_table()
RETURNS void AS $$
BEGIN
  -- Suppression de la table si elle existe déjà
  DROP TABLE IF EXISTS produits_achetes;
  
  -- Création de la table produits_achetes
  CREATE TABLE produits_achetes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    produits JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    statut TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Ajout des politiques de sécurité RLS
  ALTER TABLE produits_achetes ENABLE ROW LEVEL SECURITY;
  
  -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
  CREATE POLICY "Utilisateurs authentifiés peuvent lire les produits achetés" 
    ON produits_achetes FOR SELECT USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent créer des produits achetés" 
    ON produits_achetes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les produits achetés" 
    ON produits_achetes FOR UPDATE USING (auth.role() = 'authenticated');
    
  CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des produits achetés" 
    ON produits_achetes FOR DELETE USING (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Exécuter les fonctions pour créer les tables
SELECT create_fournisseurs_table();
SELECT create_produits_achetes_table();

-- Créer des déclencheurs pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fournisseurs_modtime
BEFORE UPDATE ON fournisseurs
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_produits_achetes_modtime
BEFORE UPDATE ON produits_achetes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 