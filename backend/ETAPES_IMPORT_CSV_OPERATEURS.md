# Import du fichier credit_df_5000.csv dans donnees_operateurs (Supabase)

## Correspondance CSV ↔ Table

| Colonne CSV              | Colonne table            | Type table    | Note                    |
|--------------------------|--------------------------|---------------|-------------------------|
| numero_telephone         | numero_telephone         | VARCHAR(20)   | OK                      |
| avg_transaction_amount   | avg_transaction_amount   | DECIMAL       | OK                      |
| transaction_amount_std   | transaction_amount_std   | DECIMAL       | OK                      |
| avg_balance              | avg_balance              | DECIMAL       | OK                      |
| balance_volatility       | balance_volatility       | DECIMAL       | OK                      |
| fee_ratio                | fee_ratio                | DECIMAL       | OK                      |
| transaction_regularity   | transaction_regularity   | DECIMAL       | OK                      |
| recharge_frequency       | recharge_frequency       | DECIMAL       | OK                      |
| avg_recharge_amount      | avg_recharge_amount      | DECIMAL       | OK                      |
| small_recharge_ratio     | small_recharge_ratio     | DECIMAL       | OK                      |
| total_calls              | total_calls              | INTEGER       | Arrondir (CSV = décimal)|
| avg_call_duration        | avg_call_duration        | DECIMAL       | OK                      |
| total_data_mb            | total_data_mb            | DECIMAL       | OK                      |
| total_sms                | total_sms                | INTEGER       | Arrondir (CSV = décimal)|
| call_failure_rate        | call_failure_rate        | DECIMAL       | OK                      |
| phone_activity_score     | phone_activity_score     | DECIMAL       | OK                      |
| target_proxy             | —                        | —             | Non importé             |
| credit_scoring           | —                        | —             | Non importé             |

---

## Méthode 1 : Import via Supabase Dashboard (recommandé pour tester)

### Étape 1 : Modifier la table (total_calls et total_sms)

Le CSV contient des décimales pour total_calls et total_sms. Modifier les colonnes :

1. Va sur https://supabase.com/dashboard → ton projet
2. Onglet **SQL Editor**
3. Exécute :

```sql
-- Changer total_calls et total_sms en DECIMAL pour accepter les valeurs du CSV
ALTER TABLE donnees_operateurs 
  ALTER COLUMN total_calls TYPE DECIMAL(10,2),
  ALTER COLUMN total_sms TYPE DECIMAL(10,2);
```

### Étape 2 : Vider les données existantes (optionnel)

Si tu veux remplacer les 20 lignes de test par les 5000 du CSV :

```sql
TRUNCATE TABLE donnees_operateurs CASCADE;
```

(Si tu préfères garder les 20, saute cette étape. Les numéros en doublon provoqueront des erreurs à l’import.)

### Étape 3 : Préparer le CSV

1. Ouvre `ML/credit_df_5000.csv` dans Excel ou un éditeur
2. Supprime les colonnes `target_proxy` et `credit_scoring`
3. Enregistre sous un nouveau nom, par ex. `donnees_operateurs_import.csv`
4. Ou garde le fichier tel quel : Supabase te permettra de choisir les colonnes à importer

### Étape 4 : Import via l’interface Supabase

1. Supabase → **Table Editor**
2. Clique sur la table **donnees_operateurs**
3. Bouton **Insert** → **Import data from CSV**
4. Choisis le fichier `credit_df_5000.csv`
5. Mappe les colonnes (décoche target_proxy et credit_scoring si proposés)
6. Valide l’import

---

## Méthode 2 : Script Node.js (recommandé pour 5000 lignes)

Un script lit le CSV et insère les données par lots (100 lignes à la fois).
Le script utilise upsert : les numéros déjà présents seront mis à jour.

### Étape 1 : Installer la dépendance

```powershell
cd "c:\Users\DEBUZE DAVID\Documents\Hackathon\MicroScore\backend"
npm install csv-parse
```

### Étape 2 : Vérifier le .env

Le fichier backend/.env doit contenir :
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

### Étape 3 : Exécuter le script

```powershell
node scripts/import-operateurs-csv.js
```

Le script lit ML/credit_df_5000.csv et insère dans donnees_operateurs.
Les colonnes target_proxy et credit_scoring sont ignorées.

---

## Méthode 3 : Python (si tu préfères Python)

```powershell
pip install pandas supabase
```

Puis exécuter un script qui lit le CSV avec pandas et insère via l’API Supabase.
