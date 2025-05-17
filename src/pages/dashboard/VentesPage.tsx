import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ShoppingCart, Receipt, Package, User, FileText, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import NouvelleVenteForm from '@/components/ventes/NouvelleVenteForm';
import DevisForm from '@/components/ventes/DevisForm';
import { Client } from '@/services/supabase/clients';
import { Produit } from '@/pages/dashboard/StockPage';
import { clientsData } from '@/data/clients';
import { produitsData } from '@/data/stock';
import { ventesData } from '@/data/ventes';
import { teamData } from '@/data/team';
import { devisData } from '@/data/devis';
import DocumentGenerator from '@/components/ventes/DocumentGenerator';

export interface Vente {
  id: string;
  clientId: string;
  date: string;
  produits: {
    id: string;
    nom: string;
    quantite: number;
    prixUnitaire: number;
  }[];
  total: number;
  statut: 'payée' | 'en attente' | 'annulée';
  reference: string;
  vendeurId?: string; // ID du membre de l'équipe qui a fait la vente
  typeVente: 'magasin' | 'en_ligne';
}

export interface Devis {
  id: string;
  clientId: string;
  date: string;
  produits: {
    id: string;
    nom: string;
    quantite: number;
    prixUnitaire: number;
  }[];
  total: number;
  statut: 'en attente' | 'accepté' | 'refusé';
  reference: string;
  vendeurId?: string;
  validite: string; // Date de validité
  notes?: string;
}

