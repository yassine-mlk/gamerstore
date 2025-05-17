
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Check, UserPlus, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teamData } from '@/data/team';
import { useToast } from '@/components/ui/use-toast';

// Types for business owners and statistics
interface BusinessOwner {
  id: string;
  name: string;
  email: string;
  businessName: string;
  dateCreated: string;
  teamSize: number;
  salesCount: number;
}

// Mock data for business owners
const businessOwnersData: BusinessOwner[] = [
  {
    id: 'bo-1',
    name: 'Martin Dupont',
    email: 'martin@example.com',
    businessName: 'Électronique Plus',
    dateCreated: '2023-12-10',
    teamSize: 4,
    salesCount: 156
  },
  {
    id: 'bo-2',
    name: 'Jeanne Dubois',
    email: 'jeanne@example.com',
    businessName: 'Café de Paris',
    dateCreated: '2023-11-22',
    teamSize: 8,
    salesCount: 340
  },
  {
    id: 'bo-3',
    name: 'Pierre Lefevre',
    email: 'pierre@example.com',
    businessName: 'Boulangerie Lefevre',
    dateCreated: '2024-01-15',
    teamSize: 6,
    salesCount: 210
  }
];

// Mock data for platform statistics
const platformStatsData = [
  { month: 'Jan', businesses: 12, users: 45, sales: 450 },
  { month: 'Feb', businesses: 14, users: 52, sales: 520 },
  { month: 'Mar', businesses: 18, users: 68, sales: 780 },
  { month: 'Apr', businesses: 22, users: 82, sales: 890 },
  { month: 'May', businesses: 24, users: 95, sales: 1020 },
];

const chartConfig = {
  businesses: {
    label: "Commerces",
    theme: {
      light: "#8B5CF6",
      dark: "#A78BFA"
    }
  },
  users: {
    label: "Utilisateurs",
    theme: {
      light: "#F97316",
      dark: "#FB923C"
    }
  },
  sales: {
    label: "Ventes",
    theme: {
      light: "#10B981",
      dark: "#34D399"
    }
  }
};

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const [newOwner, setNewOwner] = useState({
    name: '',
    email: '',
    businessName: '',
    password: ''
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateAccount = () => {
    // In a real application, this would call an API
    toast({
      title: "Compte créé",
      description: `Un nouveau compte a été créé pour ${newOwner.name}`,
      duration: 3000,
    });
    
    setDialogOpen(false);
    setNewOwner({
      name: '',
      email: '',
      businessName: '',
      password: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Espace Administrateur</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un compte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Créer un compte propriétaire</DialogTitle>
              <DialogDescription>
                Créez un compte pour un nouveau propriétaire de commerce. Un email leur sera envoyé avec les détails de connexion.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={newOwner.name}
                  onChange={(e) => setNewOwner({...newOwner, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({...newOwner, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business" className="text-right">
                  Commerce
                </Label>
                <Input
                  id="business"
                  value={newOwner.businessName}
                  onChange={(e) => setNewOwner({...newOwner, businessName: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newOwner.password}
                  onChange={(e) => setNewOwner({...newOwner, password: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateAccount}>
                <Check className="mr-2 h-4 w-4" />
                Créer le compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Propriétaires
            </CardTitle>
            <CardDescription>
              Total des propriétaires de commerce
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{businessOwnersData.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Utilisateurs
            </CardTitle>
            <CardDescription>
              Total des utilisateurs de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamData.length + businessOwnersData.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ventes totales
            </CardTitle>
            <CardDescription>
              Nombre total de ventes générées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {businessOwnersData.reduce((acc, owner) => acc + owner.salesCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques de la plateforme</CardTitle>
          <CardDescription>Croissance mensuelle des commerces, utilisateurs et ventes</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="aspect-[2/1] mt-4 w-full">
            <BarChart data={platformStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="businesses" name="Commerces" fill="var(--color-businesses)" />
              <Bar dataKey="users" name="Utilisateurs" fill="var(--color-users)" />
              <Bar dataKey="sales" name="Ventes" fill="var(--color-sales)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Propriétaires de commerces</CardTitle>
          <CardDescription>Liste de tous les propriétaires enregistrés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Commerce</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Équipe</TableHead>
                <TableHead>Ventes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessOwnersData.map(owner => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${owner.name}`} alt={owner.name} />
                        <AvatarFallback>{owner.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p>{owner.name}</p>
                        <p className="text-sm text-muted-foreground">{owner.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{owner.businessName}</TableCell>
                  <TableCell>{new Date(owner.dateCreated).toLocaleDateString()}</TableCell>
                  <TableCell>{owner.teamSize} membres</TableCell>
                  <TableCell>{owner.salesCount} ventes</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">Détails</Button>
                      <Button variant="ghost" size="sm">Supprimer</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline">Voir plus</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminPage;
