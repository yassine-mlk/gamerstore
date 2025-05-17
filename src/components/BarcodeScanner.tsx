import React, { useEffect, useRef } from 'react';
import Quagga from 'quagga';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scannerRef.current) return;

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          facingMode: 'environment'
        },
      },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'code_128_reader', 'code_39_reader', 'upc_reader']
      }
    }, (err) => {
      if (err) {
        console.error('Erreur lors de l\'initialisation du scanner:', err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      if (result.codeResult.code) {
        onScan(result.codeResult.code);
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [onScan]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scanner de code-barres</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <div ref={scannerRef} className="w-full h-[300px]" />
          <div className="absolute inset-0 border-2 border-dashed border-primary pointer-events-none" />
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 