import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Type définition pour les tâches
export interface Task {
  id: string;
  titre: string;
  description: string | null;
  statut: 'en attente' | 'en cours' | 'terminée' | 'annulée';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  date_echeance: string | null;
  assignee_id: string | null;
  assignee_email: string | null;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
  
  // Propriétés ajoutées côté client pour l'affichage
  assignee_nom?: string;
  assignee_prenom?: string;
  creator_nom?: string;
  creator_prenom?: string;
}

/**
 * Récupère toutes les tâches
 */
export const getTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('date_echeance', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return [];
  }
};

/**
 * Récupère une tâche par son ID
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    return null;
  }
};

/**
 * Récupère les tâches assignées à un membre spécifique
 */
export const getTasksByAssignee = async (assigneeId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assignee_id', assigneeId)
      .order('date_echeance', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches de l\'utilisateur:', error);
    return [];
  }
};

/**
 * Récupère les tâches créées par un utilisateur spécifique
 */
export const getTasksByCreator = async (creatorId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('created_by', creatorId)
      .order('date_echeance', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches créées:', error);
    return [];
  }
};

/**
 * Crée une nouvelle tâche
 */
export const createTask = async (
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; task?: Task; error?: string }> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const newTask = {
      id: uuidv4(),
      ...task,
      created_by: user.id
    };
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();
      
    if (error) throw error;
    
    return { success: true, task: data };
  } catch (error: any) {
    console.error('Erreur lors de la création de la tâche:', error);
    return { 
      success: false, 
      error: typeof error === 'object' && error !== null 
        ? (error.message || error.toString()) 
        : String(error) 
    };
  }
};

/**
 * Met à jour une tâche existante
 */
export const updateTask = async (
  id: string,
  updates: Partial<Omit<Task, 'id' | 'created_by' | 'created_at' | 'updated_at'>>
): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    return null;
  }
};

/**
 * Supprime une tâche
 */
export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    return false;
  }
};

/**
 * Récupère des tâches avec des informations supplémentaires sur les assignées et créateurs
 */
export const getTasksWithUserInfo = async (): Promise<Task[]> => {
  try {
    // D'abord, récupérer toutes les tâches
    const tasks = await getTasks();
    
    // Ensuite, récupérer tous les membres de l'équipe pour enrichir les données
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*');
      
    if (teamError) throw teamError;
    
    // Enrichir les tâches avec les informations des membres
    return tasks.map(task => {
      const assignee = teamMembers.find(member => member.id === task.assignee_id);
      
      return {
        ...task,
        assignee_nom: assignee?.nom || null,
        assignee_prenom: assignee?.prenom || null,
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches avec infos utilisateurs:', error);
    return [];
  }
}; 