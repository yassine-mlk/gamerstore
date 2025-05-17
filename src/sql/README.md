# Instructions pour corriger le problème de colonne dans la table produits

## Problème
Vous rencontrez des erreurs lors de la création d'un produit :
```
Could not find the 'categorieId' column of 'produits' in the schema cache
Could not find the 'codeBarres' column of 'produits' in the schema cache
null value in column "reference" of relation "produits" violates not-null constraint
```

Ces erreurs indiquent que:
1. Le cache de schéma de Supabase n'est pas synchronisé avec la structure réelle de votre base de données
2. Le champ `reference` est obligatoire (NOT NULL) dans votre base de données

## Solution

### Option 1: Utiliser la nouvelle version du code (Recommandée)
Nous avons complètement réécrit la fonction `createProduit` dans `src/services/supabase/stock.ts` pour qu'elle fonctionne même avec des problèmes de cache de schéma. La nouvelle approche:

1. Insère d'abord un produit avec uniquement les champs minimaux (id, nom, reference, prix, quantité)
2. Si même cela échoue, tente une insertion ultra minimale (id, nom, reference)
3. En dernier recours, utilise une requête SQL directe pour contourner complètement le cache de schéma
4. Met à jour ensuite les champs spécifiques un par un
5. Essaie automatiquement les noms de colonnes en camelCase et en snake_case
6. Utilise la référence comme code-barres si nécessaire

Cette solution devrait fonctionner dans tous les cas, même si le cache de schéma est incorrect. Notez que si le champ `codeBarres` n'est pas disponible dans la base de données, la fonction utilisera automatiquement le champ `reference` comme code-barres.

### Option 2: Créer une fonction SQL pour exécuter des requêtes directes
Si vous continuez à rencontrer des problèmes, vous pouvez créer une fonction SQL qui vous permettra d'exécuter des requêtes SQL directes:

1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script SQL
4. Copiez-collez le contenu du fichier `src/sql/create_execute_sql_function.sql`
5. Exécutez le script

Cette fonction vous permettra d'exécuter des requêtes SQL arbitraires via l'API RPC de Supabase, contournant ainsi complètement le cache de schéma. **Attention**: cette fonction est potentiellement dangereuse et ne devrait être utilisée que temporairement.

### Option 3: Exécuter le script SQL pour corriger la structure de la table
1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script SQL
4. Copiez-collez le contenu du fichier `src/sql/fix_table_structure.sql`
5. Exécutez le script

Ce script:
- Vérifie si les colonnes `categorieId`, `codeBarres`, `depotId` et `teamMemberId` existent
- Si elles n'existent pas mais que leurs équivalents snake_case existent, les renomme
- Si aucune des deux versions n'existe, crée les colonnes avec les bons noms
- Pour `codeBarres`, copie les valeurs depuis `reference` si nécessaire

### Option 4: Vérifier la structure actuelle de la table
Pour diagnostiquer le problème:
1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script SQL
4. Copiez-collez le contenu du fichier `src/sql/check_produits_columns.sql`
5. Exécutez le script

Ce script vous montrera la structure actuelle de la table et vous aidera à comprendre le problème.

### Option 5: Rafraîchir le cache de schéma via l'interface Supabase
1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "Table Editor"
3. Cliquez sur "Refresh" pour rafraîchir le cache de schéma
4. Alternativement, vous pouvez essayer de:
   - Modifier légèrement la table (ajouter puis supprimer une colonne temporaire)
   - Redémarrer le projet Supabase depuis les paramètres du projet

### Option 6: Recréer la table avec le bon schéma
Si aucune des solutions ci-dessus ne fonctionne, vous pouvez recréer la table avec le bon schéma:

```sql
-- Sauvegarde des données existantes
CREATE TABLE produits_backup AS SELECT * FROM produits;

-- Suppression de la table problématique
DROP TABLE produits;

-- Recréation de la table avec le bon schéma
CREATE TABLE produits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  description TEXT,
  reference TEXT NOT NULL,
  codeBarres TEXT,
  prixAchat DECIMAL(12, 2) NOT NULL,
  prixVente DECIMAL(12, 2) NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 0,
  categorieId UUID REFERENCES categories(id),
  depotId UUID REFERENCES depots(id),
  teamMemberId UUID REFERENCES team_members(id),
  image TEXT,
  compose BOOLEAN DEFAULT FALSE,
  composants JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restauration des données
INSERT INTO produits SELECT * FROM produits_backup;

-- Suppression de la table de sauvegarde
DROP TABLE produits_backup;
``` 