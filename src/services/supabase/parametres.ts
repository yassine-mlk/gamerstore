import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Types pour les entités
export interface Depot {
  id: string;
  nom: string;
  adresse: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  nom: string;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  accent_color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  business_name: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// ------- DÉPÔTS -------

/**
 * Récupère tous les dépôts
 */
export const getDepots = async (): Promise<Depot[]> => {
  try {
    const { data, error } = await supabase
      .from('depots')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des dépôts:', error);
    return [];
  }
};

/**
 * Crée un nouveau dépôt
 */
export const createDepot = async (depot: Omit<Depot, 'id' | 'created_at' | 'updated_at'>): Promise<Depot | null> => {
  try {
    const newDepot = {
      id: uuidv4(),
      ...depot
    };

    const { data, error } = await supabase
      .from('depots')
      .insert([newDepot])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création du dépôt:', error);
    return null;
  }
};

/**
 * Met à jour un dépôt existant
 */
export const updateDepot = async (id: string, updates: Partial<Omit<Depot, 'id' | 'created_at' | 'updated_at'>>): Promise<Depot | null> => {
  try {
    const { data, error } = await supabase
      .from('depots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dépôt:', error);
    return null;
  }
};

/**
 * Supprime un dépôt
 */
export const deleteDepot = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('depots')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression du dépôt:', error);
    return false;
  }
};

// ------- CATÉGORIES -------

/**
 * Récupère toutes les catégories
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
};

/**
 * Crée une nouvelle catégorie
 */
export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
  try {
    const newCategory = {
      id: uuidv4(),
      ...category
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return null;
  }
};

/**
 * Met à jour une catégorie existante
 */
export const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return null;
  }
};

/**
 * Supprime une catégorie
 */
export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return false;
  }
};

// ------- PARAMÈTRES -------

/**
 * Récupère les paramètres de l'utilisateur
 */
export const getSettings = async (userId: string): Promise<Settings | null> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun enregistrement trouvé, créer des paramètres par défaut
        return createSettings({
          user_id: userId,
          theme: 'light',
          accent_color: 'blue',
          business_name: 'BizzMax'
        });
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return null;
  }
};

/**
 * Crée de nouveaux paramètres pour l'utilisateur
 */
export const createSettings = async (settings: Omit<Settings, 'id' | 'created_at' | 'updated_at'>): Promise<Settings | null> => {
  try {
    const newSettings = {
      id: uuidv4(),
      ...settings
    };

    const { data, error } = await supabase
      .from('settings')
      .insert([newSettings])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création des paramètres:', error);
    return null;
  }
};

/**
 * Met à jour les paramètres de l'utilisateur
 */
export const updateSettings = async (userId: string, updates: Partial<Omit<Settings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Settings | null> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return null;
  }
};

/**
 * Télécharge un logo dans le stockage Supabase
 */
export const uploadLogo = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // Mettre à jour les paramètres avec l'URL du logo
    await updateSettings(userId, { logo_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Erreur lors du téléchargement du logo:', error);
    return null;
  }
}; 