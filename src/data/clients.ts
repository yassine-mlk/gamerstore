
import { Client, Achat } from '@/pages/dashboard/ClientsPage';

export const clientsData: Client[] = [
  {
    id: "c1",
    nom: "Martin Dupont",
    email: "martin.dupont@example.com",
    telephone: "06 12 34 56 78",
    adresse: "15 rue des Lilas",
    ville: "Paris",
    codePostal: "75001",
    dateCreation: "2023-01-15"
  },
  {
    id: "c2",
    nom: "Sophie Laurent",
    email: "sophie.laurent@example.com",
    telephone: "07 23 45 67 89",
    adresse: "8 avenue Victor Hugo",
    ville: "Lyon",
    codePostal: "69002",
    dateCreation: "2023-02-20"
  },
  {
    id: "c3",
    nom: "Thomas Bernard",
    email: "thomas.bernard@example.com",
    telephone: "06 34 56 78 90",
    adresse: "42 boulevard Saint-Michel",
    ville: "Marseille",
    codePostal: "13006",
    dateCreation: "2023-03-10"
  },
  {
    id: "c4",
    nom: "Julie Moreau",
    email: "julie.moreau@example.com",
    telephone: "07 45 67 89 01",
    adresse: "3 place de la République",
    ville: "Bordeaux",
    codePostal: "33000",
    dateCreation: "2023-04-05"
  },
  {
    id: "c5",
    nom: "Nicolas Petit",
    email: "nicolas.petit@example.com",
    telephone: "06 56 78 90 12",
    adresse: "27 rue du Commerce",
    ville: "Nantes",
    codePostal: "44000",
    dateCreation: "2023-05-18"
  }
];

export const achatsData: Achat[] = [
  {
    id: "a1",
    clientId: "c1",
    date: "2023-06-10",
    produits: [
      { id: "p1", nom: "T-shirt blanc", quantite: 2, prixUnitaire: 19.99 },
      { id: "p3", nom: "Ceinture en cuir", quantite: 1, prixUnitaire: 29.99 }
    ],
    total: 69.97,
    statut: "payé"
  },
  {
    id: "a2",
    clientId: "c1",
    date: "2023-07-22",
    produits: [
      { id: "p2", nom: "Jean slim noir", quantite: 1, prixUnitaire: 49.99 },
      { id: "p4", nom: "Chaussettes (lot de 3)", quantite: 2, prixUnitaire: 12.99 }
    ],
    total: 75.97,
    statut: "payé"
  },
  {
    id: "a3",
    clientId: "c2",
    date: "2023-06-15",
    produits: [
      { id: "p5", nom: "Robe d'été fleurie", quantite: 1, prixUnitaire: 59.99 },
      { id: "p6", nom: "Sandales en cuir", quantite: 1, prixUnitaire: 45.99 }
    ],
    total: 105.98,
    statut: "payé"
  },
  {
    id: "a4",
    clientId: "c3",
    date: "2023-07-05",
    produits: [
      { id: "p7", nom: "Chemise blanche", quantite: 2, prixUnitaire: 39.99 },
      { id: "p8", nom: "Cravate en soie", quantite: 1, prixUnitaire: 25.99 }
    ],
    total: 105.97,
    statut: "en attente"
  },
  {
    id: "a5",
    clientId: "c4",
    date: "2023-08-02",
    produits: [
      { id: "p9", nom: "Veste en jean", quantite: 1, prixUnitaire: 79.99 }
    ],
    total: 79.99,
    statut: "payé"
  },
  {
    id: "a6",
    clientId: "c5",
    date: "2023-08-10",
    produits: [
      { id: "p10", nom: "Pull en laine", quantite: 1, prixUnitaire: 69.99 },
      { id: "p11", nom: "Écharpe assortie", quantite: 1, prixUnitaire: 29.99 }
    ],
    total: 99.98,
    statut: "annulé"
  },
  {
    id: "a7",
    clientId: "c2",
    date: "2023-08-20",
    produits: [
      { id: "p12", nom: "Sac à main en cuir", quantite: 1, prixUnitaire: 129.99 }
    ],
    total: 129.99,
    statut: "en attente"
  }
];
