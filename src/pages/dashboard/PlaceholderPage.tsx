
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PlaceholderPage = () => {
  const location = useLocation();
  
  // Déterminer le titre en fonction de l'URL
  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('clients')) return 'Clients';
    if (path.includes('fournisseurs')) return 'Fournisseurs';
    if (path.includes('stock')) return 'Gestion de Stock';
    if (path.includes('livraisons')) return 'Gestion des Livraisons';
    if (path.includes('factures')) return 'Facturation';
    if (path.includes('parametres')) return 'Paramètres';
    return 'Page';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground">Cette page est en cours de développement.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page en construction</CardTitle>
          <CardDescription>
            Cette section sera bientôt disponible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-8 h-8 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Fonctionnalité à venir</h3>
            <p className="text-muted-foreground">
              Cette section du tableau de bord est en cours de développement et sera disponible dans une prochaine mise à jour.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
