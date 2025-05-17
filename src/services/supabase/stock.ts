import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Type pour un produit
export interface Produit {
  id: string;
  nom: string;
  description: string;
  reference: string;
  codeBarres: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  categorieId: string;
  depotId: string;
  teamMemberId?: string;
  image?: string;
  compose?: boolean;
  composants?: {
    produitId: string;
    quantite: number;
  }[];
  created_at?: string;
  updated_at?: string;
}

// Type pour une promotion
export interface Promotion {
  id: string;
  produitId: string;
  type: 'pourcentage' | 'montant' | 'bundle';
  valeur: number;
  dateDebut: string;
  dateFin: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fonction utilitaire pour convertir les noms de colonnes de la base de données 
 * vers les propriétés de notre modèle TypeScript
 */
function mapDatabaseToModel(dbProduct: any): Produit {
  // Vérifier si dbProduct est null ou undefined avant d'utiliser Object.keys
  if (!dbProduct) {
    console.error("Erreur: Objet produit NULL ou undefined reçu dans mapDatabaseToModel");
    // Retourner un objet vide mais conforme au type Produit
    return {
      id: '',
      nom: '',
      description: '',
      reference: '',
      codeBarres: '',
      prixAchat: 0,
      prixVente: 0,
      quantite: 0,
      categorieId: '',
      depotId: ''
    };
  }
  
  // Afficher toutes les clés disponibles pour le débogage
  console.log("Clés disponibles dans le produit de la BDD:", Object.keys(dbProduct));
  
  return {
    id: dbProduct.id,
    nom: dbProduct.nom,
    description: dbProduct.description || '',
    reference: dbProduct.reference,
    codeBarres: dbProduct.codebarres || dbProduct.reference,
    prixAchat: dbProduct.prixachat || 0,
    prixVente: dbProduct.prixvente || 0,
    quantite: dbProduct.quantite || 0,
    categorieId: dbProduct.categorieid || '',
    depotId: dbProduct.depotid || '',
    teamMemberId: dbProduct.teammemberid,
    image: dbProduct.image,
    compose: dbProduct.compose,
    composants: dbProduct.composants,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at
  };
}

/**
 * Récupère tous les produits
 */
export const getProduits = async (): Promise<Produit[]> => {
  try {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .order('nom');

    if (error) throw error;
    // Transformer les données avant de les renvoyer
    return (data || []).map(mapDatabaseToModel);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return [];
  }
};

/**
 * Récupère un produit par son ID
 */
export const getProduitById = async (id: string): Promise<Produit | null> => {
  try {
    const { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    // Transformer les données avant de les renvoyer
    return data ? mapDatabaseToModel(data) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    return null;
  }
};

/**
 * Crée un nouveau produit
 */
export const createProduit = async (produit: Omit<Produit, 'id' | 'created_at' | 'updated_at'>): Promise<Produit | null> => {
  try {
    // Afficher l'objet produit complet pour débogage
    console.log("Données du produit à créer:", produit);
    
    // Vérifier que la référence est bien définie
    if (!produit.reference) {
      console.error("Erreur: La référence du produit est manquante");
      // Générer une référence par défaut si elle est manquante
      produit.reference = `REF-${new Date().getTime()}`;
    }
    
    // Générer un ID unique
    const id = uuidv4();
    
    // Créer un objet avec les noms de champs adaptés à la base de données
    const productToInsert = {
      id,
      nom: produit.nom,
      reference: produit.reference, 
      prixachat: produit.prixAchat,
      prixvente: produit.prixVente,
      quantite: produit.quantite,
      description: produit.description || '',
      codebarres: produit.codeBarres || produit.reference,
      categorieid: produit.categorieId || '',
      depotid: produit.depotId || '',
      teammemberid: produit.teamMemberId || null,
      image: produit.image || null,
      compose: produit.compose || false
    };
    
    console.log("Tentative d'insertion avec données préparées:", productToInsert);
    
    // Effectuer l'insertion avec la structure correcte
    const { data, error } = await supabase
      .from('produits')
      .insert([productToInsert])
      .select('*')
      .single();
    
    if (error) {
      console.error("Erreur lors de l'insertion:", error);
      
      // Si l'insertion échoue, essayer avec une insertion SQL plus directe
      try {
        console.log("Tentative SQL alternative...");
        
        const { data: rawData, error: rawError } = await supabase.rpc('execute_sql', {
          sql_query: `
            INSERT INTO produits (
              id, 
              nom, 
              reference,
              codebarres,
              description,
              prixachat, 
              prixvente, 
              quantite,
              categorieid, 
              depotid
            ) VALUES (
              '${id}', 
              '${produit.nom.replace(/'/g, "''")}',
              '${produit.reference.replace(/'/g, "''")}',
              '${(produit.codeBarres || produit.reference).replace(/'/g, "''")}',
              '${(produit.description || '').replace(/'/g, "''")}',
              ${produit.prixAchat || 0}, 
              ${produit.prixVente || 0},
              ${produit.quantite || 0},
              '${(produit.categorieId || '').replace(/'/g, "''")}',
              '${(produit.depotId || '').replace(/'/g, "''")}'
            )
            RETURNING *
          `
        });
        
        if (rawError) {
          console.error("Échec de l'insertion SQL alternative:", rawError);
          return null;
        }
        
        console.log("Insertion SQL alternative réussie:", rawData);
        return mapDatabaseToModel(rawData[0]);
      } catch (sqlError) {
        console.error("Erreur lors de l'exécution SQL alternative:", sqlError);
        return null;
      }
    }
    
    console.log("Insertion réussie, données retournées:", data);
    return mapDatabaseToModel(data);
    
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return null;
  }
};

/**
 * Fonction auxiliaire pour mettre à jour les champs d'un produit
 * en essayant différentes conventions de nommage
 */
async function updateProductFields(id: string, produit: Omit<Produit, 'id' | 'created_at' | 'updated_at'>): Promise<Produit | null> {
  // Créer un objet avec les paires clé-valeur transformées
  const fieldsToUpdate: Record<string, any> = {
    nom: produit.nom,
    description: produit.description || '',
    reference: produit.reference,
    codebarres: produit.codeBarres || produit.reference,
    prixachat: produit.prixAchat,
    prixvente: produit.prixVente,
    quantite: produit.quantite,
    categorieid: produit.categorieId || '',
    depotid: produit.depotId || '',
    teammemberid: produit.teamMemberId || null,
    image: produit.image || null,
    updated_at: new Date().toISOString()
  };
  
  // Essayer de mettre à jour le produit avec les champs modifiés
  const { data, error } = await supabase
    .from('produits')
    .update(fieldsToUpdate)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return null;
  }
  
  return data ? mapDatabaseToModel(data) : null;
}

/**
 * Met à jour un produit existant
 */
export const updateProduit = async (id: string, updates: Partial<Omit<Produit, 'id' | 'created_at' | 'updated_at'>>): Promise<Produit | null> => {
  try {
    // Convertir les noms de champs camelCase en snake_case
    const snakeCaseUpdates: Record<string, any> = {};
    
    // Mappage des champs camelCase vers snake_case
    const fieldMappings: Record<string, string> = {
      'prixAchat': 'prixachat',
      'prixVente': 'prixvente',
      'codeBarres': 'codebarres',
      'categorieId': 'categorieid',
      'depotId': 'depotid',
      'teamMemberId': 'teammemberid'
    };
    
    // Convertir les noms de champs
    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = fieldMappings[key] || key.toLowerCase();
      snakeCaseUpdates[snakeKey] = value;
    });
    
