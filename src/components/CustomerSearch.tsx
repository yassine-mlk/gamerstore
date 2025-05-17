import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  nom: string;
  email: string;
  telephone: string;
}

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
}

export function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!searchTerm) {
        setCustomers([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .or(`nom.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telephone.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error('Erreur lors de la recherche des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onSelect(customer);
    setShowDialog(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher un client..."
          value={selectedCustomer?.nom || searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowDialog(true)}
        />
        <Button
          variant="outline"
          onClick={() => setShowDialog(true)}
        >
          Rechercher
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Rechercher un client</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.nom}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.telephone}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelect(customer)}
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
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 