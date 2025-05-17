import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Vente {
  id: string;
  numero_vente: string;
  date_vente: string;
  montant_total: number;
  methode_paiement: string;
  client: {
    nom: string;
    telephone: string;
  };
  articles: {
    produit: {
      nom: string;
      codebarres: string;
    };
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
  }[];
}

export default function VentesPage() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    client: '',
    montantMin: '',
    montantMax: '',
    methodePaiement: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date_vente',
    direction: 'desc'
  });

  useEffect(() => {
    fetchVentes();
  }, [filters, sortConfig]);

  const fetchVentes = async () => {
    try {
      let query = supabase
        .from('ventes')
        .select(`
          *,
          client:clients(nom, telephone),
          articles:articles_vente(
            quantite,
            prix_unitaire,
            prix_total,
            produit:produits(nom, codebarres)
          )
        `);

      // Appliquer les filtres
      if (filters.dateDebut) {
        query = query.gte('date_vente', filters.dateDebut);
      }
      if (filters.dateFin) {
        query = query.lte('date_vente', filters.dateFin);
      }
      if (filters.client) {
        query = query.ilike('client.nom', `%${filters.client}%`);
      }
      if (filters.montantMin) {
        query = query.gte('montant_total', parseFloat(filters.montantMin));
      }
      if (filters.montantMax) {
        query = query.lte('montant_total', parseFloat(filters.montantMax));
      }
      if (filters.methodePaiement) {
        query = query.eq('methode_paiement', filters.methodePaiement);
      }

      // Appliquer le tri
      query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      setVentes(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      toast.error('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const generateTicket = (vente: Vente) => {
    const ticket = `
      TICKET DE CAISSE
      ${vente.numero_vente}
      Date: ${format(new Date(vente.date_vente), 'dd/MM/yyyy HH:mm', { locale: fr })}
      Client: ${vente.client.nom}
      Tél: ${vente.client.telephone}
      
      Articles:
      ${vente.articles.map(article => `
        ${article.produit.nom}
        ${article.quantite} x ${formatCurrency(article.prix_unitaire)} = ${formatCurrency(article.prix_total)}
      `).join('\n')}
      
      Total: ${formatCurrency(vente.montant_total)}
      Paiement: ${vente.methode_paiement}
      
      Merci de votre visite!
    `;

    // Ouvrir une nouvelle fenêtre pour imprimer
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de caisse - ${vente.numero_vente}</title>
            <style>
              body { font-family: monospace; white-space: pre; }
              @media print {
                body { margin: 0; padding: 10px; }
              }
            </style>
          </head>
          <body>${ticket}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateFacture = (vente: Vente) => {
    const facture = `
      FACTURE
      Numéro: ${vente.numero_vente}
      Date: ${format(new Date(vente.date_vente), 'dd/MM/yyyy', { locale: fr })}
      
      Client:
      ${vente.client.nom}
      Tél: ${vente.client.telephone}
      
      Détails:
      ${vente.articles.map(article => `
        ${article.produit.nom}
        ${article.quantite} x ${formatCurrency(article.prix_unitaire)} = ${formatCurrency(article.prix_total)}
      `).join('\n')}
      
      Total: ${formatCurrency(vente.montant_total)}
      Paiement: ${vente.methode_paiement}
      
      Merci de votre confiance!
    `;

    // Ouvrir une nouvelle fenêtre pour imprimer
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Facture - ${vente.numero_vente}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print {
                body { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>${facture}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Ventes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date début</label>
              <Input
                type="date"
                value={filters.dateDebut}
                onChange={(e) => setFilters(prev => ({ ...prev, dateDebut: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date fin</label>
              <Input
                type="date"
                value={filters.dateFin}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFin: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <Input
                placeholder="Rechercher un client..."
                value={filters.client}
                onChange={(e) => setFilters(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant min</label>
              <Input
                type="number"
                placeholder="Montant minimum"
                value={filters.montantMin}
                onChange={(e) => setFilters(prev => ({ ...prev, montantMin: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant max</label>
              <Input
                type="number"
                placeholder="Montant maximum"
                value={filters.montantMax}
                onChange={(e) => setFilters(prev => ({ ...prev, montantMax: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Méthode de paiement</label>
              <Select
                value={filters.methodePaiement}
                onValueChange={(value) => setFilters(prev => ({ ...prev, methodePaiement: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les méthodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les méthodes</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="card">Carte</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('numero_vente')}
                >
                  N° Vente {sortConfig.key === 'numero_vente' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('date_vente')}
                >
                  Date {sortConfig.key === 'date_vente' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('montant_total')}
                >
                  Montant {sortConfig.key === 'montant_total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventes.map((vente) => (
                <TableRow key={vente.id}>
                  <TableCell>{vente.numero_vente}</TableCell>
                  <TableCell>
                    {format(new Date(vente.date_vente), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div>{vente.client.nom}</div>
                    <div className="text-sm text-gray-500">{vente.client.telephone}</div>
                  </TableCell>
                  <TableCell>{formatCurrency(vente.montant_total)}</TableCell>
                  <TableCell>{vente.methode_paiement}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => generateTicket(vente)}
                      >
                        Ticket
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateFacture(vente)}
                      >
                        Facture
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 