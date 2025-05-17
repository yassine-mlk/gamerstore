import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ComputerSpecs, computerBrands, processorTypes, graphicsOptions, ramOptions, storageOptions, conditionOptions } from '@/data/computer-specs';

interface ComputerSpecsFormProps {
  form: UseFormReturn<any>;
  defaultValues?: Partial<ComputerSpecs>;
}

const ComputerSpecsForm = ({ form, defaultValues }: ComputerSpecsFormProps) => {
  return (
    <div className="space-y-4 rounded-md border p-4 mt-4">
      <h3 className="text-lg font-medium">Spécifications techniques</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Marque */}
        <FormField
          control={form.control}
          name="specs.brand"
          defaultValue={defaultValues?.brand || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marque</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une marque" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {computerBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Modèle */}
        <FormField
          control={form.control}
          name="specs.model"
          defaultValue={defaultValues?.model || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modèle</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Modèle" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Processeur */}
        <FormField
          control={form.control}
          name="specs.processor"
          defaultValue={defaultValues?.processor || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Processeur</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un processeur" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {processorTypes.map(processor => (
                    <SelectItem key={processor} value={processor}>{processor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Carte graphique */}
        <FormField
          control={form.control}
          name="specs.graphics"
          defaultValue={defaultValues?.graphics || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carte graphique</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une carte graphique" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {graphicsOptions.map(graphics => (
                    <SelectItem key={graphics} value={graphics}>{graphics}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* RAM */}
        <FormField
          control={form.control}
          name="specs.ram"
          defaultValue={defaultValues?.ram || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mémoire RAM</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la RAM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ramOptions.map(ram => (
                    <SelectItem key={ram} value={ram}>{ram}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Stockage */}
        <FormField
          control={form.control}
          name="specs.storage"
          defaultValue={defaultValues?.storage || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stockage</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le stockage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {storageOptions.map(storage => (
                    <SelectItem key={storage} value={storage}>{storage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Écran (spécifique aux portables) */}
        <FormField
          control={form.control}
          name="specs.display"
          defaultValue={defaultValues?.display || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Écran</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Taille et résolution d'écran" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* État */}
        <FormField
          control={form.control}
          name="specs.condition"
          defaultValue={defaultValues?.condition || ''}
          render={({ field }) => (
            <FormItem>
              <FormLabel>État</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conditionOptions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ComputerSpecsForm; 