
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Package, Plus, Trash2, Search } from 'lucide-react';
import { Client } from '@/pages/dashboard/ClientsPage';
import { Produit } from '@/pages/dashboard/StockPage';
import { Devis } from '@/pages/dashboard/VentesPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addDays, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define the TeamMember type if it doesn't exist elsewhere
interface TeamMember {
  id: string;
  nom: string;
  role: string;
  email: string;
  image?: string;
}

type DevisFormProps = {
  onSubmit: (data: Omit<Devis, 'id' | 'reference' | 'date'>) => void;
  clients: Client[];
  produits: Produit[];
  team?: TeamMember[];
};

type FormValues = {
  clientId: string;
  statut: 'en attente' | 'accepté' | 'refusé';
  vendeurId?: string;
  notes?: string;
};

type ProduitSelection = {
  produitId: string;
  quantite: number;
  nom: string;
  prixUnitaire: number;
  disponible: number;
  image?: string;
};

const DevisForm = ({ onSubmit, clients, produits, team = [] }: DevisFormProps) => {
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<ProduitSelection[]>([]);
  const [produitActuel, setProduitActuel] = useState<string>('');
  const [quantiteActuelle, setQuantiteActuelle] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<string>('all');
  const [depotFilter, setDepotFilter] = useState<string>('all');
  const [validite, setValidite] = useState<Date>(addDays(new Date(), 30));
  
  const form = useForm<FormValues>({
    defaultValues: {
      clientId: '',
      statut: 'en attente',
      vendeurId: '',
      notes: '',
    }
  });

  const handleAddProduit = (produitId: string, quantite: number = 1) => {
    const produit = produits.find(p => p.id === produitId);
    if (!produit) return;
    
    if (quantite <= 0) {
      setErrorMessage('La quantité doit être supérieure à 0');
      return;
    }
    
    // Vérifier si le produit est déjà dans la sélection
    const existingIndex = produitsSelectionnes.findIndex(p => p.produitId === produitId);
    
    if (existingIndex >= 0) {
      // Mettre à jour la quantité si le produit existe déjà
      const nouvelleQuantite = produitsSelectionnes[existingIndex].quantite + quantite;
      
      if (nouvelleQuantite > produit.quantite) {
        setErrorMessage(`Stock insuffisant. Seulement ${produit.quantite} disponible(s).`);
        return;
      }
      
      const updatedItems = [...produitsSelectionnes];
      updatedItems[existingIndex].quantite = nouvelleQuantite;
      setProduitsSelectionnes(updatedItems);
    } else {
      // Ajouter le produit s'il n'existe pas déjà
      if (quantite > produit.quantite) {
        setErrorMessage(`Stock insuffisant. Seulement ${produit.quantite} disponible(s).`);
        return;
      }
      
      setProduitsSelectionnes([
        ...produitsSelectionnes,
        {
          produitId: produit.id,
          nom: produit.nom,
          quantite: quantite,
          prixUnitaire: produit.prixVente,
          disponible: produit.quantite,
          image: produit.image || `https://source.unsplash.com/random/400x300/?product&id=${produit.id}`
        }
      ]);
    }
    
    // Réinitialiser les champs
    setProduitActuel('');
    setQuantiteActuelle(1);
    setErrorMessage('');
  };

  const handleRemoveProduit = (index: number) => {
    setProduitsSelectionnes(prev => prev.filter((_, i) => i !== index));
  };

  const calculerTotal = () => {
    return produitsSelectionnes.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0);
  };

  const handleFinalSubmit = (values: FormValues) => {
    if (produitsSelectionnes.length === 0) {
      setErrorMessage('Veuillez ajouter au moins un produit');
      return;
    }
    
    onSubmit({
      clientId: values.clientId,
      statut: values.statut,
      vendeurId: values.vendeurId,
      notes: values.notes,
      validite: validite.toISOString().split('T')[0],
      total: calculerTotal(),
      produits: produitsSelectionnes.map(p => ({
        id: p.produitId,
        nom: p.nom,
        quantite: p.quantite,
        prixUnitaire: p.prixUnitaire
      }))
    });
  };

  // Filtrer les produits par catégorie et dépôt et recherche
  const filteredProduits = produits.filter(p => {
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorieFilter === 'all' ? true : p.categorieId === categorieFilter;
    const matchesDepot = depotFilter === 'all' ? true : p.depotId === depotFilter;
    return matchesSearch && matchesCategorie && matchesDepot;
  });

  // Extraire les catégories uniques des produits
  const categories = Array.from(
    new Set(produits.map(p => ({ id: p.categorieId, nom: p.categorieId })))
  );

  // Extraire les dépôts uniques des produits
  const depots = Array.from(
    new Set(produits.map(p => ({ id: p.depotId, nom: p.depotId })))
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {team && team.length > 0 && (
            <FormField
              control={form.control}
              name="vendeurId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendeur</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un vendeur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {team.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex flex-col space-y-1.5">
            <FormLabel>Date de validité</FormLabel>
            <DatePicker
              date={validite}
              setDate={setValidite}
              locale={fr}
              placeholder="Sélectionnez une date de validité"
            />
          </div>
          
          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en attente">En attente</SelectItem>
                    <SelectItem value="accepté">Accepté</SelectItem>
                    <SelectItem value="refusé">Refusé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes supplémentaires</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ajoutez des informations complémentaires sur le devis..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Produits</h3>

          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grille</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un produit..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat.id}>{cat.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={depotFilter} onValueChange={setDepotFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Dépôt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les dépôts</SelectItem>
                      {depots.map((depot, idx) => (
                        <SelectItem key={idx} value={depot.id}>{depot.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredProduits.map((produit) => (
                  <Card 
                    key={produit.id} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleAddProduit(produit.id)}
                  >
                    <CardContent className="p-3 flex flex-col items-center">
                      <div 
                        className="w-full h-32 bg-muted rounded-md mb-2 overflow-hidden bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${produit.image || `https://source.unsplash.com/random/400x300/?product&id=${produit.id}`})`
                        }}
                      />
                      <div className="w-full text-center">
                        <h4 className="font-medium truncate">{produit.nom}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">{produit.quantite} en stock</span>
                          <span className="font-bold">{produit.prixVente.toFixed(2)} DH</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredProduits.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-center text-muted-foreground">
                      Aucun produit disponible pour cette sélection
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={produitActuel} onValueChange={setProduitActuel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProduits.map((produit) => (
                        <SelectItem key={produit.id} value={produit.id}>
                          {produit.nom} - {produit.prixVente.toFixed(2)} DH ({produit.quantite} en stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-28">
                  <Input
                    type="number"
                    min="1"
                    value={quantiteActuelle}
                    onChange={(e) => setQuantiteActuelle(parseInt(e.target.value) || 1)}
                    placeholder="Qté"
                  />
                </div>
                
                <Button type="button" onClick={() => handleAddProduit(produitActuel, quantiteActuelle)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          )}
          
          <div className="space-y-2 mt-4">
            {produitsSelectionnes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucun produit sélectionné</p>
                </CardContent>
              </Card>
            ) : (
              produitsSelectionnes.map((item, index) => (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div 
                          className="w-12 h-12 rounded bg-muted bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.image})` }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.nom}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>{item.quantite} x {item.prixUnitaire.toFixed(2)} DH</span>
                          <span className="mx-2">•</span>
                          <span className="font-medium">
                            {(item.quantite * item.prixUnitaire).toFixed(2)} DH
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => handleRemoveProduit(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {produitsSelectionnes.length > 0 && (
          <div className="bg-muted/50 p-4 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{calculerTotal().toFixed(2)} DH</span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">Créer le devis</Button>
        </div>
      </form>
    </Form>
  );
};

export default DevisForm;
