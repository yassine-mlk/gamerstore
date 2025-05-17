import { createCategory, getCategories } from '@/services/supabase/parametres';
import { LAPTOP_CATEGORY_ID, DESKTOP_CATEGORY_ID } from '@/data/computer-specs';

/**
 * Crée les catégories prédéfinies pour les ordinateurs si elles n'existent pas déjà
 */
export const createComputerCategories = async (): Promise<void> => {
  try {
    // Récupérer toutes les catégories existantes
    const categories = await getCategories();
    
    // Vérifier si la catégorie PC Portable existe déjà
    const laptopCategoryExists = categories.some(cat => 
      cat.id === LAPTOP_CATEGORY_ID || cat.nom === 'PC Portable'
    );
    
    // Vérifier si la catégorie PC Bureau existe déjà
    const desktopCategoryExists = categories.some(cat => 
      cat.id === DESKTOP_CATEGORY_ID || cat.nom === 'PC Bureau'
    );
    
    // Créer la catégorie PC Portable si elle n'existe pas
    if (!laptopCategoryExists) {
      await createCategory({
        nom: 'PC Portable'
      });
      console.log('Catégorie PC Portable créée avec succès');
    }
    
    // Créer la catégorie PC Bureau si elle n'existe pas
    if (!desktopCategoryExists) {
      await createCategory({
        nom: 'PC Bureau'
      });
      console.log('Catégorie PC Bureau créée avec succès');
    }
    
    console.log('Vérification des catégories terminée');
  } catch (error) {
    console.error('Erreur lors de la création des catégories:', error);
  }
};

export default createComputerCategories; 