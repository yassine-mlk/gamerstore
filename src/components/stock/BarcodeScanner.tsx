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
        // Génère un code EAN-13 aléatoire valide
        const prefix = "611"; // Préfixe pays (exemple: Maroc)
        const randomPart = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        const codeWithoutChecksum = prefix + randomPart;
        
        // Calcule la somme de contrôle
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          sum += parseInt(codeWithoutChecksum[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checksum = (10 - (sum % 10)) % 10;
        
        // Code-barres complet
        const scannedBarcode = codeWithoutChecksum + checksum;
        
        setBarcode(scannedBarcode);
        onBarcodeScanned(scannedBarcode);
      } else {
        setScanError("Échec de la lecture. Veuillez réessayer ou saisir le code manuellement.");
      }
      
      setIsScanning(false);
    }, 1500);
  };

  // Fonction pour gérer la saisie manuelle
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Limite à 13 chiffres maximum (EAN-13)
    if (/^\d{0,13}$/.test(value)) {
      setBarcode(value);
      
      // Si le code fait exactement 13 chiffres, on considère qu'il est complet
      if (value.length === 13) {
        onBarcodeScanned(value);
      }
    }
  };

  // Fonction pour valider la saisie manuelle
  const validateManualBarcode = () => {
    if (barcode.length === 13 && /^\d{13}$/.test(barcode)) {
      onBarcodeScanned(barcode);
    } else {
      setScanError("Le code-barres doit comporter exactement 13 chiffres.");
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
          Scannez un code-barres avec le scanner ou saisissez-le manuellement
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
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={13}
            placeholder="Code-barres (EAN-13)"
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
              const newBarcode = onBarcodeScanned('');
              setBarcode('');
            }} 
            variant="outline" 
            className="w-full"
          >
            Générer un nouveau code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScanner; 