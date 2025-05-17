import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Produit } from '@/services/supabase/stock';
import { Category, Depot } from '@/services/supabase/parametres';
import { TeamMember } from '@/services/supabase/team';
import { getTeamMembers } from '@/services/supabase/team';
import BarcodeScanner from './BarcodeScanner';
import { Loader2, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CameraCapture from './CameraCapture';

type ProduitFormWithTeamProps = {
  onSubmit: (data: Omit<Produit, 'id' | 'reference' | 'created_at' | 'updated_at'>) => void;
  initialValues?: Produit;
  categories: Category[];
  depots: Depot[];
  teamMembers?: TeamMember[];
};

type FormValues = {
  nom: string;
  description: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  categorieId: string;
  depotId: string;
  teamMemberId?: string;
  codeBarres?: string;
  image?: string;
};

const ProduitFormWithTeam = ({ 
  initialValues, 
  onSubmit, 
  categories, 
  depots, 
  teamMembers = [] 
}: ProduitFormWithTeamProps) => {
  const [scannedBarcode, setScannedBarcode] = useState<string>(initialValues?.codeBarres || '');
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.image || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const form = useForm<Omit<Produit, 'id' | 'reference' | 'created_at' | 'updated_at'>>({
    defaultValues: initialValues 
      ? { 
          ...initialValues,
          // Convertir chaîne vide en 'none' pour teamMemberId
          teamMemberId: initialValues.teamMemberId || 'none'
        } 
      : {
          nom: '',
          description: '',
          categorieId: '',
          depotId: '',
          quantite: 0,
          prixAchat: 0,
          prixVente: 0,
          teamMemberId: 'none',
          codeBarres: ''
        }
  });

  useEffect(() => {
    // Mettre à jour le champ codeBarres lorsque le code-barres scanné change
    if (scannedBarcode) {
      form.setValue('codeBarres', scannedBarcode);
    }
  }, [scannedBarcode, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapturedImage = (file: File) => {
    setImageFile(file);
    
    // Créer un aperçu de l'image capturée
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return initialValues?.image;
    
    setUploading(true);
    try {
      // Créer un nom de fichier unique
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Télécharger l'image vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('produits-images')
        .upload(filePath, imageFile);
      
      if (error) throw error;
      
      // Construire l'URL publique de l'image
      const { data: { publicUrl } } = supabase.storage
        .from('produits-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    const imageUrl = await uploadImage();
    
    onSubmit({
      ...values,
      teamMemberId: values.teamMemberId === 'none' ? '' : values.teamMemberId,
      codeBarres: values.codeBarres || scannedBarcode || '',
      image: imageUrl
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Intégration du scanner de code-barres */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="codeBarres"
            render={({ field }) => (
              <FormItem>
                <BarcodeScanner 
                  onBarcodeScanned={(barcode) => {
                    // Mettre à jour le champ sans soumettre le formulaire
                    field.onChange(barcode);
                    setScannedBarcode(barcode);
                    
                    // Empêcher le comportement qui pourrait déclencher une soumission de formulaire
                    // en utilisant setTimeout pour sortir du cycle d'événements actuels
                    setTimeout(() => {
                      // Optionnel: focus sur le champ suivant après scan pour guider l'utilisateur
                      const nextField = document.querySelector('input[name="nom"]');
                      if (nextField instanceof HTMLElement) {
                        nextField.focus();
                      }
                    }, 0);
                  }} 
                  defaultValue={field.value}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nom du produit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prixAchat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix d'achat (DH)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prixVente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix de vente (DH)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Description du produit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categorieId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
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
            name="depotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dépôt</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
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

        <FormField
          control={form.control}
          name="quantite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité en stock</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="0" 
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamMemberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Membre de l'équipe assigné</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Assigné à" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {teamMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.nom} {member.prenom} ({member.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image du produit */}
        <div className="space-y-2">
          <Label htmlFor="image">Image du produit</Label>
          <div className="flex flex-col gap-4">
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Aperçu" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCameraOpen(true)}
                disabled={uploading}
              >
                <Camera className="mr-2 h-4 w-4" />
                Prendre une photo
              </Button>
            </div>
            {uploading && <p className="text-sm text-muted-foreground">Téléchargement en cours...</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={uploading}>
            {initialValues ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </div>
      </form>

      {/* Composant de capture photo modal */}
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCapturedImage}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </Form>
  );
};

export default ProduitFormWithTeam;
