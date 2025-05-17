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
import ComputerSpecsForm from './ComputerSpecsForm';
import { ComputerSpecs, LAPTOP_CATEGORY_ID, DESKTOP_CATEGORY_ID } from '@/data/computer-specs';
import { createComputerCategories } from '@/scripts/create-computer-categories';

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
  specs?: ComputerSpecs;
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialValues?.categorieId || '');
  const [isComputerCategory, setIsComputerCategory] = useState<boolean>(false);
  
  // Assurer que les catégories d'ordinateurs existent
  useEffect(() => {
    createComputerCategories();
  }, []);
  
  const form = useForm<FormValues>({
    defaultValues: initialValues 
      ? { 
          ...initialValues,
          // Convertir chaîne vide en 'none' pour teamMemberId
          teamMemberId: initialValues.teamMemberId || 'none',
          // Extraire les specs si elles existent dans la description au format JSON
          specs: initialValues.description?.includes('{') 
            ? JSON.parse(initialValues.description.substring(initialValues.description.indexOf('{')))
            : undefined
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

  // Surveiller les changements de catégorie pour afficher les champs d'ordinateur si nécessaire
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'categorieId') {
        const categoryId = value.categorieId as string;
        setSelectedCategoryId(categoryId);
        setIsComputerCategory(
          categoryId === LAPTOP_CATEGORY_ID || 
          categoryId === DESKTOP_CATEGORY_ID
        );
      }
    });
    
    // Vérifier si la catégorie initiale est une catégorie d'ordinateur
    const initCategoryId = initialValues?.categorieId;
    if (initCategoryId) {
      setIsComputerCategory(
        initCategoryId === LAPTOP_CATEGORY_ID || 
        initCategoryId === DESKTOP_CATEGORY_ID
      );
    }
    
    return () => subscription.unsubscribe();
  }, [form, initialValues]);

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
    
    // Modifier la description pour inclure les specs d'ordinateur si nécessaire
    let description = values.description || '';
    if (isComputerCategory && values.specs) {
      // Ajouter les specs au format JSON à la fin de la description
      if (description) description += '\n\n';
      description += JSON.stringify(values.specs, null, 2);
    }
    
    onSubmit({
      ...values,
      description,
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
          name="categorieId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  setSelectedCategoryId(value);
                  setIsComputerCategory(
                    value === LAPTOP_CATEGORY_ID || 
                    value === DESKTOP_CATEGORY_ID
                  );
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nom}</SelectItem>
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
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un dépôt" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>{depot.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  step="1" 
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {teamMembers.length > 0 && (
          <FormField
            control={form.control}
            name="teamMemberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigné à</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre de l'équipe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Non assigné</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.nom} {member.prenom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Description générale du produit */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea 
                  {...field} 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                  placeholder="Description du produit"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Afficher les champs spécifiques aux ordinateurs si une catégorie d'ordinateur est sélectionnée */}
        {isComputerCategory && (
          <ComputerSpecsForm
            form={form}
            defaultValues={initialValues?.description?.includes('{') 
              ? JSON.parse(initialValues.description.substring(initialValues.description.indexOf('{')))
              : undefined
            }
          />
        )}

        <div className="space-y-4">
          <FormLabel>Image du produit</FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  id="productImage"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('productImage')?.click()}
                  >
                    Sélectionner une image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Prendre une photo
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-1">
              <div className="aspect-square rounded-md overflow-hidden border flex items-center justify-center bg-muted">
                {imagePreview ? (
                  <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">Aucune image</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isCameraOpen && (
          <CameraCapture
            onCapture={handleCapturedImage}
            onClose={() => setIsCameraOpen(false)}
          />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléchargement...
              </>
            ) : initialValues ? (
              'Enregistrer les modifications'
            ) : (
              'Ajouter le produit'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProduitFormWithTeam;
