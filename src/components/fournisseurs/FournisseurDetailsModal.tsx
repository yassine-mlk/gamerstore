import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Fournisseur, ProduitAchete, getFournisseurProduits } from '@/services/supabase/fournisseurs';

interface FournisseurDetailsModalProps {
  fournisseur: Fournisseur;
  isOpen: boolean;
  onClose: () => void;
}

const FournisseurDetailsModal = ({ fournisseur, isOpen, onClose }: FournisseurDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [produitsAchetes, setProduitsAchetes] = useState<ProduitAchete[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadProduits = async () => {
      if (fournisseur.id && isOpen) {
        setIsLoading(true);
        try {
          const produits = await getFournisseurProduits(fournisseur.id);
          setProduitsAchetes(produits);
        } catch (error) {
          console.error('Erreur lors du chargement des produits:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadProduits();
  }, [fournisseur.id, isOpen]);
  
  // Calculer les statistiques du fournisseur
  const totalCommandes = produitsAchetes.length;
  const totalDepense = produitsAchetes.reduce((sum, produit) => sum + produit.total, 0);
  const derniereCommande = produitsAchetes.length > 0 
    ? new Date(produitsAchetes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
        .toLocaleDateString('fr-FR')
    : 'Aucune';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fournisseur.societe}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="produits">Historique des produits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCommandes}</div>
                  <p className="text-xs text-muted-foreground">commandes passées</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total acheté</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDepense.toFixed(2)} DH</div>
                  <p className="text-xs text-muted-foreground">depuis le début</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dernière commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{derniereCommande}</div>
                  <p className="text-xs text-muted-foreground">date</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations du fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Nom</dt>
                    <dd>{fournisseur.nom}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Prénom</dt>
                    <dd>{fournisseur.prenom}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Société</dt>
                    <dd>{fournisseur.societe}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Téléphone</dt>
                    <dd>{fournisseur.telephone}</dd>
                  </div>
                  {fournisseur.created_at && (
                    <div>
                      <dt className="font-medium text-gray-500">Relation depuis</dt>
                      <dd>{new Date(fournisseur.created_at).toLocaleDateString('fr-FR')}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="produits" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : produitsAchetes.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Produits</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produitsAchetes.map((produit) => (
                        <TableRow key={produit.id}>
                          <TableCell>{new Date(produit.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {produit.produits.map((item, index) => (
                                <div key={index} className="text-xs">
                                  {item.nom} x{item.quantite} ({item.prix_unitaire.toFixed(2)} DH)
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {produit.total.toFixed(2)} DH
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="outline"
                              className={
                                produit.statut === 'reçu' ? 'bg-green-50 text-green-700 border-green-200' : 
                                produit.statut === 'en cours' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {produit.statut}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Aucun produit acheté à ce fournisseur</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FournisseurDetailsModal;