const VentesPage = () => {
  const [activeTab, setActiveTab] = useState<'ventes' | 'devis'>('ventes');
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statutFilter, setStatutFilter] = useState('all');
  const [vendeurFilter, setVendeurFilter] = useState('all');
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isDevisOpen, setIsDevisOpen] = useState(false);

  useEffect(() => {
    // Chargement initial des données (simulé)
    setVentes(ventesData);
    setDevis(devisData || []);
    setClients(clientsData);
    setProduits(produitsData);
  }, []);

  const filteredVentes = ventes.filter(vente => {
    const matchesSearch = 
      vente.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(vente.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatut = statutFilter !== 'all' ? vente.statut === statutFilter : true;
    const matchesVendeur = vendeurFilter !== 'all' ? vente.vendeurId === vendeurFilter : true;
    
    return matchesSearch && matchesStatut && matchesVendeur;
  });

  const filteredDevis = devis.filter(devis => {
    const matchesSearch = 
      devis.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(devis.clientId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatut = statutFilter !== 'all' ? devis.statut === statutFilter : true;
    const matchesVendeur = vendeurFilter !== 'all' ? devis.vendeurId === vendeurFilter : true;
    
    return matchesSearch && matchesStatut && matchesVendeur;
  });

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.nom : 'Client inconnu';
  };

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId) || null;
  };
  
  const getVendeurName = (vendeurId?: string) => {
    if (!vendeurId) return 'Non assigné';
    const vendeur = teamData.find(v => v.id === vendeurId);
    return vendeur ? vendeur.nom : 'Vendeur inconnu';
  };

  const handleAddVente = (nouvelleVente: Omit<Vente, 'id' | 'reference' | 'date'>) => {
    // Générer une référence unique pour la vente
    const reference = `VENTE-${new Date().getFullYear().toString().substring(2)}-${String(ventes.length + 1).padStart(3, '0')}`;
    
    const vente: Vente = {
      id: `v-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      reference,
      ...nouvelleVente
    };
    
    setVentes(prev => [...prev, vente]);
    
    // Mise à jour des stocks
    vente.produits.forEach(produitVendu => {
      setProduits(prev => prev.map(produit => 
        produit.id === produitVendu.id 
          ? { ...produit, quantite: produit.quantite - produitVendu.quantite }
          : produit
      ));
    });
    
    toast.success("Vente enregistrée avec succès");
  };

  const handleAddDevis = (nouveauDevis: Omit<Devis, 'id' | 'reference' | 'date'>) => {
    // Générer une référence unique pour le devis
    const reference = `DEVIS-${new Date().getFullYear().toString().substring(2)}-${String(devis.length + 1).padStart(3, '0')}`;
    
    const devisComplet: Devis = {
      id: `d-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      reference,
      ...nouveauDevis
    };
    
    setDevis(prev => [...prev, devisComplet]);
    toast.success("Devis créé avec succès");
  };

  const handleConvertDevisToVente = (devisToConvert: Devis) => {
    // Conversion du devis en vente
    const nouvelleVente: Vente = {
      id: `v-${Date.now()}`,
      clientId: devisToConvert.clientId,
      date: new Date().toISOString().split('T')[0],
      produits: devisToConvert.produits,
      total: devisToConvert.total,
      statut: 'payée',
      reference: `VENTE-${new Date().getFullYear().toString().substring(2)}-${String(ventes.length + 1).padStart(3, '0')}`,
      vendeurId: devisToConvert.vendeurId,
      typeVente: 'magasin'
    };
    
    // Ajout de la vente et mise à jour du devis
    setVentes(prev => [...prev, nouvelleVente]);
    setDevis(prev => prev.map(d => 
      d.id === devisToConvert.id ? { ...d, statut: 'accepté' } : d
    ));
    
    // Mise à jour des stocks
    nouvelleVente.produits.forEach(produitVendu => {
      setProduits(prev => prev.map(produit => 
        produit.id === produitVendu.id 
          ? { ...produit, quantite: produit.quantite - produitVendu.quantite }
          : produit
      ));
    });
    
    toast.success("Devis converti en vente avec succès");
  };

  const handleGenerateReceipt = (vente: Vente) => {
    setSelectedVente(vente);
    setSelectedClient(getClientById(vente.clientId));
    setIsReceiptOpen(true);
  };

  const handleGenerateInvoice = (vente: Vente) => {
    setSelectedVente(vente);
    setSelectedClient(getClientById(vente.clientId));
    setIsInvoiceOpen(true);
  };

  const handleGenerateDevis = (devis: Devis) => {
    setSelectedDevis(devis);
    setSelectedClient(getClientById(devis.clientId));
    setIsDevisOpen(true);
  };

  // Statistiques des ventes
  const totalVentes = ventes.length;
  const ventesToday = ventes.filter(v => v.date === new Date().toISOString().split('T')[0]).length;
  const totalRevenue = ventes.reduce((sum, v) => v.statut !== 'annulée' ? sum + v.total : sum, 0);
  const pendingPayments = ventes.filter(v => v.statut === 'en attente').length;
  const totalDevis = devis.length;
  const devisPending = devis.filter(d => d.statut === 'en attente').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Ventes</h1>
        <p className="text-muted-foreground">Enregistrez et suivez les ventes et devis</p>
      </div>

      {/* Cards statistics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentes}</div>
            <p className="text-xs text-muted-foreground">Dont {ventesToday} aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} DH</div>
            <p className="text-xs text-muted-foreground">Total des ventes validées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevis}</div>
            <p className="text-xs text-muted-foreground">Dont {devisPending} en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Ventes à finaliser</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ventes" onValueChange={(value) => setActiveTab(value as 'ventes' | 'devis')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="ventes">Ventes</TabsTrigger>
            <TabsTrigger value="devis">Devis</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={activeTab === 'ventes' ? "Rechercher une vente..." : "Rechercher un devis..."}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Select value={statutFilter} onValueChange={setStatutFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {activeTab === 'ventes' ? (
                    <>
                      <SelectItem value="payée">Payée</SelectItem>
                      <SelectItem value="en attente">En attente</SelectItem>
                      <SelectItem value="annulée">Annulée</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="en attente">En attente</SelectItem>
                      <SelectItem value="accepté">Accepté</SelectItem>
                      <SelectItem value="refusé">Refusé</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={vendeurFilter} onValueChange={setVendeurFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrer par vendeur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les vendeurs</SelectItem>
                  {teamData.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> 
                    {activeTab === 'ventes' ? 'Nouvelle vente' : 'Nouveau devis'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {activeTab === 'ventes' ? 'Enregistrer une nouvelle vente' : 'Créer un nouveau devis'}
                    </DialogTitle>
                  </DialogHeader>
                  {activeTab === 'ventes' ? (
                    <NouvelleVenteForm 
                      onSubmit={handleAddVente} 
                      clients={clients}
                      produits={produits}
                      team={teamData}
                    />
                  ) : (
                    <DevisForm 
                      onSubmit={handleAddDevis} 
                      clients={clients}
                      produits={produits}
                      team={teamData}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <TabsContent value="ventes" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="min-h-[300px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Référence</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendeur</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Produits</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Statut</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVentes.length > 0 ? (
                      filteredVentes.map(vente => (
                        <tr key={vente.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{vente.reference}</td>
                          <td className="p-4">{new Date(vente.date).toLocaleDateString('fr-FR')}</td>
                          <td className="p-4">{getClientName(vente.clientId)}</td>
                          <td className="p-4">{getVendeurName(vente.vendeurId)}</td>
                          <td className="p-4 hidden lg:table-cell">
                            <div className="flex flex-col gap-1">
                              {vente.produits.map((p, idx) => (
                                <span key={idx} className="text-xs">
                                  {p.nom.length > 25 ? p.nom.substring(0, 25) + '...' : p.nom} x{p.quantite}
                                </span>
                              )).slice(0, 2)}
                              {vente.produits.length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{vente.produits.length - 2} autres produits
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">{vente.total.toFixed(2)} DH</td>
                          <td className="p-4 text-right">
                            <Badge 
                              variant="outline"
                              className={
                                vente.statut === 'payée' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' : 
                                vente.statut === 'en attente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900' : 
                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                              }
                            >
                              {vente.statut}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                title="Ticket de caisse"
                                onClick={() => handleGenerateReceipt(vente)}
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                title="Facture"
                                onClick={() => handleGenerateInvoice(vente)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="h-24 text-center">
                          Aucune vente trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devis" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="min-h-[300px]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Référence</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vendeur</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Validité</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Statut</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevis.length > 0 ? (
                      filteredDevis.map(devis => (
                        <tr key={devis.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{devis.reference}</td>
                          <td className="p-4">{new Date(devis.date).toLocaleDateString('fr-FR')}</td>
                          <td className="p-4">{getClientName(devis.clientId)}</td>
                          <td className="p-4">{getVendeurName(devis.vendeurId)}</td>
                          <td className="p-4 hidden lg:table-cell">{new Date(devis.validite).toLocaleDateString('fr-FR')}</td>
                          <td className="p-4 text-right font-medium">{devis.total.toFixed(2)} DH</td>
                          <td className="p-4 text-right">
                            <Badge 
                              variant="outline"
                              className={
                                devis.statut === 'accepté' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' : 
                                devis.statut === 'en attente' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900' : 
                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
                              }
                            >
                              {devis.statut}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                title="Voir le devis"
                                onClick={() => handleGenerateDevis(devis)}
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button>
                              {devis.statut === 'en attente' && (
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  title="Convertir en vente"
                                  onClick={() => handleConvertDevisToVente(devis)}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="h-24 text-center">
                          Aucun devis trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Generators */}
      <DocumentGenerator
        vente={selectedVente}
        client={selectedClient}
        type="receipt"
        isOpen={isReceiptOpen}
        setIsOpen={setIsReceiptOpen}
        businessName="BizzMax"
        businessLogo="/placeholder.svg"
      />

      <DocumentGenerator
        vente={selectedVente}
        client={selectedClient}
        type="invoice"
        isOpen={isInvoiceOpen}
        setIsOpen={setIsInvoiceOpen}
        businessName="BizzMax"
        businessAddress="123 Rue du Commerce, 75001 Paris"
        businessLogo="/placeholder.svg"
      />

      <DocumentGenerator
        devis={selectedDevis}
        client={selectedClient}
        type="devis" // Fix: We need to update the DocumentGenerator component to accept "devis" as a valid type
        isOpen={isDevisOpen}
        setIsOpen={setIsDevisOpen}
        businessName="BizzMax"
        businessAddress="123 Rue du Commerce, 75001 Paris"
        businessLogo="/placeholder.svg"
      />
    </div>
  );
};

export default VentesPage;
