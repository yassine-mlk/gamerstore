import React, { useState, useEffect } from 'react';
import { Barcode, AlertCircle, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  defaultValue?: string;
}

/**
 * Composant pour scanner ou saisir manuellement un code-barres
 * Dans un environnement réel, ce composant se connecterait à un scanner physique
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, defaultValue = '' }) => {
  const [barcode, setBarcode] = useState<string>(defaultValue);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Fonction pour simuler le scan d'un code-barres
  const simulateScan = () => {
    setIsScanning(true);
    setScanError(null);
    
    // Simule un temps de traitement
    setTimeout(() => {
      // Simule une lecture réussie ou une erreur aléatoirement
      const success = Math.random() > 0.2; // 80% de chance de succès
      
      if (success) {
        // Génère différents formats de codes-barres aléatoirement
        const formats = ['EAN-13', 'EAN-8', 'UPC-A', 'Custom'];
        const selectedFormat = formats[Math.floor(Math.random() * formats.length)];
        
        let scannedBarcode = '';
        
        switch (selectedFormat) {
          case 'EAN-13':
            // Code EAN-13
            const prefix = "611"; // Préfixe pays (exemple: Maroc)
            const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
            const codeWithoutChecksum = prefix + randomPart;
            
            // Calcule la somme de contrôle
            let sum = 0;
            for (let i = 0; i < 12; i++) {
              sum += parseInt(codeWithoutChecksum[i]) * (i % 2 === 0 ? 1 : 3);
            }
            const checksum = (10 - (sum % 10)) % 10;
            
            scannedBarcode = codeWithoutChecksum + checksum;
            break;
          
          case 'EAN-8':
            // Code EAN-8 (8 chiffres)
            scannedBarcode = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
            break;
          
          case 'UPC-A':
            // Code UPC-A (12 chiffres)
            scannedBarcode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
            break;
          
          case 'Custom':
            // Format personnalisé avec lettres et chiffres
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const length = 8 + Math.floor(Math.random() * 8); // Longueur entre 8 et 15
            
            let result = '';
            for (let i = 0; i < length; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            scannedBarcode = result;
            break;
        }
        
        setBarcode(scannedBarcode);
        
        // Utiliser setTimeout pour prévenir toute soumission de formulaire accidentelle
        setTimeout(() => {
          onBarcodeScanned(scannedBarcode);
        }, 0);
      } else {
        setScanError("Échec de la lecture. Veuillez réessayer ou saisir le code manuellement.");
      }
      
      setIsScanning(false);
    }, 1500);
  };

  // Fonction pour gérer la saisie manuelle
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Suppression de la contrainte de format - accepter n'importe quel texte
    setBarcode(value);
    
    // Ne pas transmettre la valeur automatiquement lors de la saisie
    // Cela sera fait uniquement lors de la validation manuelle
  };

  // Fonction pour valider la saisie manuelle
  const validateManualBarcode = () => {
    if (barcode.length > 0) {
      onBarcodeScanned(barcode);
    } else {
      setScanError("Veuillez saisir un code-barres.");
    }
  };

  // Interface utilisateur
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          Scanner un code-barres
        </CardTitle>
        <CardDescription>
          Accepte tout format de code-barres (EAN-13, EAN-8, UPC-A, codes personnalisés, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="Code-barres (tout format)"
            value={barcode}
            onChange={handleManualInput}
            className="flex-1"
          />
          <Button onClick={validateManualBarcode} variant="secondary">
            Valider
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button onClick={simulateScan} disabled={isScanning} variant="outline" className="w-full">
            {isScanning ? (
              <>Scanning<span className="animate-pulse">...</span></>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Scanner
              </>
            )}
          </Button>
          <Button 
            onClick={() => {
              setBarcode('');
              // Utiliser setTimeout pour éviter la soumission accidentelle du formulaire
              setTimeout(() => {
                onBarcodeScanned('');
              }, 0);
            }} 
            variant="outline" 
            className="w-full"
          >
            Effacer le code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner; 