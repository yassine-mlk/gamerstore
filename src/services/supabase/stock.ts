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
    
    // Générer un ID unique
    const id = uuidv4();
    
    // Essayer une approche directe avec colonnes spécifiées dans la requête SQL
    try {
      console.log("Tentative d'insertion SQL directe avec toutes les colonnes...");
      
      // Construire la requête SQL avec les noms exacts des colonnes
      const { data: sqlData, error: sqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          INSERT INTO produits (
            id, 
            nom, 
            reference, 
            prixachat, 
            prixvente, 
            quantite,
            description,
            codebarres,
            categorieid, 
            depotid, 
            teammemberid,
            image
          ) VALUES (
            '${id}', 
            '${produit.nom.replace(/'/g, "''")}', 
            '${produit.reference.replace(/'/g, "''")}', 
            ${produit.prixAchat || 0}, 
            ${produit.prixVente || 0},
            ${produit.quantite || 0},
            '${(produit.description || '').replace(/'/g, "''")}',
            '${(produit.codeBarres || produit.reference).replace(/'/g, "''")}',
            '${(produit.categorieId || '').replace(/'/g, "''")}',
            '${(produit.depotId || '').replace(/'/g, "''")}',
            ${produit.teamMemberId ? `'${produit.teamMemberId.replace(/'/g, "''")}'` : 'NULL'},
            ${produit.image ? `'${produit.image.replace(/'/g, "''")}'` : 'NULL'}
          )
          RETURNING *
        `
      });
      
      if (sqlError) {
        console.error("Erreur lors de l'insertion SQL directe:", sqlError);
      } else {
        console.log("Succès de l'insertion SQL directe:", sqlData);
        return mapDatabaseToModel(sqlData[0]);
      }
    } catch (directSqlError) {
      console.error("Exception lors de l'insertion SQL directe:", directSqlError);
    }
    
    // Fallback au code existant si l'insertion directe échoue
    
    // Créer un objet avec les propriétés absolument minimales
    // En utilisant uniquement les champs qui sont presque certainement dans la base de données
    const baseProduct = {
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
      image: produit.image || null
    };

    console.log("Tentative d'insertion avec tous les champs:", baseProduct);

    // Essayer d'insérer le produit avec tous les champs
    const { data, error } = await supabase
      .from('produits')
      .insert([baseProduct])
      .select()
      .single();

    if (error) {
      console.error("Erreur lors de l'insertion complète:", error);
      
      // Si même l'insertion complète échoue, essayer avec une approche plus basique
      // mais conserver les IDs des relations
      const minimalProduct = {
        id,
        nom: produit.nom,
        reference: produit.reference,
        prixachat: produit.prixAchat,
        prixvente: produit.prixVente,
        // Inclure spécifiquement les IDs des relations
        categorieid: produit.categorieId,
        depotid: produit.depotId,
        teammemberid: produit.teamMemberId
      };
      
      console.log("Tentative d'insertion avec champs minimaux + relations:", minimalProduct);
      
      const { data: minData, error: minError } = await supabase
        .from('produits')
        .insert([minimalProduct])
        .select()
        .single();
        
      if (minError) {
        console.error("Échec de l'insertion minimale avec relations:", minError);
        
        // Dernière tentative: essayer d'utiliser une requête SQL brute simplifiée
        try {
          console.log("Tentative SQL minimale avec ID relations...");
          
          // Construire une requête SQL plus basique mais avec les ID des relations
          const { data: minSqlData, error: minSqlError } = await supabase.rpc('execute_sql', {
            sql_query: `
              SELECT 
                column_name, 
                data_type 
              FROM 
                information_schema.columns 
              WHERE 
                table_name = 'produits'
            `
          });
          
          if (minSqlError) {
            console.error("Erreur lors de la requête information_schema:", minSqlError);
          } else {
            console.log("Colonnes de la table produits:", minSqlData);
          }
          
          // Maintenant essayer l'insertion SQL brute
          const { data: rawData, error: rawError } = await supabase.rpc('execute_sql', {
            sql_query: `
              INSERT INTO produits (id, nom, reference, prixachat, prixvente, categorieid, depotid, teammemberid) 
              VALUES (
                '${id}', 
                '${produit.nom.replace(/'/g, "''")}', 
                '${produit.reference.replace(/'/g, "''")}', 
                ${produit.prixAchat || 0}, 
                ${produit.prixVente || 0},
                ${produit.categorieId ? `'${produit.categorieId.replace(/'/g, "''")}'` : 'NULL'},
                ${produit.depotId ? `'${produit.depotId.replace(/'/g, "''")}'` : 'NULL'},
                ${produit.teamMemberId ? `'${produit.teamMemberId.replace(/'/g, "''")}'` : 'NULL'}
              )
              RETURNING *
            `
          });
          
          if (rawError) {
            console.error("Échec de l'insertion SQL brute minimale:", rawError);
            return null;
          }
          
          console.log("Insertion SQL brute minimale réussie:", rawData);
          return mapDatabaseToModel(rawData[0]);
        } catch (sqlError) {
          console.error("Erreur lors de l'exécution SQL brute minimale:", sqlError);
          return null;
        }
      }
      
      console.log("Insertion minimale avec relations réussie:", minData);
      return mapDatabaseToModel(minData);
    }
    
    console.log("Insertion complète réussie, données retournées:", data);
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