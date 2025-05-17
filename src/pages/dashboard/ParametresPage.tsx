import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus, Building, Tag, Moon, Sun, Palette, Upload, Image, User, BriefcaseBusiness, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Depot, Category, getDepots, getCategories, createDepot, createCategory, updateDepot, updateCategory, deleteDepot, deleteCategory } from '@/services/supabase/parametres';
import { supabase } from '@/lib/supabase';

const ParametresPage = () => {
  // État pour les dépôts
  const [depots, setDepots] = useState<Depot[]>([]);
  const [newDepotNom, setNewDepotNom] = useState('');
  const [newDepotAdresse, setNewDepotAdresse] = useState('');
  const [editDepotId, setEditDepotId] = useState<string | null>(null);
  const [editDepotNom, setEditDepotNom] = useState('');
  const [editDepotAdresse, setEditDepotAdresse] = useState('');
  
  // État pour les catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategorie, setNewCategorie] = useState('');
  const [editCategorieId, setEditCategorieId] = useState<string | null>(null);
  const [editCategorieNom, setEditCategorieNom] = useState('');
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'categorie' | 'depot', id: string } | null>(null);
  
  // État pour le chargement
  const [isLoading, setIsLoading] = useState({
    depots: false,
    categories: false,
    addDepot: false,
    addCategorie: false,
    editDepot: false,
    editCategorie: false,
    deleteItem: false,
    updateLogo: false,
    updateBusinessName: false
  });
  
  // Contexte du thème
  const { theme, accentColor, logo, businessName, setTheme, setAccentColor, setLogo, setBusinessName, isLoading: themeLoading } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [logoPreview, setLogoPreview] = useState<string | null>(logo);
  const [newBusinessName, setNewBusinessName] = useState(businessName);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Vérifier l'utilisateur actuel
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    
    checkUser();
  }, []);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(prev => ({ ...prev, depots: true, categories: true }));
      
      try {
        const depotsData = await getDepots();
        const categoriesData = await getCategories();
        
        setDepots(depotsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(prev => ({ ...prev, depots: false, categories: false }));
      }
    };
    
    loadData();
  }, []);
  
  // Mise à jour de l'aperçu du logo lorsque le logo change
  useEffect(() => {
    setLogoPreview(logo);
  }, [logo]);
  
  // Mise à jour du nom de l'entreprise lorsqu'il change
  useEffect(() => {
    setNewBusinessName(businessName);
  }, [businessName]);

  // Gestion des dépôts
  const handleAddDepot = async () => {
    console.log("handleAddDepot called with:", { newDepotNom, newDepotAdresse });
    
    if (newDepotNom.trim() && newDepotAdresse.trim()) {
      setIsLoading(prev => ({ ...prev, addDepot: true }));
      
      try {
        console.log("Attempting to create depot...");
        const newDepot = await createDepot({
          nom: newDepotNom.trim(),
          adresse: newDepotAdresse.trim()
        });
        
        console.log("Create depot response:", newDepot);
        
        if (newDepot) {
          setDepots(prev => [...prev, newDepot]);
          setNewDepotNom('');
          setNewDepotAdresse('');
          toast.success("Dépôt ajouté avec succès");
        } else {
          toast.error("Erreur lors de l'ajout du dépôt");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du dépôt:", error);
        toast.error("Erreur lors de l'ajout du dépôt");
      } finally {
        setIsLoading(prev => ({ ...prev, addDepot: false }));
      }
    } else {
      console.log("Validation failed - empty fields");
      toast.error("Veuillez remplir tous les champs");
    }
  };

  const openEditDepotDialog = (depot: Depot) => {
    setEditDepotId(depot.id);
    setEditDepotNom(depot.nom);
    setEditDepotAdresse(depot.adresse);
  };

  const handleEditDepot = async () => {
    if (editDepotId && editDepotNom.trim() && editDepotAdresse.trim()) {
      setIsLoading(prev => ({ ...prev, editDepot: true }));
      
      try {
        const updatedDepot = await updateDepot(editDepotId, {
          nom: editDepotNom.trim(),
          adresse: editDepotAdresse.trim()
        });
        
        if (updatedDepot) {
          setDepots(prev => prev.map(dep => 
            dep.id === editDepotId ? updatedDepot : dep
          ));
          setEditDepotId(null);
          setEditDepotNom('');
          setEditDepotAdresse('');
          toast.success("Dépôt mis à jour avec succès");
        } else {
          toast.error("Erreur lors de la mise à jour du dépôt");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour du dépôt:", error);
        toast.error("Erreur lors de la mise à jour du dépôt");
      } finally {
        setIsLoading(prev => ({ ...prev, editDepot: false }));
      }
    }
  };

  // Gestion des catégories
  const handleAddCategorie = async () => {
    console.log("handleAddCategorie called with:", { newCategorie });
    
    if (newCategorie.trim()) {
      setIsLoading(prev => ({ ...prev, addCategorie: true }));
      
      try {
        console.log("Attempting to create category...");
        const newCat = await createCategory({
          nom: newCategorie.trim()
        });
        
        console.log("Create category response:", newCat);
        
        if (newCat) {
          setCategories(prev => [...prev, newCat]);
          setNewCategorie('');
          toast.success("Catégorie ajoutée avec succès");
        } else {
          toast.error("Erreur lors de l'ajout de la catégorie");
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de la catégorie:", error);
        toast.error("Erreur lors de l'ajout de la catégorie");
      } finally {
        setIsLoading(prev => ({ ...prev, addCategorie: false }));
      }
    } else {
      console.log("Validation failed - empty field");
      toast.error("Veuillez remplir le nom de la catégorie");
    }
  };

  const openEditCategorieDialog = (categorie: Category) => {
    setEditCategorieId(categorie.id);
    setEditCategorieNom(categorie.nom);
  };

  const handleEditCategorie = async () => {
    if (editCategorieId && editCategorieNom.trim()) {
      setIsLoading(prev => ({ ...prev, editCategorie: true }));
      
      try {
        const updatedCategory = await updateCategory(editCategorieId, {
          nom: editCategorieNom.trim()
        });
        
        if (updatedCategory) {
          setCategories(prev => prev.map(cat => 
            cat.id === editCategorieId ? updatedCategory : cat
          ));
          setEditCategorieId(null);
          setEditCategorieNom('');
          toast.success("Catégorie mise à jour avec succès");
        } else {
          toast.error("Erreur lors de la mise à jour de la catégorie");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie:", error);
        toast.error("Erreur lors de la mise à jour de la catégorie");
      } finally {
        setIsLoading(prev => ({ ...prev, editCategorie: false }));
      }
    }
  };

  // Gestion de la suppression
  const openDeleteDialog = (type: 'categorie' | 'depot', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setIsLoading(prev => ({ ...prev, deleteItem: true }));
    
    try {
      let success = false;
      
      if (itemToDelete.type === 'categorie') {
        success = await deleteCategory(itemToDelete.id);
        if (success) {
          setCategories(prev => prev.filter(cat => cat.id !== itemToDelete.id));
          toast.success("Catégorie supprimée avec succès");
        }
      } else {
        success = await deleteDepot(itemToDelete.id);
        if (success) {
          setDepots(prev => prev.filter(dep => dep.id !== itemToDelete.id));
          toast.success("Dépôt supprimé avec succès");
        }
      }
      
      if (!success) {
        toast.error(`Erreur lors de la suppression de ${itemToDelete.type === 'categorie' ? 'la catégorie' : 'du dépôt'}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(prev => ({ ...prev, deleteItem: false }));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  // Gestion des paramètres de l'application
  const handleThemeChange = (value: boolean) => {
    setTheme(value ? 'dark' : 'light');
    toast.success(`Mode ${value ? 'sombre' : 'clair'} activé`);
  };
  
  const handleAccentColorChange = (color: string) => {
    setAccentColor(color as any);
    toast.success("Couleur d'accent mise à jour");
  };

  const handleBusinessNameChange = async () => {
    if (newBusinessName.trim()) {
      setIsLoading(prev => ({ ...prev, updateBusinessName: true }));
      
      try {
        await setBusinessName(newBusinessName.trim());
        toast.success("Nom de l'entreprise mis à jour");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du nom de l'entreprise:", error);
        toast.error("Erreur lors de la mise à jour du nom de l'entreprise");
      } finally {
        setIsLoading(prev => ({ ...prev, updateBusinessName: false }));
      }
    }
  };
  
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 2MB)");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, updateLogo: true }));
    
    try {
      await setLogo(file);
      toast.success("Logo mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du logo:", error);
      toast.error("Erreur lors de la mise à jour du logo");
    } finally {
      setIsLoading(prev => ({ ...prev, updateLogo: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Configurez les paramètres de votre application</p>
      </div>

      {themeLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Chargement des paramètres...</span>
        </div>
      ) : (
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4">
            <TabsTrigger value="appearance">
              <Palette className="mr-2 h-4 w-4" />
              <span>Apparence</span>
            </TabsTrigger>
            <TabsTrigger value="business">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              <span>Entreprise</span>
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="mr-2 h-4 w-4" />
              <span>Catégories</span>
            </TabsTrigger>
            <TabsTrigger value="depots">
              <Building className="mr-2 h-4 w-4" />
              <span>Dépôts</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Apparence */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation de l'interface</CardTitle>
                <CardDescription>
                  Modifiez l'apparence de votre application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le mode sombre pour l'interface
                    </p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={handleThemeChange}
                  />
                </div>
                
                {/* Couleur d'accent */}
                <div className="space-y-2">
                  <Label>Couleur d'accent</Label>
                  <RadioGroup 
                    value={accentColor}
                    onValueChange={handleAccentColorChange}
                    className="flex flex-wrap gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blue" id="blue" className="sr-only" />
                      <Label
                        htmlFor="blue"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-blue-50 ring-offset-background transition-all hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-blue-500 has-[:checked]:ring-offset-2"
                      >
                        {accentColor === 'blue' && <span className="h-2 w-2 rounded-full bg-blue-50" />}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="green" id="green" className="sr-only" />
                      <Label
                        htmlFor="green"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-500 text-green-50 ring-offset-background transition-all hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-green-500 has-[:checked]:ring-offset-2"
                      >
                        {accentColor === 'green' && <span className="h-2 w-2 rounded-full bg-green-50" />}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="purple" id="purple" className="sr-only" />
                      <Label
                        htmlFor="purple"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-purple-500 text-purple-50 ring-offset-background transition-all hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-purple-500 has-[:checked]:ring-offset-2"
                      >
                        {accentColor === 'purple' && <span className="h-2 w-2 rounded-full bg-purple-50" />}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="orange" id="orange" className="sr-only" />
                      <Label
                        htmlFor="orange"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-orange-50 ring-offset-background transition-all hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-orange-500 has-[:checked]:ring-offset-2"
                      >
                        {accentColor === 'orange' && <span className="h-2 w-2 rounded-full bg-orange-50" />}
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="red" id="red" className="sr-only" />
                      <Label
                        htmlFor="red"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-500 text-red-50 ring-offset-background transition-all hover:scale-110 has-[:checked]:ring-2 has-[:checked]:ring-red-500 has-[:checked]:ring-offset-2"
                      >
                        {accentColor === 'red' && <span className="h-2 w-2 rounded-full bg-red-50" />}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Entreprise */}
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>
                  Personnalisez les informations qui apparaîtront sur vos documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom de l'entreprise */}
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nom de l'entreprise</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="business-name" 
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      placeholder="Nom de votre entreprise"
                    />
                    <Button 
                      onClick={handleBusinessNameChange}
                      disabled={isLoading.updateBusinessName}
                    >
                      {isLoading.updateBusinessName ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Enregistrer
                    </Button>
                  </div>
                </div>
                
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo de l'entreprise</Label>
                  <div className="flex items-center gap-4">
                    <div className="border rounded-md p-2 w-16 h-16 flex items-center justify-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="max-h-full max-w-full object-contain" 
                          onError={() => setLogoPreview(null)}
                        />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading.updateLogo}
                      >
                        {isLoading.updateLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Changer de logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Format recommandé : PNG ou JPG, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet Catégories */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des catégories</CardTitle>
                <CardDescription>
                  Ajoutez, modifiez ou supprimez les catégories de produits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-category">Nouvelle catégorie</Label>
                    <Input
                      id="new-category"
                      placeholder="Nom de la catégorie"
                      value={newCategorie}
                      onChange={e => setNewCategorie(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Catégorie button clicked");
                        handleAddCategorie();
                      }}
                      disabled={isLoading.addCategorie}
                    >
                      {isLoading.addCategorie ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  {isLoading.categories ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2">Chargement des catégories...</span>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <Tag className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucune catégorie n'a été créée</p>
                      <p className="text-sm text-muted-foreground">Ajoutez une catégorie pour commencer</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map(categorie => (
                          <TableRow key={categorie.id}>
                            <TableCell>{categorie.nom}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditCategorieDialog(categorie)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog('categorie', categorie.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet Dépôts */}
          <TabsContent value="depots" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des dépôts</CardTitle>
                <CardDescription>
                  Ajoutez, modifiez ou supprimez les dépôts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-depot-nom">Nom du dépôt</Label>
                    <Input
                      id="new-depot-nom"
                      placeholder="Nom du dépôt"
                      value={newDepotNom}
                      onChange={e => setNewDepotNom(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="new-depot-adresse">Adresse du dépôt</Label>
                    <Input
                      id="new-depot-adresse"
                      placeholder="Adresse du dépôt"
                      value={newDepotAdresse}
                      onChange={e => setNewDepotAdresse(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Dépôt button clicked");
                        handleAddDepot();
                      }}
                      disabled={isLoading.addDepot}
                    >
                      {isLoading.addDepot ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  {isLoading.depots ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2">Chargement des dépôts...</span>
                    </div>
                  ) : depots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <Building className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun dépôt n'a été créé</p>
                      <p className="text-sm text-muted-foreground">Ajoutez un dépôt pour commencer</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {depots.map(depot => (
                          <TableRow key={depot.id}>
                            <TableCell>{depot.nom}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDepotDialog(depot)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog('depot', depot.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Dialog de modification de catégorie */}
      <Dialog
        open={!!editCategorieId}
        onOpenChange={(open) => !open && setEditCategorieId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Nom</Label>
              <Input
                id="edit-category"
                value={editCategorieNom}
                onChange={e => setEditCategorieNom(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={() => handleEditCategorie()}
              disabled={isLoading.editCategorie}
            >
              {isLoading.editCategorie ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de dépôt */}
      <Dialog
        open={!!editDepotId}
        onOpenChange={(open) => !open && setEditDepotId(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le dépôt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-depot-name">Nom</Label>
              <Input
                id="edit-depot-name"
                value={editDepotNom}
                onChange={e => setEditDepotNom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-depot-address">Adresse</Label>
              <Input
                id="edit-depot-address"
                value={editDepotAdresse}
                onChange={e => setEditDepotAdresse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              onClick={() => handleEditDepot()}
              disabled={isLoading.editDepot}
            >
              {isLoading.editDepot ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            {itemToDelete?.type === 'categorie' 
              ? "Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action peut impacter les produits associés."
              : "Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action peut impacter les produits qui y sont stockés."
            }
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => handleDelete()}
              disabled={isLoading.deleteItem}
            >
              {isLoading.deleteItem ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParametresPage;
