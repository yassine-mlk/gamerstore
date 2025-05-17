import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Task, createTask, updateTask } from '@/services/supabase/tasks';
import { TeamMember } from '@/services/supabase/team';

// Schema de validation pour le formulaire de tâche
const taskSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  statut: z.enum(['en attente', 'en cours', 'terminée', 'annulée']),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
  date_echeance: z.date().optional().nullable(),
  assignee_id: z.string().min(1, 'Vous devez assigner la tâche à un membre'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  teamMembers: TeamMember[];
  onSuccess: () => void;
}

export function TaskDialog({ 
  open, 
  onOpenChange, 
  task = null, 
  teamMembers,
  onSuccess 
}: TaskDialogProps) {
  const { toast } = useToast();
  const isEditMode = !!task;

  // Configurer le formulaire avec react-hook-form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      titre: task?.titre || '',
      description: task?.description || '',
      statut: (task?.statut as any) || 'en attente',
      priorite: (task?.priorite as any) || 'normale',
      date_echeance: task?.date_echeance ? new Date(task.date_echeance) : null,
      assignee_id: task?.assignee_id || '',
    },
  });

  // Réinitialiser le formulaire quand le dialogue s'ouvre
  React.useEffect(() => {
    if (open) {
      form.reset({
        titre: task?.titre || '',
        description: task?.description || '',
        statut: (task?.statut as any) || 'en attente',
        priorite: (task?.priorite as any) || 'normale',
        date_echeance: task?.date_echeance ? new Date(task.date_echeance) : null,
        assignee_id: task?.assignee_id || '',
      });
    }
  }, [open, task, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (values: TaskFormValues) => {
    try {
      const taskData: Partial<Task> = {
        titre: values.titre,
        description: values.description || null,
        statut: values.statut,
        priorite: values.priorite,
        date_echeance: values.date_echeance ? values.date_echeance.toISOString() : null,
        assignee_id: values.assignee_id,
      };
      
      // Ajouter l'email du membre assigné pour les permissions RLS
      const assignedMember = teamMembers.find(m => m.id === values.assignee_id);
      if (assignedMember) {
        taskData.assignee_email = assignedMember.email;
      }

      let result;
      
      if (isEditMode && task) {
        // Mode édition
        result = await updateTask(task.id, taskData);
        if (result) {
          toast({
            title: 'Succès',
            description: 'La tâche a été mise à jour',
          });
          onOpenChange(false);
          onSuccess();
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de mettre à jour la tâche',
            variant: 'destructive',
          });
        }
      } else {
        // Mode création
        const { success, error } = await createTask(taskData as any);
        if (success) {
          toast({
            title: 'Succès',
            description: 'La tâche a été créée',
          });
          onOpenChange(false);
          onSuccess();
        } else {
          toast({
            title: 'Erreur',
            description: error || 'Impossible de créer la tâche',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier la tâche' : 'Ajouter une nouvelle tâche'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modifiez les détails de la tâche et cliquez sur Enregistrer pour appliquer les changements.'
              : 'Remplissez les détails de la nouvelle tâche et cliquez sur Créer pour l\'ajouter.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la tâche" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée de la tâche" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="priorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="basse">Basse</SelectItem>
                        <SelectItem value="normale">Normale</SelectItem>
                        <SelectItem value="haute">Haute</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
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
                name="date_echeance"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'échéance</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigner à <span className="text-destructive">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un membre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamMembers && teamMembers.length > 0 ? (
                          teamMembers.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.prenom} {member.nom} - {member.role}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_members" disabled>
                            Aucun membre disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {isEditMode ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 