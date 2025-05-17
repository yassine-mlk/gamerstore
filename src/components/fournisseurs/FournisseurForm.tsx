import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

type FournisseurFormProps = {
  onSubmit: (data: FournisseurFormValues) => void;
  initialValues?: FournisseurFormValues;
  isLoading?: boolean;
};

export type FournisseurFormValues = {
  nom: string;
  prenom: string;
  societe: string;
  telephone: string;
};

const FournisseurForm = ({ onSubmit, initialValues, isLoading = false }: FournisseurFormProps) => {
  const form = useForm<FournisseurFormValues>({
    defaultValues: initialValues || {
      nom: '',
      prenom: '',
      societe: '',
      telephone: '',
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="societe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la société</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la société" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input placeholder="Numéro de téléphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialValues ? 'Mise à jour...' : 'Ajout...'}
              </>
            ) : (
              initialValues ? 'Mettre à jour' : 'Ajouter'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FournisseurForm;
