
import React from 'react';
import { Vente } from '@/pages/dashboard/VentesPage';
import { Client } from '@/pages/dashboard/ClientsPage';
import { FileText } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface InvoicePDFProps {
  vente: Vente;
  client: Client;
  businessName?: string;
  businessAddress?: string;
  businessLogo?: string;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  vente, 
  client, 
  businessName: propBusinessName, 
  businessAddress = "123 Rue du Commerce, 75001 Paris",
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
    }).format(date);
  };

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto text-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          {displayLogo ? (
            <img src={displayLogo} alt="Logo" className="h-16 mb-2" />
          ) : (
            <h1 className="text-2xl font-bold">{displayBusinessName}</h1>
          )}
          <h2 className="text-lg font-medium">{displayBusinessName}</h2>
          <p className="text-gray-600">{businessAddress}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold mb-1">FACTURE</h2>
          <p className="font-medium">Facture N°: {vente.reference}</p>
          <p>Date d'émission: {formatDate(vente.date)}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="font-bold mb-2">Facturé à:</h3>
          <p className="font-medium">{client.nom}</p>
          <p>{client.adresse || "Adresse non spécifiée"}</p>
          <p>{client.email}</p>
          {client.telephone && <p>{client.telephone}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-bold mb-2">Statut de paiement:</h3>
          <p className={vente.statut === 'payée' ? 'text-green-600 font-medium' : 
                        vente.statut === 'en attente' ? 'text-amber-600 font-medium' : 
                        'text-red-600 font-medium'}>
            {vente.statut.toUpperCase()}
          </p>
        </div>
      </div>

      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="py-2 text-left">Description</th>
            <th className="py-2 text-right">Quantité</th>
            <th className="py-2 text-right">Prix unitaire</th>
            <th className="py-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {vente.produits.map((produit, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2">{produit.nom}</td>
              <td className="py-2 text-right">{produit.quantite}</td>
              <td className="py-2 text-right">{produit.prixUnitaire.toFixed(2)} DH</td>
              <td className="py-2 text-right">{(produit.quantite * produit.prixUnitaire).toFixed(2)} DH</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">Sous-total:</span>
            <span>{vente.total.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">TVA (20%):</span>
            <span>{(vente.total * 0.2).toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between py-2 font-bold">
            <span>Total:</span>
            <span>{(vente.total * 1.2).toFixed(2)} DH</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-4">
        <h3 className="font-bold mb-2">Conditions et modalités:</h3>
        <p className="mb-2">Le paiement est exigible dans les 30 jours à compter de la date de facturation.</p>
        <p className="text-center mt-4">
          Merci pour votre confiance!
        </p>
      </div>
    </div>
  );
};

export default InvoicePDF;
