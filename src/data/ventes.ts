
import { Vente } from '@/pages/dashboard/VentesPage';

export const ventesData: Vente[] = [
  {
    id: "v1",
    clientId: "c1",
    date: "2023-06-10",
    produits: [
      { id: "prod1", nom: "T-shirt blanc", quantite: 2, prixUnitaire: 19.99 },
      { id: "prod3", nom: "Ceinture en cuir", quantite: 1, prixUnitaire: 29.99 }
    ],
    total: 69.97,
    statut: "payée",
    reference: "VENTE-23-001",
    vendeurId: "team-1"
  },
  {
    id: "v2",
    clientId: "c1",
    date: "2023-07-22",
    produits: [
      { id: "prod2", nom: "Jean slim noir", quantite: 1, prixUnitaire: 49.99 },
      { id: "prod4", nom: "Chaussettes (lot de 3)", quantite: 2, prixUnitaire: 12.99 }
    ],
    total: 75.97,
    statut: "payée",
    reference: "VENTE-23-002",
    vendeurId: "team-2"
  },
  {
    id: "v3",
    clientId: "c2",
    date: "2023-06-15",
    produits: [
      { id: "prod5", nom: "Robe d'été fleurie", quantite: 1, prixUnitaire: 59.99 },
      { id: "prod6", nom: "Sandales en cuir", quantite: 1, prixUnitaire: 45.99 }
    ],
    total: 105.98,
    statut: "payée",
    reference: "VENTE-23-003",
    vendeurId: "team-1"
  },
  {
    id: "v4",
    clientId: "c3",
    date: "2023-07-05",
    produits: [
      { id: "prod7", nom: "Chemise blanche", quantite: 2, prixUnitaire: 39.99 },
      { id: "prod8", nom: "Cravate en soie", quantite: 1, prixUnitaire: 25.99 }
    ],
    total: 105.97,
    statut: "en attente",
    reference: "VENTE-23-004",
    vendeurId: "team-3"
  },
  {
    id: "v5",
    clientId: "c4",
    date: "2023-08-02",
    produits: [
      { id: "prod9", nom: "Veste en jean", quantite: 1, prixUnitaire: 79.99 }
    ],
    total: 79.99,
    statut: "payée",
    reference: "VENTE-23-005",
    vendeurId: "team-2"
  },
  {
    id: "v6",
    clientId: "c5",
    date: "2023-08-10",
    produits: [
      { id: "prod10", nom: "Pull en laine", quantite: 1, prixUnitaire: 69.99 },
      { id: "prod11", nom: "Écharpe assortie", quantite: 1, prixUnitaire: 29.99 }
    ],
    total: 99.98,
    statut: "annulée",
    reference: "VENTE-23-006",
    vendeurId: "team-1"
  },
  {
    id: "v7",
    clientId: "c2",
    date: "2023-08-20",
    produits: [
      { id: "prod12", nom: "Sac à main en cuir", quantite: 1, prixUnitaire: 129.99 }
    ],
    total: 129.99,
    statut: "en attente",
    reference: "VENTE-23-007",
    vendeurId: "team-3"
  }
];
