# Configuration de Supabase pour la gestion des clients

Ce document explique comment configurer Supabase pour la gestion des clients et des achats dans l'application BizzMax Dashboard.

## Étapes de configuration

### 1. Créer un projet Supabase

1. Créez un compte sur [Supabase](https://supabase.com) si vous n'en avez pas déjà un
2. Créez un nouveau projet
3. Notez l'URL de votre projet et la clé anon (anonyme) qui se trouvent dans les paramètres du projet, section API

### 2. Configurer les variables d'environnement

1. Créez un fichier `.env.local` à la racine du projet (s'il n'existe pas déjà)
2. Ajoutez les variables suivantes:

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 3. Créer les tables dans Supabase

Vous pouvez créer les tables nécessaires de deux façons:

#### Option 1: Utiliser l'éditeur SQL de Supabase

1. Accédez à l'éditeur SQL dans votre projet Supabase
2. Copiez et collez le contenu du fichier `supabase_tables_setup.sql` dans l'éditeur
3. Exécutez le script SQL

#### Option 2: Utiliser l'interface utilisateur de Supabase

1. Accédez à la section "Table Editor" dans votre projet Supabase
2. Créez une table `clients` avec les colonnes suivantes:
   - `id` (UUID, PRIMARY KEY)
   - `nom` (TEXT, NOT NULL)
   - `prenom` (TEXT, NOT NULL)
   - `email` (TEXT)
   - `telephone` (TEXT)
   - `ville` (TEXT)
   - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
   - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

3. Créez une table `achats` avec les colonnes suivantes:
   - `id` (UUID, PRIMARY KEY)
   - `client_id` (UUID, REFERENCES clients(id) ON DELETE CASCADE)
   - `date` (DATE, NOT NULL)
   - `produits` (JSONB, NOT NULL)
   - `total` (DECIMAL(10, 2), NOT NULL)
   - `statut` (TEXT, NOT NULL)
   - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
   - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

4. Configurez les politiques de sécurité RLS pour permettre aux utilisateurs authentifiés d'accéder aux tables

### 4. Créer un utilisateur pour les tests

1. Accédez à la section "Authentication" > "Users" dans votre projet Supabase
2. Cliquez sur "Invite user" et entrez une adresse email et un mot de passe
3. Connectez-vous à l'application avec ces identifiants

### 4. Configurer les tables pour la gestion de stock

Pour configurer les tables nécessaires à la gestion de stock, suivez ces étapes:

1. Accédez à l'éditeur SQL dans votre projet Supabase
2. Copiez et collez le contenu du fichier `stock_tables_setup.sql` dans l'éditeur
3. Exécutez le script SQL

Les tables suivantes seront créées:

1. Une table `produits` avec les colonnes suivantes:
   - `id` (UUID, PRIMARY KEY)
   - `nom` (TEXT, NOT NULL)
   - `description` (TEXT)
   - `reference` (TEXT, NOT NULL)
   - `codeBarres` (TEXT)
   - `prixAchat` (DECIMAL(12, 2), NOT NULL)
   - `prixVente` (DECIMAL(12, 2), NOT NULL)
   - `quantite` (INTEGER, NOT NULL, DEFAULT 0)
   - `categorieId` (UUID, REFERENCES categories(id))
   - `depotId` (UUID, REFERENCES depots(id))
   - `teamMemberId` (UUID, REFERENCES team_members(id))
   - `image` (TEXT)
   - `compose` (BOOLEAN, DEFAULT FALSE)
   - `composants` (JSONB)
   - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
   - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

2. Une table `promotions` avec les colonnes suivantes:
   - `id` (UUID, PRIMARY KEY)
   - `produitId` (UUID, REFERENCES produits(id) ON DELETE CASCADE)
   - `type` (TEXT, NOT NULL, CHECK IN ('pourcentage', 'montant', 'bundle'))
   - `valeur` (DECIMAL(12, 2), NOT NULL)
   - `dateDebut` (DATE, NOT NULL)
   - `dateFin` (DATE, NOT NULL)
   - `description` (TEXT)
   - `created_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())
   - `updated_at` (TIMESTAMP WITH TIME ZONE, DEFAULT NOW())

Des politiques de sécurité (RLS) seront configurées pour permettre aux utilisateurs authentifiés d'accéder à ces tables.

## Structure des données

### Clients

```typescript
interface Client {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  created_at?: string;
}
```

### Achats

```typescript
interface Achat {
  id?: string;
  client_id: string;
  date: string;
  produits: {
    id: string;
    nom: string;
    quantite: number;
    prix_unitaire: number;
  }[];
  total: number;
  statut: 'payé' | 'en attente' | 'annulé';
  created_at?: string;
}
```

## Fonctionnalités implémentées

- ✅ Authentification avec Supabase
- ✅ Gestion des clients (ajout, modification, suppression)
- ✅ Affichage des détails des clients
- ✅ Historique des achats par client
- ✅ Recherche de clients 