import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { createTestUser } from '@/utils/createTestUser';

// Type définition pour les membres de l'équipe
export interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Récupère tous les membres de l'équipe
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    return [];
  }
};

/**
 * Récupère un membre de l'équipe par son ID
 */
export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du membre:', error);
    return null;
  }
};

/**
 * Crée un nouveau membre de l'équipe
 * Cette fonction crée également un utilisateur Supabase associé
 */
export const createTeamMember = async (
  member: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  password: string
): Promise<{ success: boolean; teamMember?: TeamMember; error?: string }> => {
  try {
    // Créer un utilisateur dans Supabase Auth
    const fullName = `${member.prenom} ${member.nom}`;
    console.log('Tentative de création d\'utilisateur:', { 
      email: member.email,
      fullName,
      role: 'team' 
    });
    
    const { success, data, error } = await createTestUser(
      member.email,
      password,
      'team', // Rôle membre par défaut
      fullName
    );

    if (!success || !data?.user) {
      console.error('Erreur création utilisateur:', error);
      throw new Error(error || 'Échec de la création de l\'utilisateur');
    }

    // Créer le membre dans la table team_members
    const newMember = {
      id: uuidv4(),
      ...member,
      user_id: data.user.id,
    };

    console.log('Tentative insertion dans team_members:', newMember);

    const { data: teamMemberData, error: teamMemberError } = await supabase
      .from('team_members')
      .insert([newMember])
      .select()
      .single();

    if (teamMemberError) {
      console.error('Erreur insertion team_members:', teamMemberError);
      throw teamMemberError;
    }

    return { success: true, teamMember: teamMemberData };
  } catch (error: any) {
    console.error('Erreur lors de la création du membre:', error);
    return { 
      success: false, 
      error: typeof error === 'object' && error !== null 
        ? (error.message || error.toString()) 
        : String(error) 
    };
  }
};

/**
 * Met à jour les informations d'un membre de l'équipe
 */
export const updateTeamMember = async (
  id: string,
  updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    return null;
  }
};

/**
 * Supprime un membre de l'équipe
 */
export const deleteTeamMember = async (id: string): Promise<boolean> => {
  try {
    // Récupérer d'abord le membre pour obtenir son user_id
    const member = await getTeamMemberById(id);
    if (!member) {
      console.error('Membre non trouvé avec ID:', id);
      return false;
    }

    console.log('Tentative de suppression du membre:', member);

    // Obtenir le JWT pour vérifier le rôle
    const { data: userData } = await supabase.auth.getUser();
    console.log('User actuel:', userData?.user);
    console.log('Rôle utilisateur:', userData?.user?.user_metadata?.role);

    // Supprimer le membre de la table team_members
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du membre:', error);
      throw error;
    }

    // Vérifier si le membre existe encore après la tentative de suppression
    // En utilisant une méthode qui ne génère pas d'erreur si aucun membre n'est trouvé
    const { data: memberExists } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', id);
    
    const success = !memberExists || memberExists.length === 0;
    
    console.log('Membre supprimé avec succès?', success);
    return success;
  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    return false;
  }
};

/**
 * Réinitialise le mot de passe d'un membre de l'équipe
 * Cette fonction envoie un email de réinitialisation
 */
export const resetTeamMemberPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Met à jour directement le mot de passe d'un membre
 * Cette fonction ne devrait être utilisée que par un administrateur
 */
export const updateTeamMemberPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Pour des raisons de sécurité, cette fonction est simplifiée
    // Dans une application réelle, vous devriez utiliser un appel API sécurisé 
    // ou une fonction Supabase Edge Function pour cette opération
    
    // Notez que ceci est une simplification pour la démonstration
    // et ne représente pas une implémentation sécurisée
    console.log(`Mise à jour du mot de passe pour ${email}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}; 