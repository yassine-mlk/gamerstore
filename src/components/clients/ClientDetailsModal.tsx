import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Client, Achat, getClientAchats } from '@/services/supabase/clients';
import { Loader2 } from 'lucide-react';

interface ClientDetailsModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailsModal = ({ client, isOpen, onClose }: ClientDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [clientAchats, setClientAchats] = useState<Achat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadAchats = async () => {
      if (client.id && activeTab === 'historique') {
        setIsLoading(true);
        try {
          const achats = await getClientAchats(client.id);
          setClientAchats(achats);
        } catch (error) {
          console.error('Erreur lors du chargement des achats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadAchats();
  }, [client.id, activeTab]);
  
  // Calculer les statistiques du client
  const totalAchats = clientAchats.length;
  const totalDepense = clientAchats.reduce((sum, achat) => sum + achat.total, 0);
  const dernierAchat = clientAchats.length > 0 
    ? new Date(clientAchats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
        .toLocaleDateString('fr-FR')
    : 'Aucun';

  const fullName = `${client.prenom} ${client.nom}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fullName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="historique">Historique d'achats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Achats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAchats}</div>
                  <p className="text-xs text-muted-foreground">commandes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total dépensé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDepense.toFixed(2)} DH</div>
                  <p className="text-xs text-muted-foreground">depuis le début</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dernier achat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dernierAchat}</div>
                  <p className="text-xs text-muted-foreground">date</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500">Nom complet</dt>
                    <dd>{fullName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Email</dt>
                    <dd>{client.email || 'Non spécifié'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Téléphone</dt>
                    <dd>{client.telephone || 'Non spécifié'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Ville</dt>
                    <dd>{client.ville || 'Non spécifiée'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Client depuis</dt>
                    <dd>{client.created_at ? new Date(client.created_at).toLocaleDateString('fr-FR') : 'Non spécifié'}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="historique" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : clientAchats.length > 0 ? (
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
                      {clientAchats.map((achat) => (
                        <TableRow key={achat.id}>
                          <TableCell>{new Date(achat.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {achat.produits.map((produit, index) => (
                                <div key={index} className="text-xs">
                                  {produit.nom} x{produit.quantite} ({produit.prix_unitaire.toFixed(2)} DH)
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {achat.total.toFixed(2)} DH
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="outline"
                              className={
                                achat.statut === 'payé' ? 'bg-green-50 text-green-700 border-green-200' : 
                                achat.statut === 'en attente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {achat.statut}
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
                  <p className="text-muted-foreground">Ce client n'a pas encore effectué d'achats</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;
