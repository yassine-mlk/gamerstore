
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  UserCircle 
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { teamData } from '@/data/team';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

// Sample tasks data
const initialTasks: Task[] = [
  {
    id: 'task1',
    title: 'Réaliser l\'inventaire mensuel',
    description: 'Compter tous les produits dans le dépôt principal',
    assignedTo: 'team-2',
    dueDate: '2025-05-10',
    priority: 'high',
    status: 'in-progress'
  },
  {
    id: 'task2',
    title: 'Contacter les clients inactifs',
    description: 'Appeler les clients qui n\'ont pas commandé depuis 3 mois',
    assignedTo: 'team-3',
    dueDate: '2025-05-15',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'task3',
    title: 'Mettre à jour les fiches produits',
    description: 'Ajouter les nouveaux produits dans le catalogue',
    assignedTo: 'team-1',
    dueDate: '2025-05-08',
    priority: 'low',
    status: 'completed'
  }
];

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'medium',
    status: 'pending'
  });
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Load initial data
  useEffect(() => {
    setTasks(initialTasks);
  }, []);

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignedTo === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  // Get team member name by ID
  const getTeamMemberName = (id: string) => {
    const member = teamData.find(m => m.id === id);
    return member ? member.nom : 'Non assigné';
  };

  // Handle creating a new task
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const task: Task = {
      id: `task${Date.now()}`,
      title: newTask.title || '',
      description: newTask.description || '',
      assignedTo: newTask.assignedTo || '',
      dueDate: newTask.dueDate || '',
      priority: newTask.priority as 'low' | 'medium' | 'high',
      status: newTask.status as 'pending' | 'in-progress' | 'completed'
    };

    setTasks([...tasks, task]);
    toast.success('Tâche créée avec succès');
    setIsNewTaskDialogOpen(false);
    setNewTask({
      priority: 'medium',
      status: 'pending'
    });
  };

  // Handle updating task status
  const handleStatusChange = (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    
    toast.success('Statut mis à jour');
  };

  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Tâche supprimée');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Tâches</h1>
        <p className="text-muted-foreground">Assignez et suivez les tâches de l'équipe</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une tâche..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">À faire</SelectItem>
              <SelectItem value="in-progress">En cours</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrer par assigné" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les membres</SelectItem>
              {teamData.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle tâche
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titre <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={newTask.title || ''}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Titre de la tâche"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Description détaillée"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assignedTo">Assigné à <span className="text-red-500">*</span></Label>
                    <Select 
                      value={newTask.assignedTo} 
                      onValueChange={(value) => setNewTask({...newTask, assignedTo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un membre" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamData.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Date d'échéance <span className="text-red-500">*</span></Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate || ''}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priorité</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value) => setNewTask({...newTask, priority: value as 'low' | 'medium' | 'high'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select 
                      value={newTask.status} 
                      onValueChange={(value) => setNewTask({...newTask, status: value as 'pending' | 'in-progress' | 'completed'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">À faire</SelectItem>
                        <SelectItem value="in-progress">En cours</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTask}>Créer la tâche</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* À faire */}
        <Card>
          <CardHeader className="bg-background dark:bg-card/80 border-b pb-3">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-yellow-500" />
              À faire
              <Badge variant="outline" className="ml-auto">
                {tasks.filter(t => t.status === 'pending').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y">
              {filteredTasks
                .filter(task => task.status === 'pending')
                .map(task => (
                  <div key={task.id} className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium line-clamp-1">{task.title}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(task.id, 'in-progress')}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="sr-only">Marquer en cours</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center mt-3 text-xs text-muted-foreground">
                      <UserCircle className="h-3 w-3 mr-1" />
                      <span>{getTeamMemberName(task.assignedTo)}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={
                          task.priority === 'high'
                            ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }
                      >
                        {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    </div>
                  </div>
                ))}
              {filteredTasks.filter(task => task.status === 'pending').length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Aucune tâche à faire
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* En cours */}
        <Card>
          <CardHeader className="bg-background dark:bg-card/80 border-b pb-3">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              En cours
              <Badge variant="outline" className="ml-auto">
                {tasks.filter(t => t.status === 'in-progress').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y">
              {filteredTasks
                .filter(task => task.status === 'in-progress')
                .map(task => (
                  <div key={task.id} className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium line-clamp-1">{task.title}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="sr-only">Marquer terminé</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center mt-3 text-xs text-muted-foreground">
                      <UserCircle className="h-3 w-3 mr-1" />
                      <span>{getTeamMemberName(task.assignedTo)}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className={
                          task.priority === 'high'
                            ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        }
                      >
                        {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </Badge>
                    </div>
                  </div>
                ))}
              {filteredTasks.filter(task => task.status === 'in-progress').length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Aucune tâche en cours
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terminées */}
        <Card>
          <CardHeader className="bg-background dark:bg-card/80 border-b pb-3">
            <CardTitle className="flex items-center text-lg">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
              Terminées
              <Badge variant="outline" className="ml-auto">
                {tasks.filter(t => t.status === 'completed').length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col divide-y">
              {filteredTasks
                .filter(task => task.status === 'completed')
                .map(task => (
                  <div key={task.id} className="p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium line-clamp-1">{task.title}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center mt-3 text-xs text-muted-foreground">
                      <UserCircle className="h-3 w-3 mr-1" />
                      <span>{getTeamMemberName(task.assignedTo)}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              {filteredTasks.filter(task => task.status === 'completed').length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Aucune tâche terminée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
