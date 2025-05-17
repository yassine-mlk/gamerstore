
import { Promotion } from '@/pages/dashboard/StockPage';
import { addDays } from 'date-fns';

// Fonction pour obtenir la date sous forme de chaîne au format YYYY-MM-DD
const dateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Date de début (aujourd'hui)
const today = new Date();
// Date de fin (dans 30 jours)
const endDate = addDays(today, 30);

export const promotionsData: Promotion[] = [
  {
    id: 'promo-1',
    produitId: 'prod-1',
    type: 'pourcentage',
    valeur: 15,
    dateDebut: dateToString(today),
    dateFin: dateToString(endDate),
    description: 'Promotion de rentrée'
  },
  {
    id: 'promo-2',
    produitId: 'prod-4',
    type: 'montant',
    valeur: 5,
    dateDebut: dateToString(today),
    dateFin: dateToString(addDays(today, 14)),
    description: 'Offre spéciale'
  },
  {
    id: 'promo-3',
    produitId: 'prod-6',
    type: 'bundle',
    valeur: 1,
    dateDebut: dateToString(addDays(today, -7)),
    dateFin: dateToString(addDays(today, -1)),
    description: 'Offre expirée'
  }
];
