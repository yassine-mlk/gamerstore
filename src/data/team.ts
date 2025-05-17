
export interface TeamMember {
  id: string;
  nom: string;
  email: string;
  role: string;
  avatar: string;
  dateEmbauche: string;
  produits: string[]; // IDs of assigned products
}

export const teamData: TeamMember[] = [
  {
    id: "team-1",
    nom: "Léa Martin",
    email: "lea@bizzmax.com",
    role: "Vendeur",
    avatar: "https://i.pravatar.cc/150?img=1",
    dateEmbauche: "2023-01-15",
    produits: ["prod-1", "prod-3", "prod-5"]
  },
  {
    id: "team-2",
    nom: "Thomas Dubois",
    email: "thomas@bizzmax.com",
    role: "Responsable Inventaire",
    avatar: "https://i.pravatar.cc/150?img=2",
    dateEmbauche: "2022-06-10",
    produits: ["prod-2", "prod-4", "prod-6"]
  },
  {
    id: "team-3",
    nom: "Sophie Bernard",
    email: "sophie@bizzmax.com",
    role: "Service Client",
    avatar: "https://i.pravatar.cc/150?img=3",
    dateEmbauche: "2022-11-05",
    produits: ["prod-7", "prod-8"]
  }
];
