import { Categorie, Depot, Produit } from '@/pages/dashboard/StockPage';

export const categoriesData: Categorie[] = [
  {
    id: 'cat-1',
    nom: 'Électronique'
  },
  {
    id: 'cat-2',
    nom: 'Vêtements'
  },
  {
    id: 'cat-3',
    nom: 'Alimentation'
  },
  {
    id: 'cat-4',
    nom: 'Maison'
  }
];

export const depotsData: Depot[] = [
  {
    id: 'dep-1',
    nom: 'Dépôt Central',
    adresse: '123 Rue Principale, 75001 Paris'
  },
  {
    id: 'dep-2',
    nom: 'Entrepôt Nord',
    adresse: '45 Avenue du Commerce, 59000 Lille'
  },
  {
    id: 'dep-3',
    nom: 'Entrepôt Sud',
    adresse: '78 Boulevard Maritime, 13001 Marseille'
  }
];

export const produitsData: Produit[] = [
  {
    id: 'prod-1',
    nom: 'Smartphone XYZ',
    description: 'Smartphone haut de gamme avec écran OLED',
    reference: 'SMT-2023-001',
    codeBarres: '6110000000017',
    prixAchat: 350,
    prixVente: 599,
    quantite: 25,
    categorieId: 'cat-1',
    depotId: 'dep-1',
    teamMemberId: 'team-1',
    image: 'https://source.unsplash.com/random/400x300/?smartphone'
  },
  {
    id: 'prod-2',
    nom: 'Laptop Pro',
    description: 'Ordinateur portable pour professionnels',
    reference: 'LAP-2023-002',
    codeBarres: '6110000000024',
    prixAchat: 650,
    prixVente: 1299,
    quantite: 12,
    categorieId: 'cat-1',
    depotId: 'dep-1',
    teamMemberId: 'team-2',
    image: 'https://source.unsplash.com/random/400x300/?laptop'
  },
  {
    id: 'prod-3',
    nom: 'Écouteurs sans fil',
    description: 'Écouteurs Bluetooth avec réduction de bruit',
    reference: 'ECO-2023-003',
    codeBarres: '6110000000031',
    prixAchat: 45,
    prixVente: 89.99,
    quantite: 30,
    categorieId: 'cat-1',
    depotId: 'dep-2',
    teamMemberId: 'team-1',
    image: 'https://source.unsplash.com/random/400x300/?headphones'
  },
  {
    id: 'prod-4',
    nom: 'T-shirt coton bio',
    description: 'T-shirt en coton biologique',
    reference: 'VET-2023-004',
    codeBarres: '6110000000048',
    prixAchat: 8,
    prixVente: 19.99,
    quantite: 50,
    categorieId: 'cat-2',
    depotId: 'dep-1',
    teamMemberId: 'team-2',
    image: 'https://source.unsplash.com/random/400x300/?tshirt'
  },
  {
    id: 'prod-5',
    nom: 'Pantalon jean',
    description: 'Jean coupe droite',
    reference: 'VET-2023-005',
    codeBarres: '6110000000055',
    prixAchat: 20,
    prixVente: 49.99,
    quantite: 35,
    categorieId: 'cat-2',
    depotId: 'dep-3',
    teamMemberId: 'team-1',
    image: 'https://source.unsplash.com/random/400x300/?jeans'
  },
  {
    id: 'prod-6',
    nom: 'Chocolat noir 85%',
    description: 'Tablette de chocolat noir 85% cacao',
    reference: 'ALI-2023-006',
    codeBarres: '6110000000062',
    prixAchat: 2.5,
    prixVente: 5.99,
    quantite: 100,
    categorieId: 'cat-3',
    depotId: 'dep-2',
    teamMemberId: 'team-2',
    image: 'https://source.unsplash.com/random/400x300/?chocolate'
  },
  {
    id: 'prod-7',
    nom: 'Cafetière italienne',
    description: 'Cafetière italienne en aluminium',
    reference: 'MAI-2023-007',
    codeBarres: '6110000000079',
    prixAchat: 12,
    prixVente: 24.99,
    quantite: 15,
    categorieId: 'cat-4',
    depotId: 'dep-1',
    teamMemberId: 'team-3',
    image: 'https://source.unsplash.com/random/400x300/?coffeepot'
  },
  {
    id: 'prod-8',
    nom: 'Lampe de table LED',
    description: 'Lampe de table avec ampoule LED',
    reference: 'MAI-2023-008',
    codeBarres: '6110000000086',
    prixAchat: 18,
    prixVente: 39.99,
    quantite: 20,
    categorieId: 'cat-4',
    depotId: 'dep-3',
    teamMemberId: 'team-3',
    image: 'https://source.unsplash.com/random/400x300/?lamp'
  }
];
