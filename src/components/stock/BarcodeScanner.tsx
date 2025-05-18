import React, { useState } from 'react';
import { Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  defaultValue?: string;
}

/**
 * Composant pour saisir manuellement un code-barres
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, defaultValue = '' }) => {
  const [barcode, setBarcode] = useState<string>(defaultValue);

  // Fonction pour gérer la saisie manuelle
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    // Ne mise à jour le champ dans le formulaire qu'avec la nouvelle valeur
    onBarcodeScanned(value);
  };

  // Interface utilisateur simplifiée
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          Code-barres du produit
        </CardTitle>
        <CardDescription>
          Saisissez le code-barres exact du produit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Code-barres"
            value={barcode}
            onChange={handleManualInput}
            className="flex-1"
          />
          <Button 
            onClick={() => {
              setBarcode('');
              onBarcodeScanned('');
            }} 
            variant="outline"
          >
            Effacer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner; 