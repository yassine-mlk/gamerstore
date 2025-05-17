import { supabase } from '@/lib/supabase';

export interface Fournisseur {
  id?: string;
  nom: string;
  prenom: string;
  societe: string;
  telephone: string;
  created_at?: string;
}

export interface ProduitAchete {
  id?: string;
  fournisseur_id: string;
  date: string;
  produits: {
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
  }[];
  total: number;
  statut: 'reçu' | 'en cours' | 'annulé';
  created_at?: string;
}

// Récupérer tous les fournisseurs
export const getFournisseurs = async (): Promise<Fournisseur[]> => {
  const { data, error } = await supabase
    .from('fournisseurs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    throw error;
  }

  return data || [];
};

// Récupérer un fournisseur par son ID
export const getFournisseurById = async (id: string): Promise<Fournisseur | null> => {
  const { data, error } = await supabase
    .from('fournisseurs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du fournisseur ${id}:`, error);
    throw error;
  }

  return data;
};

// Ajouter un nouveau fournisseur
export const addFournisseur = async (fournisseur: Omit<Fournisseur, 'id' | 'created_at'>): Promise<Fournisseur> => {
  const { data, error } = await supabase
    .from('fournisseurs')
    .insert([fournisseur])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout du fournisseur:', error);
    throw error;
  }

  return data;
};

// Mettre à jour un fournisseur
export const updateFournisseur = async (id: string, fournisseur: Partial<Fournisseur>): Promise<Fournisseur> => {
  const { data, error } = await supabase
    .from('fournisseurs')
    .update(fournisseur)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour du fournisseur ${id}:`, error);
    throw error;
  }

  return data;
};

// Supprimer un fournisseur
export const deleteFournisseur = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('fournisseurs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erreur lors de la suppression du fournisseur ${id}:`, error);
    throw error;
  }
};

// Récupérer les produits achetés d'un fournisseur
export const getFournisseurProduits = async (fournisseurId: string): Promise<ProduitAchete[]> => {
  const { data, error } = await supabase
    .from('produits_achetes')
    .select('*')
    .eq('fournisseur_id', fournisseurId)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Erreur lors de la récupération des produits du fournisseur ${fournisseurId}:`, error);
    throw error;
  }

  return data || [];
};

// Ajouter un nouvel achat de produit
export const addProduitAchete = async (produit: Omit<ProduitAchete, 'id' | 'created_at'>): Promise<ProduitAchete> => {
  const { data, error } = await supabase
    .from('produits_achetes')
    .insert([produit])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout du produit acheté:', error);
    throw error;
  }

  return data;
}; 