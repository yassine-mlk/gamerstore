import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog';
import { TaskStatusDialog } from '@/components/tasks/TaskStatusDialog';
import { 
  Task, 
  getTasks, 
  getTasksWithUserInfo,
  deleteTask 
} from '@/services/supabase/tasks';
import { TeamMember, getTeamMembers } from '@/services/supabase/team';

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const { toast } = useToast();

  // Charger les tâches et les membres de l'équipe
  const loadData = async () => {
    setIsLoading(true);
    try {
      const tasksData = await getTasksWithUserInfo();
      const membersData = await getTeamMembers();
      
      setTasks(tasksData);
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les tâches selon le terme de recherche
  const filteredTasks = tasks.filter(task =>
    task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.priorite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee_prenom?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer la suppression d'une tâche
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      const success = await deleteTask(selectedTask.id);

      if (success) {
        toast({
          title: 'Succès',
          description: 'La tâche a été supprimée',
        });
        setIsDeleteTaskDialogOpen(false);
        setSelectedTask(null);
        loadData();
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer la tâche',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en attente':
        return 'default';
      case 'en cours':
        return 'secondary';
      case 'terminée':
        return 'success';
      case 'annulée':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Obtenir la couleur du badge selon la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'basse':
        return 'secondary';
      case 'normale':
        return 'default';
      case 'haute':
        return 'warning';
      case 'urgente':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non définie';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des tâches</h1>
        <Button onClick={() => setIsAddTaskDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle tâche
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher une tâche..."
          className="w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des tâches</CardTitle>
          <CardDescription>
            Gérez les tâches assignées à votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Chargement des tâches...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Assigné à</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.titre}</TableCell>
                      <TableCell>
                        {task.assignee_prenom && task.assignee_nom 
                          ? `${task.assignee_prenom} ${task.assignee_nom}`
                          : 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(task.statut) as any}>{task.statut}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(task.priorite) as any}>{task.priorite}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.date_echeance)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Changer statut</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsEditTaskDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDeleteTaskDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Supprimer</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      {searchTerm 
                        ? 'Aucune tâche ne correspond à votre recherche' 
                        : 'Aucune tâche disponible'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Composants de dialogue pour l'ajout, la modification, la suppression et le changement de statut */}
      <TaskDialog 
        open={isAddTaskDialogOpen} 
        onOpenChange={setIsAddTaskDialogOpen}
        teamMembers={teamMembers}
        onSuccess={loadData}
      />

      <TaskDialog 
        open={isEditTaskDialogOpen} 
        onOpenChange={setIsEditTaskDialogOpen}
        teamMembers={teamMembers}
        task={selectedTask}
        onSuccess={loadData}
      />

      <TaskDeleteDialog 
        open={isDeleteTaskDialogOpen}
        onOpenChange={setIsDeleteTaskDialogOpen}
        onConfirm={handleDeleteTask}
        isLoading={isLoading}
      />

      <TaskStatusDialog 
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        task={selectedTask}
        onSuccess={loadData}
      />
    </div>
  );
};

export default TaskPage; 