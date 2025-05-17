
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Package, Truck, FileText } from 'lucide-react';

// Données fictives pour les graphiques
const salesData = [
  { name: 'Jan', total: 1800 },
  { name: 'Fév', total: 2200 },
  { name: 'Mar', total: 2800 },
  { name: 'Avr', total: 2400 },
  { name: 'Mai', total: 3100 },
  { name: 'Juin', total: 2900 },
  { name: 'Juil', total: 3300 },
];

const productsData = [
  { name: 'Produit A', value: 400 },
  { name: 'Produit B', value: 300 },
  { name: 'Produit C', value: 250 },
  { name: 'Produit D', value: 200 },
  { name: 'Produit E', value: 150 },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Aperçu de votre activité</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-muted-foreground">+14 ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">643</div>
            <p className="text-xs text-muted-foreground">+28 nouveaux produits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">3 en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">5 en attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ventes mensuelles</CardTitle>
            <CardDescription>La progression de vos ventes sur les 7 derniers mois</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Produits</CardTitle>
            <CardDescription>Les produits les plus vendus ce mois</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Les dernières opérations effectuées</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-4">
              <li className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Nouvelle commande #1234</p>
                  <p className="text-muted-foreground">Client: Martin Dupont</p>
                </div>
                <p>Il y a 2h</p>
              </li>
              <li className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Stock mis à jour</p>
                  <p className="text-muted-foreground">Produit: Chemise Bleue</p>
                </div>
                <p>Il y a 4h</p>
              </li>
              <li className="flex justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Livraison terminée #5678</p>
                  <p className="text-muted-foreground">Client: Julie Martin</p>
                </div>
                <p>Hier</p>
              </li>
              <li className="flex justify-between">
                <div>
                  <p className="font-medium">Nouveau client</p>
                  <p className="text-muted-foreground">Sophie Bernard</p>
                </div>
                <p>Hier</p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Stocks faibles</CardTitle>
            <CardDescription>Produits à commander</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <p className="font-medium">T-shirt blanc</p>
                <p className="text-red-500">3 restants</p>
              </li>
              <li className="flex justify-between">
                <p className="font-medium">Pantalon noir</p>
                <p className="text-red-500">5 restants</p>
              </li>
              <li className="flex justify-between">
                <p className="font-medium">Veste grise</p>
                <p className="text-red-500">2 restants</p>
              </li>
              <li className="flex justify-between">
                <p className="font-medium">Chaussures cuir</p>
                <p className="text-red-500">4 restants</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
