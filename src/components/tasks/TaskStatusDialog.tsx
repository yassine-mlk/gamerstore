import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Task, updateTask } from '@/services/supabase/tasks';

// Schema de validation pour le formulaire de changement de statut
const statusSchema = z.object({
  statut: z.enum(['en attente', 'en cours', 'terminée', 'annulée']),
});

type StatusFormValues = z.infer<typeof statusSchema>;

interface TaskStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSuccess: () => void;
}

export function TaskStatusDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskStatusDialogProps) {
  const { toast } = useToast();
  
  // Configurer le formulaire avec react-hook-form
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      statut: (task?.statut as any) || 'en attente',
    },
  });

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  React.useEffect(() => {
    if (open && task) {
      form.reset({
        statut: (task.statut as any),
      });
    }
  }, [open, task, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (values: StatusFormValues) => {
    if (!task) return;
    
    try {
      const result = await updateTask(task.id, { statut: values.statut });
      
      if (result) {
        toast({
          title: 'Succès',
          description: 'Le statut de la tâche a été mis à jour',
        });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de mettre à jour le statut',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mettre à jour le statut</DialogTitle>
          <DialogDescription>
            Modifier le statut de la tâche "{task.titre}"
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en attente">En attente</SelectItem>
                      <SelectItem value="en cours">En cours</SelectItem>
                      <SelectItem value="terminée">Terminée</SelectItem>
                      <SelectItem value="annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 