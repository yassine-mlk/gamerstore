// Définition de l'interface pour les spécifications d'ordinateur
export interface ComputerSpecs {
  brand: string;
  model: string;
  processor: string;
  graphics: string;
  ram: string;
  storage: string;
  display: string;
  condition: string;
}

// Liste des marques d'ordinateurs courantes
export const computerBrands = [
  'Apple',
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'MSI',
  'Microsoft',
  'Samsung',
  'Toshiba',
  'Alienware',
  'Razer',
  'Gigabyte',
  'Huawei',
  'LG',
  'Autre'
];

// Liste des types de processeurs courants
export const processorTypes = [
  'Intel Core i3',
  'Intel Core i5',
  'Intel Core i7',
  'Intel Core i9',
  'Intel Celeron',
  'Intel Pentium',
  'Intel Xeon',
  'AMD Ryzen 3',
  'AMD Ryzen 5',
  'AMD Ryzen 7',
  'AMD Ryzen 9',
  'Apple M1',
  'Apple M1 Pro',
  'Apple M1 Max',
  'Apple M2',
  'Apple M2 Pro',
  'Apple M2 Max',
  'Apple M3',
  'Apple M3 Pro',
  'Apple M3 Max',
  'Autre'
];

// Liste des options de RAM courantes
export const ramOptions = [
  '4 Go',
  '8 Go',
  '16 Go',
  '32 Go',
  '64 Go',
  '128 Go',
  'Autre'
];

// Liste des options de stockage courantes
export const storageOptions = [
  '128 Go SSD',
  '256 Go SSD',
  '512 Go SSD',
  '1 To SSD',
  '2 To SSD',
  '500 Go HDD',
  '1 To HDD',
  '2 To HDD',
  'Autre'
];

// Liste des cartes graphiques courantes
export const graphicsOptions = [
  'Intel Integrated',
  'Intel UHD',
  'Intel Iris Xe',
  'AMD Radeon Integrated',
  'AMD Radeon',
  'NVIDIA GeForce GTX',
  'NVIDIA GeForce RTX',
  'Apple Integrated',
  'Autre'
];

// Liste des états de condition
export const conditionOptions = [
  'Neuf',
  'Comme neuf',
  'Très bon état',
  'Bon état',
  'État acceptable',
  'Pour pièces détachées'
];

// Identifiants des catégories prédéfinies pour les ordinateurs
export const LAPTOP_CATEGORY_ID = 'laptop-category';
export const DESKTOP_CATEGORY_ID = 'desktop-category'; 