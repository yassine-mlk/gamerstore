-- Table pour les ventes
CREATE TABLE IF NOT EXISTS ventes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_vente VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    date_vente TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    montant_total DECIMAL(10,2) NOT NULL,
    methode_paiement VARCHAR(50) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les détails des ventes
CREATE TABLE IF NOT EXISTS articles_vente (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vente_id UUID REFERENCES ventes(id) ON DELETE CASCADE,
    produit_id UUID REFERENCES produits(id),
    quantite INTEGER NOT NULL,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    prix_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fonction pour générer automatiquement le numéro de vente
CREATE OR REPLACE FUNCTION generate_numero_vente()
RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    sequence_number INTEGER;
BEGIN
    year := to_char(CURRENT_DATE, 'YYYY');
    
    -- Extraire le numéro de séquence en utilisant une expression régulière
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_vente FROM 'VENTE-\d{4}-(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM ventes
    WHERE numero_vente LIKE 'VENTE-' || year || '-%';
    
    NEW.numero_vente := 'VENTE-' || year || '-' || LPAD(sequence_number::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de vente
DROP TRIGGER IF EXISTS set_numero_vente ON ventes;
CREATE TRIGGER set_numero_vente
    BEFORE INSERT ON ventes
    FOR EACH ROW
    EXECUTE FUNCTION generate_numero_vente();

-- Fonction pour mettre à jour le stock lors d'une vente
CREATE OR REPLACE FUNCTION update_stock_on_vente()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si le produit existe et a assez de stock
    IF EXISTS (
        SELECT 1 FROM produits 
        WHERE id = NEW.produit_id 
        AND stock_quantity >= NEW.quantite
    ) THEN
        -- Mettre à jour le stock
        UPDATE produits
        SET stock_quantity = stock_quantity - NEW.quantite
        WHERE id = NEW.produit_id;
        RETURN NEW;
    ELSE
        -- Si pas assez de stock, annuler l'insertion
        RAISE EXCEPTION 'Stock insuffisant pour le produit %', NEW.produit_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le stock lors d'une vente
DROP TRIGGER IF EXISTS update_stock_after_vente ON articles_vente;
CREATE TRIGGER update_stock_after_vente
    BEFORE INSERT ON articles_vente
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_vente();

-- Ajout des politiques de sécurité RLS
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_vente ENABLE ROW LEVEL SECURITY;

-- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Utilisateurs authentifiés peuvent lire les ventes" 
    ON ventes FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent créer des ventes" 
    ON ventes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les ventes" 
    ON ventes FOR UPDATE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des ventes" 
    ON ventes FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour articles_vente
CREATE POLICY "Utilisateurs authentifiés peuvent lire les articles de vente" 
    ON articles_vente FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent créer des articles de vente" 
    ON articles_vente FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les articles de vente" 
    ON articles_vente FOR UPDATE USING (auth.role() = 'authenticated');
    
CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des articles de vente" 
    ON articles_vente FOR DELETE USING (auth.role() = 'authenticated'); 