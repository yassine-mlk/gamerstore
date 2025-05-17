import { supabase } from '@/lib/supabase';

export interface Client {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  created_at?: string;
}

export interface Achat {
  id?: string;
  client_id: string;
  date: string;
  produits: {
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
  }[];
  total: number;
  statut: 'payé' | 'en attente' | 'annulé';
  created_at?: string;
}

// Récupérer tous les clients
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }

  return data || [];
};

// Récupérer un client par son ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Erreur lors de la récupération du client ${id}:`, error);
    throw error;
  }

  return data;
};

// Ajouter un nouveau client
export const addClient = async (client: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout du client:', error);
    throw error;
  }

  return data;
};

// Mettre à jour un client
export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
    throw error;
  }

  return data;
};

// Supprimer un client
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Erreur lors de la suppression du client ${id}:`, error);
    throw error;
  }
};

// Récupérer les achats d'un client
export const getClientAchats = async (clientId: string): Promise<Achat[]> => {
  const { data, error } = await supabase
    .from('achats')
    .select('*')
    .eq('client_id', clientId)
    .order('date', { ascending: false });

  if (error) {
    console.error(`Erreur lors de la récupération des achats du client ${clientId}:`, error);
    throw error;
  }

  return data || [];
};

// Ajouter un nouvel achat
export const addAchat = async (achat: Omit<Achat, 'id' | 'created_at'>): Promise<Achat> => {
  const { data, error } = await supabase
    .from('achats')
    .insert([achat])
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout de l\'achat:', error);
    throw error;
  }

  return data;
}; 