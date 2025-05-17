import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Categorie, Depot, Produit } from '@/pages/dashboard/StockPage';
import { Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ComposeProductFormProps {
  onSubmit: (data: {
    nom: string;
    description: string;
    categorieId: string;
    depotId: string;
    composants: { produitId: string; quantite: number }[];
    prixVenteManuel?: number;
  }) => void;
  produits: Produit[];
  categories: Categorie[];
  depots: Depot[];
}

type FormValues = {
  nom: string;
  description: string;
  categorieId: string;
  depotId: string;
  usePrixManuel: boolean;
  prixVenteManuel?: number;
};

type ComposantSelection = {
  produitId: string;
  quantite: number;
};

const ComposeProductForm = ({ onSubmit, produits, categories, depots }: ComposeProductFormProps) => {
  const [composants, setComposants] = useState<ComposantSelection[]>([]);
  const [currentProduitId, setCurrentProduitId] = useState<string>('');
  const [currentQuantite, setCurrentQuantite] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const form = useForm<FormValues>({
    defaultValues: {
      nom: '',
      description: '',
      categorieId: '',
      depotId: '',
      usePrixManuel: false,
      prixVenteManuel: 0,
    }
  });

  const handleAddComposant = () => {
    if (!currentProduitId) {
      setErrorMessage('Veuillez sélectionner un produit');
      return;
    }

    if (currentQuantite <= 0) {
      setErrorMessage('La quantité doit être supérieure à 0');
      return;
    }

    // Vérifier si le produit est déjà dans la liste des composants
    const existingIndex = composants.findIndex(c => c.produitId === currentProduitId);
    
    if (existingIndex >= 0) {
      // Mettre à jour la quantité si le produit existe déjà
      const updatedComposants = [...composants];
      updatedComposants[existingIndex].quantite += currentQuantite;
      setComposants(updatedComposants);
    } else {
      // Ajouter le produit s'il n'existe pas déjà
      setComposants([
        ...composants,
        {
          produitId: currentProduitId,
          quantite: currentQuantite
        }
      ]);
    }
    
    // Réinitialiser les champs
    setCurrentProduitId('');
    setCurrentQuantite(1);
    setErrorMessage('');
  };

  const handleRemoveComposant = (index: number) => {
    setComposants(prev => prev.filter((_, i) => i !== index));
  };

  const calculerPrixAchat = () => {
    return composants.reduce((sum, comp) => {
      const produit = produits.find(p => p.id === comp.produitId);
      return sum + (produit ? produit.prixAchat * comp.quantite : 0);
    }, 0);
  };

  const calculerPrixVenteSuggere = () => {
    // Majoration de 30% par rapport au prix d'achat
    return Math.round(calculerPrixAchat() * 1.3 * 100) / 100;
  };

  const handleFinalSubmit = (values: FormValues) => {
    if (composants.length === 0) {
      setErrorMessage('Veuillez ajouter au moins un composant');
      return;
    }
    
    onSubmit({
      nom: values.nom,
      description: values.description,
      categorieId: values.categorieId,
      depotId: values.depotId,
      composants,
      prixVenteManuel: values.usePrixManuel ? values.prixVenteManuel : undefined
    });
  };

  const getProduitDetails = (produitId: string) => {
    return produits.find(p => p.id === produitId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            rules={{ required: 'Le nom est obligatoire' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du produit composé</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categorieId"
            rules={{ required: 'La catégorie est obligatoire' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="depotId"
            rules={{ required: 'Le dépôt est obligatoire' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dépôt</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un dépôt" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {depots.map(depot => (
                      <SelectItem key={depot.id} value={depot.id}>
                        {depot.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Composants du produit</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={currentProduitId} onValueChange={setCurrentProduitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {produits.map((produit) => (
                    <SelectItem key={produit.id} value={produit.id}>
                      {produit.nom} - {produit.prixAchat.toFixed(2)}DH (achat)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-28">
              <Input
                type="number"
                min="1"
                value={currentQuantite}
                onChange={(e) => setCurrentQuantite(parseInt(e.target.value) || 1)}
                placeholder="Qté"
              />
            </div>
            
            <Button type="button" onClick={handleAddComposant}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          
          {errorMessage && (
            <p className="text-sm font-medium text-destructive">{errorMessage}</p>
          )}
          
          <div className="space-y-2">
            {composants.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Aucun composant ajouté</p>
                </CardContent>
              </Card>
            ) : (
              composants.map((comp, index) => {
                const produit = getProduitDetails(comp.produitId);
                return (
                  <Card key={index}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{produit?.nom || 'Produit inconnu'}</p>
                        <p className="text-sm text-muted-foreground">
                          {comp.quantite} x {produit?.prixAchat.toFixed(2) || '0.00'}DH = 
                          {' '}{((produit?.prixAchat || 0) * comp.quantite).toFixed(2)}DH
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => handleRemoveComposant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {composants.length > 0 && (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Prix d'achat total</span>
                <span className="font-bold">{calculerPrixAchat().toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Prix de vente suggéré</span>
                <span className="font-bold">{calculerPrixVenteSuggere().toFixed(2)} DH</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="usePrixManuel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="use-prix-manuel">Définir un prix de vente manuel</Label>
                  </FormItem>
                )}
              />
            </div>

            {form.watch('usePrixManuel') && (
              <FormField
                control={form.control}
                name="prixVenteManuel"
                rules={{
                  min: {
                    value: 0,
                    message: 'Le prix ne peut pas être négatif'
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix de vente (DH)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">Créer le produit composé</Button>
        </div>
      </form>
    </Form>
  );
};

export default ComposeProductForm;
