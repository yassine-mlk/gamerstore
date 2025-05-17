import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { ProductSearch } from '@/components/ProductSearch';
import { CustomerSearch } from '@/components/CustomerSearch';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CartItem {
  id: string;
  produit_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

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

export default function SalesPage() {
  // États pour la nouvelle vente
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // États pour la gestion des ventes
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchVentes();
  }, [filters, sortConfig]);

  // Fonctions pour la nouvelle vente
  const addToCart = async (product: any) => {
    const existingItem = cart.find(item => item.produit_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.produit_id === product.id
          ? { ...item, quantite: item.quantite + 1, prix_total: (item.quantite + 1) * item.prix_unitaire }
          : item
      ));
    } else {
      setCart([...cart, {
        id: crypto.randomUUID(),
        produit_id: product.id,
        nom: product.name,
        quantite: 1,
        prix_unitaire: product.selling_price,
        prix_total: product.selling_price
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(cart.map(item =>
      item.id === itemId
        ? { ...item, quantite: newQuantity, prix_total: newQuantity * item.prix_unitaire }
        : item
    ));
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const { data: product, error } = await supabase
        .from('produits')
        .select('*')
        .eq('codebarres', barcode)
        .single();

      if (error) throw error;
      if (!product) {
        toast.error('Produit non trouvé');
        return;
      }

      addToCart(product);
      setIsScanning(false);
    } catch (error) {
      console.error('Erreur lors de la recherche du produit:', error);
      toast.error('Erreur lors de la recherche du produit');
    }
  };

  const handleManualBarcode = async (barcode: string) => {
    await handleBarcodeScan(barcode);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.prix_total, 0);
  };

  const handleCheckout = async () => {
    if (!customer) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    try {
      // Créer la vente
      const { data: vente, error: venteError } = await supabase
        .from('ventes')
        .insert({
          client_id: customer.id,
          montant_total: calculateTotal(),
          methode_paiement: paymentMethod,
          statut: 'terminee'
        })
        .select()
        .single();

      if (venteError) throw venteError;

      // Ajouter les articles de la vente
      const { error: itemsError } = await supabase
        .from('articles_vente')
        .insert(
          cart.map(item => ({
            vente_id: vente.id,
            produit_id: item.produit_id,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            prix_total: item.prix_total
          }))
        );

      if (itemsError) throw itemsError;

      toast.success('Vente enregistrée avec succès');
      setCart([]);
      setCustomer(null);
      fetchVentes(); // Rafraîchir la liste des ventes
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vente:', error);
      toast.error('Erreur lors de l\'enregistrement de la vente');
    }
  };

  // Fonctions pour la gestion des ventes
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
      <div class="ticket">
        <div class="header">
          <img src="/logo.png" alt="Logo" class="logo" />
          <h1>GamerStore</h1>
          <p>Votre partenaire de confiance</p>
        </div>
        
        <div class="info">
          <h2>TICKET DE CAISSE</h2>
          <p><strong>N°:</strong> ${vente.numero_vente}</p>
          <p><strong>Date:</strong> ${format(new Date(vente.date_vente), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
          <p><strong>Client:</strong> ${vente.client.nom}</p>
          <p><strong>Tél:</strong> ${vente.client.telephone}</p>
        </div>
        
        <div class="articles">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Qté</th>
                <th>Prix U.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${vente.articles.map(article => `
                <tr>
                  <td>${article.produit.nom}</td>
                  <td>${article.quantite}</td>
                  <td>${formatCurrency(article.prix_unitaire)}</td>
                  <td>${formatCurrency(article.prix_total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="total">
          <p><strong>Total:</strong> ${formatCurrency(vente.montant_total)}</p>
          <p><strong>Paiement:</strong> ${vente.methode_paiement}</p>
        </div>
        
        <div class="footer">
          <p>Merci de votre visite!</p>
          <p>GamerStore - Votre satisfaction est notre priorité</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket de caisse - ${vente.numero_vente}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
              }
              .ticket {
                max-width: 80mm;
                margin: 0 auto;
                padding: 10px;
                border: 1px solid #ddd;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .logo {
                max-width: 100px;
                height: auto;
                margin-bottom: 10px;
              }
              .header h1 {
                margin: 0;
                font-size: 18px;
                color: #333;
              }
              .header p {
                margin: 5px 0;
                font-size: 12px;
                color: #666;
              }
              .info {
                margin-bottom: 20px;
                border-bottom: 1px dashed #ddd;
                padding-bottom: 10px;
              }
              .info h2 {
                font-size: 16px;
                margin: 0 0 10px 0;
                text-align: center;
              }
              .info p {
                margin: 5px 0;
                font-size: 12px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 12px;
              }
              th, td {
                text-align: left;
                padding: 4px;
                border-bottom: 1px solid #ddd;
              }
              th {
                font-weight: bold;
                background: #f5f5f5;
              }
              .total {
                margin-top: 20px;
                border-top: 1px dashed #ddd;
                padding-top: 10px;
                text-align: right;
              }
              .total p {
                margin: 5px 0;
                font-size: 12px;
              }
              .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 11px;
                color: #666;
                border-top: 1px dashed #ddd;
                padding-top: 10px;
              }
              @media print {
                body {
                  padding: 0;
                }
                .ticket {
                  border: none;
                }
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
      <div class="facture">
        <div class="header">
          <div class="logo-section">
            <img src="/logo.png" alt="Logo" class="logo" />
            <div class="company-info">
              <h1>GamerStore</h1>
              <p>Votre partenaire de confiance</p>
              <p>123 Rue du Commerce</p>
              <p>75000 Paris, France</p>
              <p>Tél: +33 1 23 45 67 89</p>
              <p>Email: contact@gamerstore.com</p>
            </div>
          </div>
          <div class="facture-info">
            <h2>FACTURE</h2>
            <p><strong>N°:</strong> ${vente.numero_vente}</p>
            <p><strong>Date:</strong> ${format(new Date(vente.date_vente), 'dd/MM/yyyy', { locale: fr })}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Client</h3>
          <p><strong>Nom:</strong> ${vente.client.nom}</p>
          <p><strong>Téléphone:</strong> ${vente.client.telephone}</p>
        </div>

        <div class="articles">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${vente.articles.map(article => `
                <tr>
                  <td>${article.produit.nom}</td>
                  <td>${article.quantite}</td>
                  <td>${formatCurrency(article.prix_unitaire)}</td>
                  <td>${formatCurrency(article.prix_total)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total-label">Total</td>
                <td class="total-value">${formatCurrency(vente.montant_total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="payment-info">
          <p><strong>Méthode de paiement:</strong> ${vente.methode_paiement}</p>
        </div>

        <div class="footer">
          <p>Merci de votre confiance!</p>
          <p>GamerStore - Votre satisfaction est notre priorité</p>
          <p class="legal">Cette facture est un document officiel</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Facture - ${vente.numero_vente}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 40px;
                background: white;
              }
              .facture {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                border: 1px solid #ddd;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
              }
              .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #333;
              }
              .logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
              }
              .logo {
                max-width: 150px;
                height: auto;
              }
              .company-info {
                color: #333;
              }
              .company-info h1 {
                margin: 0;
                font-size: 24px;
                color: #333;
              }
              .company-info p {
                margin: 5px 0;
                font-size: 14px;
                color: #666;
              }
              .facture-info {
                text-align: right;
              }
              .facture-info h2 {
                font-size: 28px;
                margin: 0 0 10px 0;
                color: #333;
              }
              .facture-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .client-info {
                margin-bottom: 30px;
                padding: 20px;
                background: #f9f9f9;
                border-radius: 5px;
              }
              .client-info h3 {
                margin: 0 0 10px 0;
                color: #333;
              }
              .client-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background: #f5f5f5;
                font-weight: bold;
              }
              .total-label {
                text-align: right;
                font-weight: bold;
              }
              .total-value {
                font-weight: bold;
                font-size: 16px;
              }
              .payment-info {
                margin: 20px 0;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 5px;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .footer p {
                margin: 5px 0;
                color: #666;
              }
              .legal {
                font-size: 12px;
                color: #999;
                margin-top: 20px;
              }
              @media print {
                body {
                  padding: 0;
                }
                .facture {
                  border: none;
                  box-shadow: none;
                }
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
      <Tabs defaultValue="nouvelle-vente" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nouvelle-vente">Nouvelle Vente</TabsTrigger>
          <TabsTrigger value="historique">Historique des Ventes</TabsTrigger>
        </TabsList>

        <TabsContent value="nouvelle-vente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Vente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <CustomerSearch onSelect={setCustomer} />
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setIsScanning(true)}>
                      Scanner Code-barres
                    </Button>
                    <Button onClick={() => setIsSearching(true)}>
                      Rechercher Produit
                    </Button>
                    <Input
                      placeholder="Entrer code-barres"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualBarcode(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label>Méthode de paiement</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte</option>
                      <option value="transfer">Virement</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Panier</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nom}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantite - 1)}
                            >
                              -
                            </Button>
                            <span>{item.quantite}</span>
                            <Button
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantite + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(item.prix_unitaire)}</TableCell>
                        <TableCell>{formatCurrency(item.prix_total)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Supprimer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xl font-bold">
                    Total: {formatCurrency(calculateTotal())}
                  </div>
                  <Button onClick={handleCheckout}>
                    Finaliser la vente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historique">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Ventes</CardTitle>
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
                      <SelectItem value="all">Toutes les méthodes</SelectItem>
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
        </TabsContent>
      </Tabs>

      {isScanning && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScanning(false)}
        />
      )}

      {isSearching && (
        <ProductSearch
          onSelect={(product) => {
            addToCart(product);
            setIsSearching(false);
          }}
          onClose={() => setIsSearching(false)}
        />
      )}
    </div>
  );
} 