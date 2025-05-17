import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import ClientDetailsModal from '@/components/clients/ClientDetailsModal';
import ClientForm, { ClientFormValues } from '@/components/clients/ClientForm';
import { Client, getClients, addClient, updateClient, deleteClient } from '@/services/supabase/clients';
import { useAuth } from '@/contexts/AuthContext';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Chargement des clients depuis Supabase
  const loadClients = async () => {
    setIsLoading(true);
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Filtrage des clients en fonction de la recherche
  const filteredClients = clients.filter(client => 
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.telephone && client.telephone.includes(searchTerm)) ||
    (client.ville && client.ville.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Ajout d'un nouveau client
  const handleAddClient = async (formData: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      const newClient = await addClient(formData);
      setClients(prev => [newClient, ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: "Succès",
        description: "Client ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour d'un client
  const handleUpdateClient = async (formData: ClientFormValues) => {
    if (!selectedClient?.id) return;
    
    setIsSubmitting(true);
    try {
      const updatedClient = await updateClient(selectedClient.id, formData);
      setClients(prev => prev.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      ));
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'un client
  const handleDeleteClient = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteClient(id);
      setClients(prev => prev.filter(client => client.id !== id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le client",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setClientToDelete(null);
    }
  };

  // Ouverture des modales
  const openDeleteDialog = (id: string) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsModal = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Clients</h1>
        <p className="text-muted-foreground">Gérez votre base de clients et consultez leurs historiques d'achats</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un client..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Ajouter un client</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <ClientForm 
              onSubmit={handleAddClient} 
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                  <TableHead className="hidden lg:table-cell">Ville</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{`${client.prenom} ${client.nom}`}</TableCell>
                      <TableCell className="hidden md:table-cell">{client.email || '-'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{client.telephone || '-'}</TableCell>
                      <TableCell className="hidden lg:table-cell">{client.ville || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDetailsModal(client)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(client)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => client.id && openDeleteDialog(client.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm ? 'Aucun client trouvé' : 'Aucun client dans la base de données'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails du client */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {/* Dialog de modification du client */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm 
              onSubmit={handleUpdateClient}
              initialValues={selectedClient}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
