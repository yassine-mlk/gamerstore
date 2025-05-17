
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { CalendarIcon } from 'lucide-react';
import { addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Produit } from '@/pages/dashboard/StockPage';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductPromotionFormProps {
  onSubmit: (data: {
    produitId: string;
    type: 'pourcentage' | 'montant' | 'bundle';
    valeur: number;
    dateDebut: string;
    dateFin: string;
    description?: string;
  }) => void;
  produits: Produit[];
}

type FormValues = {
  produitId: string;
  type: 'pourcentage' | 'montant' | 'bundle';
  valeur: number;
  description?: string;
};

const ProductPromotionForm = ({ onSubmit, produits }: ProductPromotionFormProps) => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date());
  const [dateFin, setDateFin] = useState<Date>(addDays(new Date(), 30));
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      produitId: '',
      type: 'pourcentage',
      valeur: 0,
      description: '',
    }
  });

  const handleProduitChange = (produitId: string) => {
    form.setValue('produitId', produitId);
    const produit = produits.find(p => p.id === produitId) || null;
    setSelectedProduit(produit);
  };

  const handleFinalSubmit = (values: FormValues) => {
    onSubmit({
      produitId: values.produitId,
      type: values.type,
      valeur: values.valeur,
      dateDebut: dateDebut.toISOString().split('T')[0],
      dateFin: dateFin.toISOString().split('T')[0],
      description: values.description
    });
  };

  const getFormattedPromoValue = () => {
    const type = form.watch('type');
    const valeur = form.watch('valeur');
    
    if (!selectedProduit) return '0.00 DH';
    
    if (type === 'pourcentage') {
      const discountAmount = selectedProduit.prixVente * (valeur / 100);
      return (selectedProduit.prixVente - discountAmount).toFixed(2) + ' DH';
    } else if (type === 'montant') {
      return Math.max(0, selectedProduit.prixVente - valeur).toFixed(2) + ' DH';
    } else {
      return selectedProduit.prixVente.toFixed(2) + ' DH + ' + valeur + ' offert(s)';
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="produitId"
          rules={{ required: 'Le produit est obligatoire' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produit</FormLabel>
              <Select onValueChange={handleProduitChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {produits.map((produit) => (
                    <SelectItem key={produit.id} value={produit.id}>
                      {produit.nom} - {produit.prixVente.toFixed(2)} DH
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <FormLabel>Date de début</FormLabel>
            <DatePicker
              date={dateDebut}
              setDate={setDateDebut}
              locale={fr}
              placeholder="Sélectionner une date de début"
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Date de fin</FormLabel>
            <DatePicker
              date={dateFin}
              setDate={setDateFin}
              locale={fr}
              placeholder="Sélectionner une date de fin"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="type"
          rules={{ required: 'Le type est obligatoire' }}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type de promotion</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pourcentage" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Pourcentage de réduction
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="montant" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Montant fixe de réduction
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="bundle" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Bundle (X produits offerts)
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valeur"
          rules={{ 
            required: 'Cette valeur est obligatoire',
            min: { value: 0, message: 'La valeur doit être positive' }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch('type') === 'pourcentage' ? 'Pourcentage de réduction (%)' : 
                 form.watch('type') === 'montant' ? 'Montant de réduction (DH)' : 
                 'Nombre de produits offerts'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step={form.watch('type') === 'pourcentage' ? '0.01' : '1'}
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description de la promotion</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" placeholder="Ex: Offre de rentrée, Soldes d'été..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedProduit && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold">Récapitulatif de la promotion</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Produit</div>
                <div>{selectedProduit.nom}</div>
                
                <div className="text-sm text-muted-foreground">Prix normal</div>
                <div>{selectedProduit.prixVente.toFixed(2)} DH</div>
                
                <div className="text-sm text-muted-foreground">
                  {form.watch('type') === 'pourcentage' ? 'Réduction' : 
                   form.watch('type') === 'montant' ? 'Remise' : 
                   'Offre'}
                </div>
                <div>
                  {form.watch('type') === 'pourcentage' ? form.watch('valeur') + ' %' : 
                   form.watch('type') === 'montant' ? form.watch('valeur') + ' DH' : 
                   form.watch('valeur') + ' produit(s) offert(s)'}
                </div>
                
                <div className="text-sm text-muted-foreground">Prix promotionnel</div>
                <div className="font-bold text-red-600 dark:text-red-400">{getFormattedPromoValue()}</div>
                
                <div className="text-sm text-muted-foreground">Période</div>
                <div>
                  {dateDebut.toLocaleDateString('fr-FR')} au {dateFin.toLocaleDateString('fr-FR')}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">Créer la promotion</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductPromotionForm;
