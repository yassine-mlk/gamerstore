
import { Fournisseur, ProduitFourni } from '@/pages/dashboard/FournisseursPage';

export const fournisseursData: Fournisseur[] = [
  {
    id: "f1",
    nom: "TextilePro",
    contact: "Jean Mercier",
    email: "contact@textilepro.com",
    telephone: "01 23 45 67 89",
    adresse: "78 rue de l'Industrie",
    ville: "Paris",
    codePostal: "75011",
    dateCreation: "2022-05-10"
  },
  {
    id: "f2",
    nom: "ModeFabrics",
    contact: "Claire Dubois",
    email: "c.dubois@modefabrics.com",
    telephone: "02 34 56 78 90",
    adresse: "15 avenue des Tissus",
    ville: "Lyon",
    codePostal: "69002",
    dateCreation: "2022-07-15"
  },
  {
    id: "f3",
    nom: "AccessoiresPlus",
    contact: "Michel Leroux",
    email: "contact@accessoiresplus.com",
    telephone: "03 45 67 89 01",
    adresse: "42 boulevard des Accessoires",
    ville: "Bordeaux",
    codePostal: "33000",
    dateCreation: "2022-09-20"
  },
  {
    id: "f4",
    nom: "ChaussureImport",
    contact: "Sophie Martinet",
    email: "s.martinet@chaussureimport.com",
    telephone: "04 56 78 90 12",
    adresse: "27 rue du Confort",
    ville: "Marseille",
    codePostal: "13006",
    dateCreation: "2022-11-05"
  },
  {
    id: "f5",
    nom: "EmballageEco",
    contact: "Pierre Durand",
    email: "contact@emballageeco.com",
    telephone: "05 67 89 01 23",
    adresse: "8 zone industrielle des Cartons",
    ville: "Nantes",
    codePostal: "44000",
    dateCreation: "2023-01-18"
  }
];

export const produitsFournisData: ProduitFourni[] = [
  {
    id: "pf1",
    fournisseurId: "f1",
    date: "2023-05-12",
    produits: [
      { id: "p1", nom: "T-shirt blanc (lot de 50)", quantite: 2, prixUnitaire: 350.00 },
      { id: "p2", nom: "Jean slim noir (lot de 20)", quantite: 1, prixUnitaire: 600.00 }
    ],
    total: 1300.00,
    statut: "reçu"
  },
  {
    id: "pf2",
    fournisseurId: "f1",
    date: "2023-06-20",
    produits: [
      { id: "p3", nom: "Chemise blanche (lot de 30)", quantite: 1, prixUnitaire: 450.00 },
      { id: "p4", nom: "Pull en laine (lot de 15)", quantite: 2, prixUnitaire: 375.00 }
    ],
    total: 1200.00,
    statut: "reçu"
  },
  {
    id: "pf3",
    fournisseurId: "f2",
    date: "2023-07-05",
    produits: [
      { id: "p5", nom: "Robe d'été fleurie (lot de 25)", quantite: 1, prixUnitaire: 625.00 },
      { id: "p6", nom: "Jupe plissée (lot de 20)", quantite: 1, prixUnitaire: 400.00 }
    ],
    total: 1025.00,
    statut: "reçu"
  },
  {
    id: "pf4",
    fournisseurId: "f3",
    date: "2023-08-10",
    produits: [
      { id: "p7", nom: "Ceinture en cuir (lot de 50)", quantite: 1, prixUnitaire: 700.00 },
      { id: "p8", nom: "Sac à main (lot de 15)", quantite: 1, prixUnitaire: 900.00 }
    ],
    total: 1600.00,
    statut: "en cours"
  },
  {
    id: "pf5",
    fournisseurId: "f4",
    date: "2023-09-01",
    produits: [
      { id: "p9", nom: "Baskets modèle sport (lot de 15)", quantite: 1, prixUnitaire: 750.00 },
      { id: "p10", nom: "Chaussures en cuir (lot de 10)", quantite: 1, prixUnitaire: 800.00 }
    ],
    total: 1550.00,
    statut: "reçu"
  },
  {
    id: "pf6",
    fournisseurId: "f5",
    date: "2023-09-15",
    produits: [
      { id: "p11", nom: "Boîtes d'emballage (lot de 500)", quantite: 1, prixUnitaire: 300.00 },
      { id: "p12", nom: "Sacs papier personnalisés (lot de 1000)", quantite: 1, prixUnitaire: 450.00 }
    ],
    total: 750.00,
    statut: "annulé"
  },
  {
    id: "pf7",
    fournisseurId: "f2",
    date: "2023-10-05",
    produits: [
      { id: "p13", nom: "Veste en jean (lot de 15)", quantite: 1, prixUnitaire: 600.00 }
    ],
    total: 600.00,
    statut: "en cours"
  }
];
