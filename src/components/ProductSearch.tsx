import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  codeBarres: string;
  selling_price: number;
  stock_quantity: number;
}

interface ProductSearchProps {
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export function ProductSearch({ onSelect, onClose }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm) {
        setProducts([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Recherche avec le terme:', searchTerm);
        const { data, error } = await supabase
          .from('produits')
          .select('id, nom, codebarres, prixvente, quantite')
          .or(`nom.ilike.%${searchTerm}%,codebarres.eq.${searchTerm}`)
          .limit(10);

        if (error) {
          console.error('Erreur Supabase:', error);
          throw error;
        }

        console.log('Données reçues de Supabase:', data);

        const mappedProducts = data.map(product => ({
          id: product.id,
          name: product.nom,
          codeBarres: product.codebarres,
          selling_price: product.prixvente,
          stock_quantity: product.quantite
        }));

        console.log('Produits mappés:', mappedProducts);
        setProducts(mappedProducts || []);
      } catch (error) {
        console.error('Erreur lors de la recherche des produits:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Rechercher un produit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Rechercher par nom ou code-barres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          {loading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code-barres</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.codeBarres}</TableCell>
                    <TableCell>{formatCurrency(product.selling_price)}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => onSelect(product)}
                      >
                        Sélectionner
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 