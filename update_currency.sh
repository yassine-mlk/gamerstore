#!/bin/bash

# Script to update currency from € to DH in all files

# Find all files with the € symbol and replace it with DH
find ./src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/€/DH/g'

# Update form labels for currency
find ./src -type f -name "*.tsx" | xargs sed -i '' 's/Prix d'\''achat (€)/Prix d'\''achat (DH)/g'
find ./src -type f -name "*.tsx" | xargs sed -i '' 's/Prix de vente (€)/Prix de vente (DH)/g'

echo "Currency updated from € to DH in all files." 