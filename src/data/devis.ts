
import { Devis } from '@/pages/dashboard/VentesPage';
import { addDays } from 'date-fns';

// Fonction utilitaire pour ajouter des jours à une date
const addDaysToDate = (date: string, days: number): string => {
  const result = addDays(new Date(date), days);
  return result.toISOString().split('T')[0];
};

export const devisData: Devis[] = [
  {
    id: "d1",
    clientId: "c1",
    date: "2023-08-15",
    validite: addDaysToDate("2023-08-15", 30),
    produits: [
      { id: "prod1", nom: "T-shirt blanc", quantite: 5, prixUnitaire: 19.99 },
      { id: "prod3", nom: "Ceinture en cuir", quantite: 2, prixUnitaire: 29.99 }
    ],
    total: 159.93,
    statut: "accepté",
    reference: "DEVIS-23-001",
    vendeurId: "team-1",
    notes: "Le client souhaite une livraison express"
  },
  {
    id: "d2",
    clientId: "c2",
    date: "2023-09-01",
    validite: addDaysToDate("2023-09-01", 30),
    produits: [
      { id: "prod4", nom: "Chaussettes (lot de 3)", quantite: 10, prixUnitaire: 12.99 },
      { id: "prod6", nom: "Sandales en cuir", quantite: 3, prixUnitaire: 45.99 }
    ],
    total: 267.87,
    statut: "en attente",
    reference: "DEVIS-23-002",
    vendeurId: "team-2",
    notes: "Devis pour une boutique partenaire"
  },
  {
    id: "d3",
    clientId: "c3",
    date: "2023-09-10",
    validite: addDaysToDate("2023-09-10", 15),
    produits: [
      { id: "prod9", nom: "Veste en jean", quantite: 2, prixUnitaire: 79.99 }
    ],
    total: 159.98,
    statut: "refusé",
    reference: "DEVIS-23-003",
    vendeurId: "team-1",
    notes: "Le client trouve le prix trop élevé"
  },
  {
    id: "d4",
    clientId: "c5",
    date: "2023-10-05",
    validite: addDaysToDate("2023-10-05", 30),
    produits: [
      { id: "prod7", nom: "Chemise blanche", quantite: 4, prixUnitaire: 39.99 },
      { id: "prod8", nom: "Cravate en soie", quantite: 4, prixUnitaire: 25.99 }
    ],
    total: 263.92,
    statut: "en attente",
    reference: "DEVIS-23-004",
    vendeurId: "team-3",
    notes: "Pour un événement d'entreprise le 15 novembre"
  },
  {
    id: "d5",
    clientId: "c4",
    date: "2023-10-12",
    validite: addDaysToDate("2023-10-12", 60),
    produits: [
      { id: "prod2", nom: "Laptop Pro", quantite: 1, prixUnitaire: 1299 },
      { id: "prod3", nom: "Écouteurs sans fil", quantite: 1, prixUnitaire: 89.99 }
    ],
    total: 1388.99,
    statut: "en attente",
    reference: "DEVIS-23-005",
    vendeurId: "team-2",
    notes: "Devis pour équipement professionnel"
  }
];
