import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ProductSearch } from '@/components/ProductSearch';
import { CustomerSearch } from '@/components/CustomerSearch';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuoteItem {
  id: string;
  produit_id: string;
  nom: string;
  quantite: number;
  prix_unitaire: number;
  prix_total: number;
}

interface Quote {
  id: string;
  numero_devis: string;
  client_id: string;
  nom_client: string;
  date_devis: string;
  date_validite: string;
  montant_total: number;
  statut: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [cart, setCart] = useState<QuoteItem[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          clients (
            nom
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotes(data.map((quote: any) => ({
        ...quote,
        nom_client: quote.clients.nom
      })));
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      toast.error('Erreur lors de la récupération des devis');
    }
  };

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

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.prix_total, 0);
  };

  const handleCreateQuote = async () => {
    if (!customer) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    if (!validUntil) {
      toast.error('Veuillez spécifier une date de validité');
      return;
    }

    try {
      // Créer le devis
      const { data: quote, error: quoteError } = await supabase
        .from('devis')
        .insert({
          client_id: customer.id,
          montant_total: calculateTotal(),
          date_validite: validUntil,
          statut: 'en_attente'
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Ajouter les articles du devis
      const { error: itemsError } = await supabase
        .from('articles_devis')
        .insert(
          cart.map(item => ({
            devis_id: quote.id,
            produit_id: item.produit_id,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            prix_total: item.prix_total
          }))
        );

      if (itemsError) throw itemsError;

      toast.success('Devis créé avec succès');
      setCart([]);
      setCustomer(null);
      setValidUntil('');
      fetchQuotes();
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      toast.error('Erreur lors de la création du devis');
    }
  };

  const handleConvertToSale = async (quoteId: string) => {
    try {
      // Récupérer le devis et ses articles
      const { data: quote, error: quoteError } = await supabase
        .from('devis')
        .select(`
          *,
          articles_devis (
            *
          )
        `)
        .eq('id', quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Créer la vente
      const { data: sale, error: saleError } = await supabase
        .from('ventes')
        .insert({
          client_id: quote.client_id,
          montant_total: quote.montant_total,
          methode_paiement: 'en_attente',
          statut: 'terminee'
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Ajouter les articles de la vente
      const { error: itemsError } = await supabase
        .from('articles_vente')
        .insert(
          quote.articles_devis.map((item: any) => ({
            vente_id: sale.id,
            produit_id: item.produit_id,
            quantite: item.quantite,
            prix_unitaire: item.prix_unitaire,
            prix_total: item.prix_total
          }))
        );

      if (itemsError) throw itemsError;

      // Mettre à jour le statut du devis
      const { error: updateError } = await supabase
        .from('devis')
        .update({ statut: 'converti' })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      toast.success('Devis converti en vente avec succès');
      fetchQuotes();
    } catch (error) {
      console.error('Erreur lors de la conversion du devis:', error);
      toast.error('Erreur lors de la conversion du devis');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CustomerSearch onSelect={setCustomer} />
              
              <div className="flex gap-2">
                <Button onClick={() => setIsSearching(true)}>
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-2">
                <label>Validité jusqu'au</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>

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
                <Button onClick={handleCreateQuote}>
                  Créer le devis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des devis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Devis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.numero_devis}</TableCell>
                    <TableCell>{quote.nom_client}</TableCell>
                    <TableCell>
                      {format(new Date(quote.date_devis), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(quote.date_validite), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>{formatCurrency(quote.montant_total)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-sm ${
                        quote.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                        quote.statut === 'converti' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.statut === 'en_attente' ? 'En attente' :
                         quote.statut === 'converti' ? 'Converti' :
                         'Expiré'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {quote.statut === 'en_attente' && (
                        <Button
                          size="sm"
                          onClick={() => handleConvertToSale(quote.id)}
                        >
                          Convertir en vente
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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