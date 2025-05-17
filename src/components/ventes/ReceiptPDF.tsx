
import React from 'react';
import { Vente } from '@/pages/dashboard/VentesPage';
import { Client } from '@/pages/dashboard/ClientsPage';
import { useTheme } from '@/contexts/ThemeContext';

interface ReceiptPDFProps {
  vente: Vente;
  client: Client;
  businessName?: string;
  businessLogo?: string;
}

const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ 
  vente, 
  client, 
  businessName: propBusinessName, 
  businessLogo: propBusinessLogo
}) => {
  const { businessName: contextBusinessName, logo: contextLogo } = useTheme();
  
  // Use props if provided, otherwise use context values
  const displayBusinessName = propBusinessName || contextBusinessName;
  const displayLogo = propBusinessLogo || contextLogo;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white p-8 max-w-[80mm] mx-auto text-xs">
      <div className="flex flex-col items-center mb-4">
        {displayLogo ? (
          <img src={displayLogo} alt="Logo" className="h-12 mb-2" />
        ) : (
          <h1 className="text-lg font-bold">{displayBusinessName}</h1>
        )}
        <h2 className="text-sm font-medium">{displayBusinessName}</h2>
      </div>

      <div className="text-center mb-4">
        <p>Ticket de caisse</p>
        <p>Référence: {vente.reference}</p>
        <p>Date: {formatDate(vente.date)}</p>
      </div>

      <div className="mb-4">
        <p>Client: {client.nom}</p>
      </div>

      <div className="mb-4">
        <div className="border-b border-gray-300 mb-2 pb-1 flex justify-between">
          <span className="w-1/2">Article</span>
          <span className="w-1/6 text-right">Qté</span>
          <span className="w-1/4 text-right">Prix</span>
        </div>
        {vente.produits.map((produit, index) => (
          <div key={index} className="flex justify-between text-xs mb-1">
            <span className="w-1/2 truncate">{produit.nom}</span>
            <span className="w-1/6 text-right">{produit.quantite}</span>
            <span className="w-1/4 text-right">{(produit.quantite * produit.prixUnitaire).toFixed(2)} DH</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-2 mb-4">
        <div className="flex justify-between font-bold">
          <span>TOTAL</span>
          <span>{vente.total.toFixed(2)} DH</span>
        </div>
        <div className="flex justify-between text-xs">
          <span>Statut</span>
          <span>{vente.statut}</span>
        </div>
      </div>

      <div className="text-center text-xs mt-6">
        <p>Merci pour votre achat!</p>
        <p>{new Date().getFullYear()} © {displayBusinessName}</p>
      </div>
    </div>
  );
};

export default ReceiptPDF;
