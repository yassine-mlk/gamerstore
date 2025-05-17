import { supabase } from '@/lib/supabase';

/**
 * Ce script permet de créer les tables nécessaires dans Supabase.
 * Il est destiné à être utilisé en développement uniquement.
 * 
 * ATTENTION: Exécuter ce script supprimera toutes les données existantes dans les tables concernées.
 * 
 * Pour l'utiliser:
 * 1. Assurez-vous d'avoir configuré correctement les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY
 * 2. Importez cette fonction et exécutez-la dans votre application ou dans la console du navigateur
 */
export const setupSupabaseTables = async () => {
  try {
    console.log('Début de la configuration des tables Supabase...');

    // Création de la table clients
    console.log('Création de la table clients...');
    const { error: clientsError } = await supabase.rpc('create_clients_table', {});
    
    if (clientsError) {
      console.error('Erreur lors de la création de la table clients:', clientsError);
      return;
    }
    
    // Création de la table achats
    console.log('Création de la table achats...');
    const { error: achatsError } = await supabase.rpc('create_achats_table', {});
    
    if (achatsError) {
      console.error('Erreur lors de la création de la table achats:', achatsError);
      return;
    }
    
    console.log('Configuration des tables terminée avec succès!');
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la configuration des tables:', error);
    return { success: false, error };
  }
};

/**
 * Pour créer les fonctions RPC nécessaires dans Supabase, exécutez les requêtes SQL suivantes
 * dans l'éditeur SQL de votre projet Supabase:
 * 
 * -- Fonction pour créer la table clients
 * CREATE OR REPLACE FUNCTION create_clients_table()
 * RETURNS void AS $$
 * BEGIN
 *   -- Suppression de la table si elle existe déjà
 *   DROP TABLE IF EXISTS clients;
 *   
 *   -- Création de la table clients
 *   CREATE TABLE clients (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     nom TEXT NOT NULL,
 *     prenom TEXT NOT NULL,
 *     email TEXT,
 *     telephone TEXT,
 *     ville TEXT,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *   );
 *   
 *   -- Ajout des politiques de sécurité RLS
 *   ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
 *   
 *   -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
 *   CREATE POLICY "Utilisateurs authentifiés peuvent lire les clients" 
 *     ON clients FOR SELECT USING (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent créer des clients" 
 *     ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les clients" 
 *     ON clients FOR UPDATE USING (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des clients" 
 *     ON clients FOR DELETE USING (auth.role() = 'authenticated');
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * -- Fonction pour créer la table achats
 * CREATE OR REPLACE FUNCTION create_achats_table()
 * RETURNS void AS $$
 * BEGIN
 *   -- Suppression de la table si elle existe déjà
 *   DROP TABLE IF EXISTS achats;
 *   
 *   -- Création de la table achats
 *   CREATE TABLE achats (
 *     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *     client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
 *     date DATE NOT NULL,
 *     produits JSONB NOT NULL,
 *     total DECIMAL(10, 2) NOT NULL,
 *     statut TEXT NOT NULL,
 *     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 *   );
 *   
 *   -- Ajout des politiques de sécurité RLS
 *   ALTER TABLE achats ENABLE ROW LEVEL SECURITY;
 *   
 *   -- Création des politiques pour permettre toutes les opérations aux utilisateurs authentifiés
 *   CREATE POLICY "Utilisateurs authentifiés peuvent lire les achats" 
 *     ON achats FOR SELECT USING (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent créer des achats" 
 *     ON achats FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent mettre à jour les achats" 
 *     ON achats FOR UPDATE USING (auth.role() = 'authenticated');
 *     
 *   CREATE POLICY "Utilisateurs authentifiés peuvent supprimer des achats" 
 *     ON achats FOR DELETE USING (auth.role() = 'authenticated');
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 */ 