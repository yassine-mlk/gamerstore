import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import FournisseurForm, { FournisseurFormValues } from '@/components/fournisseurs/FournisseurForm';
import FournisseurDetailsModal from '@/components/fournisseurs/FournisseurDetailsModal';
import { Fournisseur, getFournisseurs, addFournisseur, updateFournisseur, deleteFournisseur } from '@/services/supabase/fournisseurs';
import { useAuth } from '@/contexts/AuthContext';

const FournisseursPage = () => {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Chargement des fournisseurs depuis Supabase
  const loadFournisseurs = async () => {
    setIsLoading(true);
    try {
      const fournisseursData = await getFournisseurs();
      setFournisseurs(fournisseursData);
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les fournisseurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFournisseurs();
  }, []);

  // Filtrage des fournisseurs en fonction de la recherche
  const filteredFournisseurs = fournisseurs.filter(fournisseur => 
    `${fournisseur.prenom} ${fournisseur.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.telephone.includes(searchTerm)
  );

  // Ajout d'un nouveau fournisseur
  const handleAddFournisseur = async (formData: FournisseurFormValues) => {
    setIsSubmitting(true);
    try {
      const newFournisseur = await addFournisseur(formData);
      setFournisseurs(prev => [newFournisseur, ...prev]);
      setIsAddDialogOpen(false);
      toast({
        title: "Succès",
        description: "Fournisseur ajouté avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour d'un fournisseur
  const handleUpdateFournisseur = async (formData: FournisseurFormValues) => {
    if (!selectedFournisseur?.id) return;
    
    setIsSubmitting(true);
    try {
      const updatedFournisseur = await updateFournisseur(selectedFournisseur.id, formData);
      setFournisseurs(prev => prev.map(fournisseur => 
        fournisseur.id === updatedFournisseur.id ? updatedFournisseur : fournisseur
      ));
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "Fournisseur mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le fournisseur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Suppression d'un fournisseur
  const handleDeleteFournisseur = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteFournisseur(id);
      setFournisseurs(prev => prev.filter(fournisseur => fournisseur.id !== id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Succès",
        description: "Fournisseur supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fournisseur",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setFournisseurToDelete(null);
    }
  };

  // Ouverture des modales
  const openDeleteDialog = (id: string) => {
    setFournisseurToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const openDetailsModal = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setIsDetailsModalOpen(true);
  };

  const openEditDialog = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Fournisseurs</h1>
        <p className="text-muted-foreground">Gérez vos fournisseurs et consultez l'historique des produits achetés</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un fournisseur..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Ajouter un fournisseur</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau fournisseur</DialogTitle>
            </DialogHeader>
            <FournisseurForm 
              onSubmit={handleAddFournisseur} 
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
                  <TableHead className="hidden md:table-cell">Société</TableHead>
                  <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFournisseurs.length > 0 ? (
                  filteredFournisseurs.map((fournisseur) => (
                    <TableRow key={fournisseur.id}>
                      <TableCell className="font-medium">{`${fournisseur.prenom} ${fournisseur.nom}`}</TableCell>
                      <TableCell className="hidden md:table-cell">{fournisseur.societe}</TableCell>
                      <TableCell className="hidden sm:table-cell">{fournisseur.telephone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDetailsModal(fournisseur)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(fournisseur)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => fournisseur.id && openDeleteDialog(fournisseur.id)}
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
                      {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur dans la base de données'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails du fournisseur */}
      {selectedFournisseur && (
        <FournisseurDetailsModal
          fournisseur={selectedFournisseur}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {/* Dialog de modification du fournisseur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le fournisseur</DialogTitle>
          </DialogHeader>
          {selectedFournisseur && (
            <FournisseurForm 
              onSubmit={handleUpdateFournisseur}
              initialValues={selectedFournisseur}
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
          <p>Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => fournisseurToDelete && handleDeleteFournisseur(fournisseurToDelete)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FournisseursPage;
