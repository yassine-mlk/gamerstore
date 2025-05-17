import React, { useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BarcodeDisplayProps {
  barcode: string;
  productName: string;
  price?: number;
}

/**
 * Composant pour afficher un code-barres EAN-13 imprimable
 * Dans un environnement de production, il faudrait utiliser une vraie librairie de rendu de codes-barres
 */
const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ barcode, productName, price }) => {
  const barcodeRef = useRef<HTMLDivElement>(null);

  // Fonction pour simuler l'impression du code-barres
  const printBarcode = () => {
    if (!barcodeRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour imprimer le code-barres.');
      return;
    }

    // Create content for the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimer Code-Barres: ${productName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .barcode-container {
              display: inline-block;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
              margin: 20px;
            }
            .barcode {
              font-family: 'Libre Barcode EAN13 Text', cursive;
              font-size: 60px;
              line-height: 1.2;
              margin-bottom: 5px;
            }
            .product-info {
              font-size: 12px;
              margin-bottom: 5px;
            }
            .barcode-number {
              font-family: monospace;
              font-size: 12px;
            }
            @media print {
              .barcode-container {
                border: none;
                margin: 0;
                padding: 0;
              }
              @page {
                size: 50mm 30mm;
                margin: 5mm;
              }
            }
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+EAN13+Text&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="barcode-container">
            <div class="product-info">${productName}</div>
            ${price ? `<div class="product-info">${price.toFixed(2)} DH</div>` : ''}
            <div class="barcode">${barcode}</div>
            <div class="barcode-number">${barcode}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  // Fonction pour télécharger le code-barres (dans un environnement réel, on génèrerait une image)
  const downloadBarcode = () => {
    alert('Fonctionnalité de téléchargement non implémentée. Dans un environnement réel, cela génèrerait une image du code-barres.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Code-Barres Produit</CardTitle>
        <CardDescription>
          {productName}
          {price && ` - ${price.toFixed(2)} DH`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={barcodeRef} className="flex flex-col items-center">
          {/* 
            Ceci est juste une représentation visuelle.
            Dans un environnement réel, vous utiliseriez une bibliothèque 
            comme react-barcode ou JsBarcode pour générer le vrai code-barres.
          */}
          <div className="border border-dashed border-gray-300 rounded-md p-4 w-full text-center">
            <div className="text-xs text-gray-500 mb-1">{productName}</div>
            <div className="font-mono text-lg font-bold tracking-wider mb-1">
              {barcode.split('').join(' ')}
            </div>
            <div className="border-t border-b border-black py-3 my-2 flex justify-center">
              {/* Pseudo représentation graphique d'un code-barres */}
              {barcode.split('').map((digit, i) => (
                <div 
                  key={i} 
                  className="inline-block w-1 mx-px" 
                  style={{ 
                    height: `${20 + parseInt(digit) * 2}px`,
                    backgroundColor: 'black'
                  }}
                />
              ))}
            </div>
            <div className="text-xs font-mono">{barcode}</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={printBarcode}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </Button>
        <Button variant="outline" onClick={downloadBarcode}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BarcodeDisplay; 