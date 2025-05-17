import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Category, Depot } from '@/services/supabase/parametres';
import { TeamMember } from '@/services/supabase/team';
import { supabase } from '@/lib/supabase';
import { Loader2, Camera } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import CameraCapture from './CameraCapture';

// Define the Laptop type
export interface Laptop {
  id: string;
  reference: string;
  nom: string;
  brand: string;
  model: string;
  processor: string;
  graphics: string;
  ram: string;
  storage: string;
  display: string;
  condition: string;
  description?: string;
  prixAchat: number;
  prixVente: number;
  quantite: number;
  depotId: string;
  teamMemberId?: string;
  codeBarres?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

// Liste des marques connues de PC portables
const laptopBrands = [
  "Acer", 
  "Apple", 
  "ASUS", 
  "Dell", 
  "Fujitsu", 
  "Gigabyte", 
  "HP", 
  "Huawei", 
  "Lenovo", 
  "LG", 
  "Microsoft", 
  "MSI", 
  "Razer", 
  "Samsung", 
  "Sony", 
  "Toshiba", 
  "Xiaomi"
];

// Liste des processeurs courants
const commonProcessors = [
  "Intel Core i3",
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core i9",
  "Intel Celeron",
  "Intel Pentium",
  "AMD Ryzen 3",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "AMD Ryzen 9",
  "Apple M1",
  "Apple M2",
  "Apple M3"
];

// Liste des cartes graphiques courantes
const commonGraphics = [
  "Intel HD Graphics",
  "Intel UHD Graphics",
  "Intel Iris Xe",
  "AMD Radeon Graphics",
  "NVIDIA GeForce MX450",
  "NVIDIA GeForce GTX 1650",
  "NVIDIA GeForce GTX 1660 Ti",
  "NVIDIA GeForce RTX 3050",
  "NVIDIA GeForce RTX 3060",
  "NVIDIA GeForce RTX 3070",
  "NVIDIA GeForce RTX 3080",
  "NVIDIA GeForce RTX 4050",
  "NVIDIA GeForce RTX 4060",
  "NVIDIA GeForce RTX 4070",
  "NVIDIA GeForce RTX 4080",
  "NVIDIA GeForce RTX 4090",
  "AMD Radeon RX 6600M",
  "AMD Radeon RX 6700M",
  "AMD Radeon RX 6800M",
  "Apple M1/M2/M3 GPU intégré"
];

// Options de RAM courantes
const ramOptions = [
  "4 Go",
  "8 Go",
  "16 Go",
  "32 Go",
  "64 Go"
];

// Options de stockage courantes
const storageOptions = [
  "128 Go SSD",
  "256 Go SSD",
  "512 Go SSD",
  "1 To SSD",
  "2 To SSD",
  "500 Go HDD",
  "1 To HDD",
  "2 To HDD",
  "128 Go SSD + 1 To HDD",
  "256 Go SSD + 1 To HDD",
  "512 Go SSD + 1 To HDD"
];

// Options d'écran courantes
const displayOptions = [
  "13.3 pouces HD",
  "13.3 pouces FHD",
  "13.3 pouces QHD",
  "14 pouces HD",
  "14 pouces FHD",
  "14 pouces QHD",
  "15.6 pouces HD",
  "15.6 pouces FHD",
  "15.6 pouces QHD",
  "15.6 pouces 4K",
  "16 pouces FHD",
  "16 pouces QHD",
  "16 pouces 4K",
  "17.3 pouces FHD",
  "17.3 pouces QHD",
  "17.3 pouces 4K"
];

type LaptopFormProps = {
  onSubmit: (data: Omit<Laptop, 'id' | 'reference' | 'created_at' | 'updated_at'>) => void;
  initialValues?: Laptop;
  depots: Depot[];
  teamMembers?: TeamMember[];
};

type FormValues = Omit<Laptop, 'id' | 'reference' | 'created_at' | 'updated_at'>;

const LaptopForm = ({ 
  initialValues, 
  onSubmit, 
  depots, 
  teamMembers = [] 
}: LaptopFormProps) => {
  const [scannedBarcode, setScannedBarcode] = useState<string>(initialValues?.codeBarres || '');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.image || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: initialValues 
      ? { 
          ...initialValues,
          teamMemberId: initialValues.teamMemberId || 'none',
          prixAchat: initialValues.prixAchat || 0,
          prixVente: initialValues.prixVente || 0
        } 
      : {
          nom: '',
          brand: '',
          model: '',
          processor: '',
          graphics: '',
          ram: '',
          storage: '',
          display: '',
          condition: 'Neuf',
          description: '',
          depotId: '',
          quantite: 0,
          prixAchat: 0,
          prixVente: 0,
          teamMemberId: 'none',
          codeBarres: ''
        }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create image preview
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
    
    // Create image preview from captured photo
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
      // Create unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload image to Supabase Storage
      const { data, error } = await supabase.storage
        .from('produits-images')
        .upload(filePath, imageFile);
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('produits-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Barcode scanner */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="codeBarres"
            render={({ field }) => (
              <FormItem>
                <BarcodeScanner 
                  onBarcodeScanned={(barcode) => {
                    field.onChange(barcode);
                    setScannedBarcode(barcode);
                    
                    setTimeout(() => {
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

        {/* Laptop specific fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marque</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une marque" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {laptopBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ThinkPad X1, XPS 15, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="processor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Processeur</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un processeur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonProcessors.map(processor => (
                      <SelectItem key={processor} value={processor}>
                        {processor}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="graphics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carte graphique</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une carte graphique" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {commonGraphics.map(graphics => (
                      <SelectItem key={graphics} value={graphics}>
                        {graphics}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RAM</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la RAM" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ramOptions.map(ram => (
                      <SelectItem key={ram} value={ram}>
                        {ram}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="storage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stockage</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le stockage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {storageOptions.map(storage => (
                      <SelectItem key={storage} value={storage}>
                        {storage}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="display"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Écran</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'écran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {displayOptions.map(display => (
                      <SelectItem key={display} value={display}>
                        {display}
                      </SelectItem>
                    ))}
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>État</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner l'état" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Neuf">Neuf</SelectItem>
                    <SelectItem value="Comme neuf">Comme neuf</SelectItem>
                    <SelectItem value="Occasion">Occasion</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        {/* Image upload */}
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

      {/* Camera capture modal */}
      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCapturedImage}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </Form>
  );
};

export default LaptopForm; 