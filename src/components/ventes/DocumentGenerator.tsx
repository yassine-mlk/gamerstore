
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Client } from '@/pages/dashboard/ClientsPage';
import { Vente, Devis } from '@/pages/dashboard/VentesPage';
import { Printer, Download, X } from 'lucide-react';
import './print-styles.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DocumentGeneratorProps {
  vente?: Vente | null;
  devis?: Devis | null;
  client?: Client | null;
  type: 'receipt' | 'invoice' | 'devis';
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  businessName: string;
  businessAddress?: string;
  businessLogo?: string;
}

const DocumentGenerator = ({
  vente,
  devis,
  client,
  type,
  isOpen,
  setIsOpen,
  businessName,
  businessAddress,
  businessLogo
}: DocumentGeneratorProps) => {
  // Use either vente or devis based on the type
  const data = type === 'devis' ? devis : vente;
  
  if (!data || !client) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = document.getElementById('document-to-print')?.innerHTML;
    if (!htmlContent) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === 'receipt' ? 'Ticket' : type === 'invoice' ? 'Facture' : 'Devis'} - ${businessName}</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .logo { max-width: 150px; height: auto; }
            .document-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .info-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .info-col { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">
            {type === 'receipt' && 'Ticket de caisse'}
            {type === 'invoice' && 'Facture'}
            {type === 'devis' && 'Devis'}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div id="document-to-print" className="print-content">
          <div className="flex justify-between items-start">
            <div>
              {businessLogo && (
                <img src={businessLogo} alt={businessName} className="h-12 mb-2" />
              )}
              <div className="text-xl font-bold">{businessName}</div>
              {businessAddress && <div className="text-sm text-gray-500">{businessAddress}</div>}
            </div>
            
            <div className="text-right">
              <div className="font-bold text-xl">
                {type === 'receipt' && 'TICKET DE CAISSE'}
                {type === 'invoice' && 'FACTURE'}
                {type === 'devis' && 'DEVIS'}
              </div>
              <div className="text-sm text-gray-500">
                {type === 'devis' ? devis?.reference : vente?.reference}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Date: {format(new Date(type === 'devis' ? devis?.date || '' : vente?.date || ''), 'dd/MM/yyyy', { locale: fr })}
              </div>
              {type === 'devis' && (
                <div className="text-sm text-gray-500">
                  Valide jusqu'au: {format(new Date(devis?.validite || ''), 'dd/MM/yyyy', { locale: fr })}
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-b py-4">
            <div>
              <div className="text-sm font-semibold mb-1">Client:</div>
              <div>{client.nom}</div>
              {client.adresse && <div className="text-sm">{client.adresse}</div>}
              {client.email && <div className="text-sm">{client.email}</div>}
              {client.telephone && <div className="text-sm">{client.telephone}</div>}
            </div>
            
            {type === 'devis' && devis?.notes && (
              <div>
                <div className="text-sm font-semibold mb-1">Notes:</div>
                <div className="text-sm">{devis.notes}</div>
              </div>
            )}
          </div>
          
          <table className="w-full mt-6">
            <thead>
              <tr className="border-b">
                <th className="text-left">Produit</th>
                <th className="text-right">Quantité</th>
                <th className="text-right">Prix unitaire</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.produits.map((produit, index) => (
                <tr key={index} className="border-b">
                  <td>{produit.nom}</td>
                  <td className="text-right">{produit.quantite}</td>
                  <td className="text-right">{produit.prixUnitaire.toFixed(2)} DH</td>
                  <td className="text-right">{(produit.quantite * produit.prixUnitaire).toFixed(2)} DH</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}></td>
                <td className="text-right font-bold">Total</td>
                <td className="text-right font-bold">{data.total.toFixed(2)} DH</td>
              </tr>
            </tfoot>
          </table>
          
          <div className="mt-8">
            {type === 'invoice' && (
              <div className="text-sm border-t pt-2">
                <div className="font-semibold">Conditions de paiement:</div>
                <p>Payable à réception de la facture.</p>
              </div>
            )}
            
            {type === 'devis' && (
              <div className="text-sm border-t pt-2">
                <div className="font-semibold">Conditions de validité:</div>
                <p>Ce devis est valable jusqu'au {format(new Date(devis?.validite || ''), 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Merci de votre confiance!</p>
            {businessName} - {businessAddress || 'Adresse non spécifiée'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentGenerator;
