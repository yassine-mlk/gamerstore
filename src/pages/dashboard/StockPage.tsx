import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Package, UserCircle, Percent, Combine, Barcode, Printer, Loader2, Grid, List, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import ProduitFormWithTeam from '@/components/stock/ProduitFormWithTeam';
import ComposeProductForm from '@/components/stock/ComposeProductForm';
import ProductPromotionForm from '@/components/stock/ProductPromotionForm';
import BarcodeDisplay from '@/components/stock/BarcodeDisplay';
import { getProduits, getProduitsWithPromotions, createProduit, updateProduit, deleteProduit, createPromotion, deletePromotion, Produit, Promotion } from '@/services/supabase/stock';
import { getTeamMembers, TeamMember } from '@/services/supabase/team';
import { getDepots, getCategories, Depot, Category } from '@/services/supabase/parametres';

export interface Categorie extends Category {}

// Définir un type qui étend Produit pour inclure la promotion
export interface ProduitWithPromotion extends Produit {
  promotion?: Promotion;
}

const StockPage = () => {
  const [activeTab, setActiveTab] = useState<'produits' | 'compositions' | 'promotions'>('produits');
  const [produits, setProduits] = useState<ProduitWithPromotion[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<string>('all');
  const [depotFilter, setDepotFilter] = useState<string>('all');
  const [selectedProduit, setSelectedProduit] = useState<ProduitWithPromotion | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({
    produits: false,
    categories: false,
    depots: false,
    teamMembers: false,
    promotions: false,
    add: false,
    edit: false,
    delete: false,
    compose: false,
    promotion: false
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(prev => ({ ...prev, produits: true, categories: true, depots: true, teamMembers: true, promotions: true }));
      
      try {
        const produitsData = await getProduitsWithPromotions();
        setProduits(produitsData);
        
        const promotionsData = produitsData
          .filter(p => p.promotion)
          .map(p => p.promotion) as Promotion[];
        setPromotions(promotionsData);
        
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        const depotsData = await getDepots();
        setDepots(depotsData);
        
        const teamMembersData = await getTeamMembers();
        setTeamMembers(teamMembersData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(prev => ({ ...prev, produits: false, categories: false, depots: false, teamMembers: false, promotions: false }));
      }
    };
    
    loadData();
  }, []);

  const filteredProduits = produits.filter(produit => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === 'all' ? true : produit.categorieId === categorieFilter;
    const matchesDepot = depotFilter === 'all' ? true : produit.depotId === depotFilter;
    const matchesCompose = activeTab === 'compositions' ? !!produit.compose : true;
    const matchesPromotion = activeTab === 'promotions' ? !!produit.promotion : true;
    
    if (activeTab === 'produits') {
      return matchesSearch && matchesCategorie && matchesDepot;
    } else if (activeTab === 'compositions') {
      return matchesSearch && matchesCategorie && matchesDepot && matchesCompose;
    } else {
      return matchesSearch && matchesCategorie && matchesDepot && matchesPromotion;
    }
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.nom : 'Non catégorisé';
  };

  const getDepotName = (depotId: string) => {
    const depot = depots.find(d => d.id === depotId);
    return depot ? depot.nom : 'Non assigné';
  };

  const getTeamMemberName = (teamMemberId?: string) => {
    if (!teamMemberId) return 'Non assigné';
    const member = teamMembers.find(m => m.id === teamMemberId);
    return member ? member.nom : 'Non assigné';
  };

  const getTeamMember = (teamMemberId?: string) => {
    if (!teamMemberId) return null;
    return teamMembers.find(m => m.id === teamMemberId) || null;
  };

  const handleAddProduit = async (produitData: Omit<Produit, 'id' | 'reference'>) => {
    setIsLoading(prev => ({ ...prev, add: true }));
    
    try {
      // Vérifier les champs obligatoires avant de continuer
      if (!produitData.categorieId || produitData.categorieId.trim() === '') {
        toast.error("Veuillez sélectionner une catégorie pour le produit");
        setIsLoading(prev => ({ ...prev, add: false }));
        return;
      }
      
      if (!produitData.depotId || produitData.depotId.trim() === '') {
        toast.error("Veuillez sélectionner un dépôt pour le produit");
        setIsLoading(prev => ({ ...prev, add: false }));
        return;
      }
      
      // Générer une référence interne pour le produit
      const reference = `REF-${new Date().getFullYear().toString().substring(2)}-${String(produits.length + 1).padStart(3, '0')}`;
      
      // Utiliser exactement le code-barres saisi par l'utilisateur s'il existe
      // Ne générer un code-barres que si le champ est vide
      const codeBarres = produitData.codeBarres && produitData.codeBarres.trim() !== '' 
        ? produitData.codeBarres 
        : generateUniqueBarcode();
      
      console.log("Code-barres utilisé:", codeBarres, "Code-barres saisi:", produitData.codeBarres);
      
      // Créer le produit dans Supabase
      const newProduit = await createProduit({
        ...produitData,
        reference,
        codeBarres
      });
      
      if (newProduit) {
        // Ajouter le nouveau produit à l'état local
        setProduits(prev => [...prev, newProduit]);
        
        toast.success("Produit ajouté avec succès");
      } else {
        toast.error("Erreur lors de l'ajout du produit. Vérifiez que tous les champs sont correctement remplis.");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      toast.error("Erreur lors de l'ajout du produit");
    } finally {
      setIsLoading(prev => ({ ...prev, add: false }));
      setIsAddDialogOpen(false);
    }
  };

  const generateUniqueBarcode = (): string => {
    const countryPrefix = "611";
    
    const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    
    const codeWithoutChecksum = countryPrefix + randomPart;
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(codeWithoutChecksum[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    
    return codeWithoutChecksum + checksum;
  };

  const handleComposeProduct = async (compositionData: {
    nom: string;
    description: string;
    categorieId: string;
    depotId: string;
    composants: { produitId: string; quantite: number }[];
    prixVenteManuel?: number;
    codeBarres?: string;
  }) => {
    setIsLoading(prev => ({ ...prev, compose: true }));
    
    try {
      const { nom, description, categorieId, depotId, composants, prixVenteManuel, codeBarres } = compositionData;
      
      // Vérifier les champs obligatoires avant de continuer
      if (!categorieId || categorieId.trim() === '') {
        toast.error("Veuillez sélectionner une catégorie pour le produit composé");
        setIsLoading(prev => ({ ...prev, compose: false }));
        return;
      }
      
      if (!depotId || depotId.trim() === '') {
        toast.error("Veuillez sélectionner un dépôt pour le produit composé");
        setIsLoading(prev => ({ ...prev, compose: false }));
        return;
      }
      
      if (!composants || composants.length === 0) {
        toast.error("Veuillez ajouter au moins un composant au produit");
        setIsLoading(prev => ({ ...prev, compose: false }));
        return;
      }
      
      // Calculer le prix d'achat total des composants
      const prixAchatTotal = composants.reduce((total, comp) => {
        const produit = produits.find(p => p.id === comp.produitId);
        return total + (produit ? produit.prixAchat * comp.quantite : 0);
      }, 0);
      
      // Calculer le prix de vente suggéré (majoré de 30% par défaut si pas de prix manuel)
      const prixVente = prixVenteManuel || Math.round(prixAchatTotal * 1.3 * 100) / 100;
      
      // Générer une référence unique pour le produit composé
      const reference = `COMP-${new Date().getFullYear().toString().substring(2)}-${String(produits.filter(p => p.compose).length + 1).padStart(3, '0')}`;
      
      // Utiliser le code-barres saisi ou en générer un si vide
      const productBarcode = codeBarres && codeBarres.trim() !== '' 
        ? codeBarres 
        : generateUniqueBarcode();
      
      // Créer le produit composé dans Supabase
      const newProduit = await createProduit({
        nom,
        description,
        reference,
        codeBarres: productBarcode,
        prixAchat: prixAchatTotal,
        prixVente,
        quantite: 0, // Le stock initial est à 0, à augmenter lors de la création
        categorieId,
        depotId,
        compose: true,
        composants
      });
      
      if (newProduit) {
        // Ajouter le nouveau produit à l'état local
        setProduits(prev => [...prev, newProduit]);
        
        toast.success("Produit composé créé avec succès");
      } else {
        toast.error("Erreur lors de la création du produit composé. Vérifiez que tous les champs sont correctement remplis.");
      }
    } catch (error) {
      console.error("Erreur lors de la création du produit composé:", error);
      toast.error("Erreur lors de la création du produit composé");
    } finally {
      setIsLoading(prev => ({ ...prev, compose: false }));
      setIsComposeDialogOpen(false);
    }
  };

  const handleAddPromotion = async (promotionData: {
    produitId: string;
    type: 'pourcentage' | 'montant' | 'bundle';
    valeur: number;
    dateDebut: string;
    dateFin: string;
    description?: string;
  }) => {
    setIsLoading(prev => ({ ...prev, promotion: true }));
    
    try {
      // Créer la nouvelle promotion dans Supabase
      const newPromotion = await createPromotion(promotionData);
      
      if (newPromotion) {
        // Ajouter la promotion à l'état local
        setPromotions(prev => [...prev, newPromotion]);
        
        // Mettre à jour le produit associé
        setProduits(prev => prev.map(produit => 
          produit.id === promotionData.produitId 
            ? { ...produit, promotion: newPromotion } 
            : produit
        ));
        
        toast.success("Promotion ajoutée avec succès");
      } else {
        toast.error("Erreur lors de l'ajout de la promotion");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la promotion:", error);
      toast.error("Erreur lors de l'ajout de la promotion");
    } finally {
      setIsLoading(prev => ({ ...prev, promotion: false }));
      setIsPromotionDialogOpen(false);
    }
  };

  const handleEditProduit = async (produitData: Omit<Produit, 'id' | 'reference'>) => {
    if (!selectedProduit) return;
    
    setIsLoading(prev => ({ ...prev, edit: true }));
    
    try {
      // Vérifier les champs obligatoires avant de continuer
      if (!produitData.categorieId || produitData.categorieId.trim() === '') {
        toast.error("Veuillez sélectionner une catégorie pour le produit");
        setIsLoading(prev => ({ ...prev, edit: false }));
        return;
      }
      
      if (!produitData.depotId || produitData.depotId.trim() === '') {
        toast.error("Veuillez sélectionner un dépôt pour le produit");
        setIsLoading(prev => ({ ...prev, edit: false }));
        return;
      }
      
      // Mettre à jour le produit dans Supabase
      const updatedProduit = await updateProduit(selectedProduit.id, produitData);
      
      if (updatedProduit) {
        // Mettre à jour l'état local
        setProduits(prev => prev.map(p => 
          p.id === selectedProduit.id 
            ? { ...p, ...updatedProduit } 
            : p
        ));
        
        toast.success("Produit mis à jour avec succès");
        setIsEditDialogOpen(false);
        setSelectedProduit(null);
      } else {
        toast.error("Erreur lors de la mise à jour du produit. Vérifiez que tous les champs sont correctement remplis.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      toast.error("Erreur lors de la mise à jour du produit");
    } finally {
      setIsLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleDeleteProduit = async () => {
    if (!selectedProduit) return;
    
    setIsLoading(prev => ({ ...prev, delete: true }));
    
    try {
      // Supprimer le produit dans Supabase
      const result = await deleteProduit(selectedProduit.id);
      
      if (result.success) {
        // Mettre à jour l'état local
        setProduits(prev => prev.filter(p => p.id !== selectedProduit.id));
        
        // Si le produit avait une promotion, la supprimer également de l'état local
        if (selectedProduit.promotion) {
          setPromotions(prev => prev.filter(p => p.id !== selectedProduit.promotion?.id));
        }
        
        toast.success("Produit supprimé avec succès");
      } else {
        // Afficher le message d'erreur
        toast.error(result.message || "Erreur lors de la suppression du produit");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error);
      toast.error("Erreur lors de la suppression du produit");
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
      setIsDeleteDialogOpen(false);
      setSelectedProduit(null);
    }
  };

  const removePromotion = async (produitId: string, promotionId: string) => {
    setIsLoading(prev => ({ ...prev, promotion: true }));
    
    try {
      // Supprimer la promotion dans Supabase
      const success = await deletePromotion(promotionId);
      
      if (success) {
        // Mettre à jour l'état local
        setProduits(prev => prev.map(produit => 
          produit.id === produitId 
            ? { ...produit, promotion: undefined } 
            : produit
        ));
        
        setPromotions(prev => prev.filter(p => p.id !== promotionId));
        
        toast.success("Promotion supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression de la promotion");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la promotion:", error);
      toast.error("Erreur lors de la suppression de la promotion");
    } finally {
      setIsLoading(prev => ({ ...prev, promotion: false }));
    }
  };

  const clearFilters = () => {
    setCategorieFilter('all');
    setDepotFilter('all');
    setSearchTerm('');
  };

  const getMemberInitials = (name: string) => {
    if (!name || name === 'Non assigné') return 'NA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`;
    }
    return parts[0].substring(0, 2);
  };

  const isPromotionActive = (dateDebut: string, dateFin: string) => {
    const now = new Date();
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return now >= debut && now <= fin;
  };

  // Function to view product details
  const handleViewProductDetails = (productId: string) => {
    navigate(`/dashboard/stock/product/${productId}`);
  };

  // Rendu conditionnel basé sur l'état de chargement des données
  if (isLoading.produits || isLoading.categories || isLoading.depots || isLoading.teamMembers) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion du Stock</h1>
        <p className="text-muted-foreground">Gérez les produits, compositions et promotions</p>
      </div>

      <Tabs defaultValue="produits" onValueChange={(value) => setActiveTab(value as 'produits' | 'compositions' | 'promotions')}>
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-4">
            <TabsList>
              <TabsTrigger value="produits">Produits</TabsTrigger>
              <TabsTrigger value="compositions">Compositions</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
            </TabsList>
            
            {/* View mode toggle */}
            <div className="hidden sm:flex border rounded-md">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm" 
                className="rounded-r-none"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Tableau
              </Button>
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('cards')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Cartes
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-4 sm:mt-0">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(categorie => (
                    <SelectItem key={categorie.id} value={categorie.id}>{categorie.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={depotFilter} onValueChange={setDepotFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par dépôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les dépôts</SelectItem>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>{depot.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                {(searchTerm || categorieFilter !== 'all' || depotFilter !== 'all') && (
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="mr-2 h-4 w-4" />
                    Effacer les filtres
                  </Button>
                )}
                
                {activeTab === 'produits' && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau produit
                  </Button>
                )}
                
                {activeTab === 'compositions' && (
                  <Button onClick={() => setIsComposeDialogOpen(true)}>
                    <Combine className="mr-2 h-4 w-4" />
                    Nouvelle composition
                  </Button>
                )}
                
                {activeTab === 'promotions' && (
                  <Button onClick={() => setIsPromotionDialogOpen(true)}>
                    <Percent className="mr-2 h-4 w-4" />
                    Nouvelle promotion
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <TabsContent value="produits" className="mt-6">
          {viewMode === 'table' ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Code-barres</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="hidden md:table-cell">Dépôt</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigné à</TableHead>
                      <TableHead className="text-right">Prix Vente</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProduits.length > 0 ? (
                      filteredProduits.map((produit) => {
                        const member = teamMembers.find(m => m.id === produit.teamMemberId);
                        return (
                          <TableRow key={produit.id}>
                            <TableCell className="font-mono text-xs">{produit.reference}</TableCell>
                            <TableCell className="font-mono text-xs">{produit.codeBarres}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {produit.image ? (
                                  <div className="w-8 h-8 rounded-md overflow-hidden">
                                    <img src={produit.image} alt={produit.nom} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                                {produit.nom}
                              </div>
                            </TableCell>
                            <TableCell>{getCategoryName(produit.categorieId)}</TableCell>
                            <TableCell className="hidden md:table-cell">{getDepotName(produit.depotId)}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {member ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{getMemberInitials(member.nom)}</AvatarFallback>
                                  </Avatar>
                                  <span>{member.nom}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Non assigné</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                {produit.promotion && isPromotionActive(produit.promotion.dateDebut, produit.promotion.dateFin) ? (
                                  <>
                                    <span className="line-through text-muted-foreground text-xs">
                                      {produit.prixVente !== undefined ? produit.prixVente.toFixed(2) : '0.00'} DH
                                    </span>
                                    <span className="font-semibold text-red-600 dark:text-red-400">
                                      {produit.promotion.type === 'pourcentage' 
                                        ? (produit.prixVente !== undefined ? (produit.prixVente * (1 - produit.promotion.valeur / 100)).toFixed(2) : '0.00')
                                        : produit.promotion.type === 'montant'
                                          ? (produit.prixVente !== undefined ? (produit.prixVente - produit.promotion.valeur).toFixed(2) : '0.00')
                                          : produit.prixVente !== undefined ? produit.prixVente.toFixed(2) : '0.00'} DH
                                    </span>
                                  </>
                                ) : (
                                  <span>{produit.prixVente !== undefined ? produit.prixVente.toFixed(2) : '0.00'} DH</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={produit.quantite > 10 ? "outline" : produit.quantite > 0 ? "secondary" : "destructive"}>
                                {produit.quantite}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewProductDetails(produit.id)}
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProduit(produit);
                                    setIsBarcodeDialogOpen(true);
                                  }}
                                >
                                  <Printer className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isLoading.edit}
                                  onClick={() => {
                                    setSelectedProduit(produit);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  {isLoading.edit && selectedProduit?.id === produit.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Edit className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isLoading.delete}
                                  onClick={() => {
                                    setSelectedProduit(produit);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  {isLoading.delete && selectedProduit?.id === produit.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center">
                          {searchTerm || categorieFilter !== 'all' || depotFilter !== 'all' ? (
                            <div className="flex flex-col items-center">
                              <Package className="h-10 w-10 text-muted-foreground/50" />
                              <p className="mt-2">Aucun produit ne correspond à votre recherche</p>
                              <Button variant="link" onClick={clearFilters}>
                                Effacer les filtres
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Package className="h-10 w-10 text-muted-foreground/50" />
                              <p className="mt-2">Aucun produit dans votre inventaire</p>
                              <Button variant="outline" className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Ajouter un produit
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProduits.length > 0 ? filteredProduits.map(produit => (
                <Card key={produit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-0">
                    <CardTitle className="text-lg font-medium flex items-center justify-between">
                      <span className="truncate">{produit.nom}</span>
                      <Badge variant={produit.quantite > 10 ? "outline" : produit.quantite > 0 ? "secondary" : "destructive"}>
                        {produit.quantite}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex justify-between text-xs">
                      <span className="font-mono">{produit.reference}</span>
                      <span>{getCategoryName(produit.categorieId)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="relative aspect-square bg-muted rounded-md mb-4 overflow-hidden">
                      {produit.image ? (
                        <img 
                          src={produit.image} 
                          alt={produit.nom} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Prix:</span>
                        <span className="font-medium">{produit.prixVente.toFixed(2)} DH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Dépôt:</span>
                        <span>{getDepotName(produit.depotId)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                    <Button variant="default" size="sm" className="w-full" onClick={() => handleViewProductDetails(produit.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedProduit(produit);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setSelectedProduit(produit);
                      setIsDeleteDialogOpen(true);
                    }}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="col-span-full flex flex-col items-center justify-center h-64">
                  <Package className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-2">
                    {searchTerm || categorieFilter !== 'all' || depotFilter !== 'all' 
                      ? 'Aucun produit ne correspond à votre recherche' 
                      : 'Aucun produit dans votre inventaire'}
                  </p>
                  {searchTerm || categorieFilter !== 'all' || depotFilter !== 'all' ? (
                    <Button variant="link" onClick={clearFilters}>
                      Effacer les filtres
                    </Button>
                  ) : (
                    <Button variant="outline" className="mt-2" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un produit
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="compositions" className="mt-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Produit composé</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="hidden md:table-cell">Dépôt</TableHead>
                    <TableHead className="text-right">Prix Vente</TableHead>
                    <TableHead className="hidden lg:table-cell">Composants</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduits.length > 0 ? (
                    filteredProduits.map((produit) => (
                      <TableRow key={produit.id}>
                        <TableCell className="font-mono text-xs">{produit.reference}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {produit.image ? (
                              <div className="w-8 h-8 rounded-md overflow-hidden">
                                <img src={produit.image} alt={produit.nom} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
                                <Combine className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            {produit.nom}
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(produit.categorieId)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getDepotName(produit.depotId)}</TableCell>
                        <TableCell className="text-right">{produit.prixVente !== undefined ? produit.prixVente.toFixed(2) : '0.00'} DH</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-col gap-1">
                            {produit.composants?.map((comp, idx) => {
                              const composant = produits.find(p => p.id === comp.produitId);
                              return (
                                <span key={idx} className="text-xs">
                                  {composant?.nom || 'Produit inconnu'} x{comp.quantite}
                                </span>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={produit.quantite > 10 ? "outline" : produit.quantite > 0 ? "secondary" : "destructive"}>
                            {produit.quantite}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduit(produit);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduit(produit);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center">
                          <Combine className="h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-2">Aucun produit composé</p>
                          <Button variant="outline" className="mt-2" onClick={() => setIsComposeDialogOpen(true)}>
                            <Combine className="mr-2 h-4 w-4" />
                            Créer une composition
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Prix initial</TableHead>
                    <TableHead>Prix promo</TableHead>
                    <TableHead className="hidden md:table-cell">Validité</TableHead>
                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduits.length > 0 ? (
                    filteredProduits.map((produit) => {
                      const promo = produit.promotion;
                      if (!promo) return null;
                      
                      const isActive = isPromotionActive(promo.dateDebut, promo.dateFin);
                      const prixPromo = promo.type === 'pourcentage' 
                        ? produit.prixVente * (1 - promo.valeur / 100)
                        : promo.type === 'montant'
                          ? produit.prixVente - promo.valeur
                          : produit.prixVente;
                      
                      return (
                        <TableRow key={produit.id}>
                          <TableCell className="font-medium">{produit.nom}</TableCell>
                          <TableCell>
                            {promo.type === 'pourcentage' ? 'Pourcentage' : 
                             promo.type === 'montant' ? 'Montant fixe' : 'Bundle'}
                          </TableCell>
                          <TableCell>
                            {promo.type === 'pourcentage' ? `${promo.valeur}%` : 
                             promo.type === 'montant' ? `${promo.valeur} DH` : 
                             `${promo.valeur} offert(s)`}
                          </TableCell>
                          <TableCell>{produit.prixVente !== undefined ? produit.prixVente.toFixed(2) : '0.00'} DH</TableCell>
                          <TableCell className="font-medium text-red-600 dark:text-red-400">
                            {prixPromo !== undefined ? prixPromo.toFixed(2) : '0.00'} DH
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(promo.dateDebut).toLocaleDateString('fr-FR')} au {new Date(promo.dateFin).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {promo.description || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="outline"
                              className={isActive ? 
                                "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900" : 
                                "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                              }
                            >
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePromotion(produit.id, promo.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }).filter(Boolean)
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex flex-col items-center">
                          <Percent className="h-10 w-10 text-muted-foreground/50" />
                          <p className="mt-2">Aucune promotion active</p>
                          <Button variant="outline" className="mt-2" onClick={() => setIsPromotionDialogOpen(true)}>
                            <Percent className="mr-2 h-4 w-4" />
                            Créer une promotion
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          </DialogHeader>
          {isLoading.add ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ProduitFormWithTeam 
              onSubmit={handleAddProduit} 
              categories={categories} 
              depots={depots} 
              teamMembers={teamMembers}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          {isLoading.edit || !selectedProduit ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ProduitFormWithTeam
              initialValues={selectedProduit}
              onSubmit={handleEditProduit}
              categories={categories}
              depots={depots}
              teamMembers={teamMembers}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Composer un nouveau produit</DialogTitle>
            <DialogDescription>
              Créez un nouveau produit composé de plusieurs produits existants
            </DialogDescription>
          </DialogHeader>
          <ComposeProductForm
            onSubmit={handleComposeProduct}
            produits={produits.filter(p => !p.compose)}
            categories={categories}
            depots={depots}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une promotion</DialogTitle>
            <DialogDescription>
              Créez une promotion pour un produit existant
            </DialogDescription>
          </DialogHeader>
          <ProductPromotionForm
            onSubmit={handleAddPromotion}
            produits={produits.filter(p => !p.promotion)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedProduit && (
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="space-y-1">
                <p className="font-medium">{selectedProduit.nom}</p>
                <p className="text-sm text-muted-foreground">Référence: {selectedProduit.reference}</p>
                <p className="text-sm text-muted-foreground">Catégorie: {getCategoryName(selectedProduit.categorieId)}</p>
                <p className="text-sm text-muted-foreground">Dépôt: {getDepotName(selectedProduit.depotId)}</p>
                <p className="text-sm text-muted-foreground">Prix: {selectedProduit.prixVente !== undefined ? selectedProduit.prixVente.toFixed(2) : '0.00'} DH</p>
                <p className="text-sm text-muted-foreground">Stock: {selectedProduit.quantite}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading.delete}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduit} 
              disabled={isLoading.delete}
            >
              {isLoading.delete ? (
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

      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Imprimer le code-barres
            </DialogTitle>
            <DialogDescription>
              Imprimer le code-barres pour l'étiquetage du produit.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduit && (
            <BarcodeDisplay 
              barcode={selectedProduit.codeBarres}
              productName={selectedProduit.nom}
              price={selectedProduit.prixVente}
            />
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBarcodeDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockPage;