    console.log("Mise à jour avec les champs convertis:", snakeCaseUpdates);
    
    // Essayer de mettre à jour le produit avec les noms de champs convertis
    const { data, error } = await supabase
      .from('produits')
      .update(snakeCaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de la mise à jour avec champs convertis:", error);
      throw error;
    }
    
    // Transformer les données avant de les renvoyer
    return data ? mapDatabaseToModel(data) : null;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    return null;
  }
};

/**
 * Supprime un produit
 */
export const deleteProduit = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Vérifier d'abord si le produit est référencé dans des ventes
    const { data: articles, error: checkError } = await supabase
      .from('articles_vente')
      .select('id')
      .eq('produit_id', id)
      .limit(1);

    if (checkError) {
      console.error('Erreur lors de la vérification des références:', checkError);
      throw checkError;
    }

    // Si le produit est utilisé dans des ventes, renvoyer un message d'erreur
    if (articles && articles.length > 0) {
      return { 
        success: false, 
        message: "Ce produit ne peut pas être supprimé car il est utilisé dans une ou plusieurs ventes. Vous pouvez mettre sa quantité à zéro pour le rendre indisponible." 
      };
    }

    // Si le produit n'est pas référencé, procéder à la suppression
    const { error } = await supabase
      .from('produits')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    return { 
      success: false, 
      message: "Une erreur s'est produite lors de la suppression du produit." 
    };
  }
};

/**
 * Récupère toutes les promotions
 */
export const getPromotions = async (): Promise<Promotion[]> => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des promotions:', error);
    return [];
  }
};

/**
 * Crée une nouvelle promotion
 */
export const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<Promotion | null> => {
  try {
    const newPromotion = {
      id: uuidv4(),
      ...promotion
    };

    const { data, error } = await supabase
      .from('promotions')
      .insert([newPromotion])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la promotion:', error);
    return null;
  }
};

/**
 * Supprime une promotion
 */
export const deletePromotion = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la promotion:', error);
    return false;
  }
};

/**
 * Récupère les produits avec leurs promotions actives
 */
export const getProduitsWithPromotions = async (): Promise<(Produit & { promotion?: Promotion })[]> => {
  try {
    // Récupérer tous les produits
    const produits = await getProduits();
    
    // Récupérer toutes les promotions
    const promotions = await getPromotions();
    
    // Associer les promotions aux produits
    const produitsWithPromotions = produits.map(produit => {
      const promotion = promotions.find(p => p.produitId === produit.id);
      return {
        ...produit,
        promotion
      };
    });
    
    return produitsWithPromotions;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits avec promotions:', error);
    return [];
  }
}; 