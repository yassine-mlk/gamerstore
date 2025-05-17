import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Loader2, ShoppingCart, Printer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { getProduitById, deleteProduit, Produit } from '@/services/supabase/stock';
import { getCategories, getDepots, Category, Depot } from '@/services/supabase/parametres';
import { getTeamMembers, TeamMember } from '@/services/supabase/team';
import BarcodeDisplay from '@/components/stock/BarcodeDisplay';
import ProduitFormWithTeam from '@/components/stock/ProduitFormWithTeam';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Produit | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const [produit, categoriesData, depotsData, teamMembersData] = await Promise.all([
          getProduitById(id),
          getCategories(),
          getDepots(),
          getTeamMembers()
        ]);
        
        setProduct(produit);
        setCategories(categoriesData);
        setDepots(depotsData);
        setTeamMembers(teamMembersData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données du produit');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
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
    return member ? `${member.nom} ${member.prenom}` : 'Non assigné';
  };
  
  const handleDeleteProduct = async () => {
    if (!product) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteProduit(product.id);
      
      if (result.success) {
        toast.success('Produit supprimé avec succès');
        navigate('/dashboard/stock');
      } else {
        toast.error(result.message || 'Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du produit');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleEditSubmit = async (updatedProduct: Omit<Produit, 'id' | 'reference' | 'created_at' | 'updated_at'>) => {
    setIsEditing(false);
    // Recharger les données du produit après l'édition
    if (id) {
      const updatedData = await getProduitById(id);
      setProduct(updatedData);
      toast.success('Produit mis à jour avec succès');
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Chargement du produit...</p>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Package className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-semibold mt-4">Produit non trouvé</h2>
        <p className="text-muted-foreground mb-4">Le produit demandé n'existe pas ou a été supprimé.</p>
        <Button onClick={() => navigate('/dashboard/stock')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'inventaire
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/stock')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{product.nom}</h1>
          <Badge className="ml-2">{getCategoryName(product.categorieId)}</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBarcodeDialogOpen(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Code-barres
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Référence</p>
                  <p className="font-mono">{product.reference}</p>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Code-barres</p>
                  <p className="font-mono">{product.codeBarres}</p>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                  <p>{getCategoryName(product.categorieId)}</p>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Dépôt</p>
                  <p>{getDepotName(product.depotId)}</p>
                </div>
              </div>
              
              <div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Prix d'achat</p>
                  <p className="font-semibold">{product.prixAchat.toFixed(2)} DH</p>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Prix de vente</p>
                  <p className="font-semibold">{product.prixVente.toFixed(2)} DH</p>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Quantité en stock</p>
                  <div className="flex items-center">
                    <Badge variant={product.quantite > 10 ? "outline" : product.quantite > 0 ? "secondary" : "destructive"} className="mr-2">
                      {product.quantite}
                    </Badge>
                    {product.quantite === 0 && <span className="text-red-500 text-sm">Rupture de stock</span>}
                    {product.quantite > 0 && product.quantite <= 5 && <span className="text-amber-500 text-sm">Stock faible</span>}
                  </div>
                </div>
                
                <div className="space-y-1 mt-4">
                  <p className="text-sm font-medium text-muted-foreground">Assigné à</p>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{getTeamMemberName(product.teamMemberId)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {product.description || "Aucune description disponible"}
              </p>
            </CardContent>
          </Card>
          
          {product.compose && (
            <Card>
              <CardHeader>
                <CardTitle>Composants</CardTitle>
                <CardDescription>Ce produit est composé des éléments suivants:</CardDescription>
              </CardHeader>
              <CardContent>
                {product.composants && product.composants.length > 0 ? (
                  <ul className="space-y-2">
                    {product.composants.map((comp, index) => (
                      <li key={index} className="flex justify-between items-center border-b pb-2">
                        <span>{comp.produitId}</span>
                        <Badge>x{comp.quantite}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucun composant défini</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image du produit</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {product.image ? (
                <div className="w-full rounded-md overflow-hidden border">
                  <img src={product.image} alt={product.nom} className="w-full h-auto object-cover" />
                </div>
              ) : (
                <div className="w-full h-48 bg-muted rounded-md flex flex-col items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mt-2">Aucune image disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" disabled={product.quantite <= 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter à une vente
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setIsBarcodeDialogOpen(true)}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer le code-barres
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogs */}
      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Code-barres du produit</DialogTitle>
          </DialogHeader>
          <BarcodeDisplay 
            barcode={product.codeBarres}
            productName={product.nom}
            price={product.prixVente}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="space-y-1">
              <p className="font-medium">{product.nom}</p>
              <p className="text-sm text-muted-foreground">Référence: {product.reference}</p>
              <p className="text-sm text-muted-foreground">Catégorie: {getCategoryName(product.categorieId)}</p>
              <p className="text-sm text-muted-foreground">Dépôt: {getDepotName(product.depotId)}</p>
              <p className="text-sm text-muted-foreground">Prix: {product.prixVente.toFixed(2)} DH</p>
              <p className="text-sm text-muted-foreground">Stock: {product.quantite}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct} 
              disabled={isDeleting}
            >
              {isDeleting ? (
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
      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <ProduitFormWithTeam
            initialValues={product}
            onSubmit={handleEditSubmit}
            categories={categories}
            depots={depots}
            teamMembers={teamMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetailPage; 