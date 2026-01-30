# Résumé : Architecture des Données et Système de Scoring IA

## Approche : Simulation des Données dans Supabase

Puisque l'accès direct aux API réelles des opérateurs (Orange, Vodacom, etc.) n'est pas disponible, simuler ces données dans Supabase permet de garder le contrôle total sur le moteur de scoring IA.

---

## 1. Modèle Conceptuel de Données (MCD) - Supabase

### Les Entités Principales

#### Users (Profils)
Contient les informations d'inscription :
- Nom, CNI, Selfie
- Type de profil choisi : Particulier ou Entrepreneur

#### Mobile_Money_Sim (La Simulation)
Stocke l'historique "importé" avec les colonnes :
- `user_id`
- `type_transaction` (Entrée/Sortie)
- `montant`
- `date`
- `label` (ex: "Achat Stock", "Famille", "Vente")

#### Phone_Activity_Sim
Historique des recharges et ancienneté du numéro.

#### Credits
Détails des prêts accordés :
- Montant, Taux
- Date début, Date fin
- Statut

#### Repayments
Suivi des remboursements effectués par l'utilisateur via la balance simulée.

### Relations

- Un **User** possède plusieurs **Transactions** (1:N)
- Un **User** possède plusieurs **Crédits** au fil du temps (1:N)
- Chaque **Crédit** possède plusieurs **Remboursements** (1:N)

---

## 2. Différence entre BDD et Dataset IA

### La BDD (Supabase)
- **Stockage "vivant"** : Données brutes, nominatives (noms, photos) et temporelles
- Contient chaque transaction individuelle
- Sert à l'application au quotidien

### Le Dataset IA
- **Version "aplatie" et agrégée** de la BDD
- Transformation de milliers de transactions en **Features** (caractéristiques)
- Exemple : Au lieu de 50 lignes de transactions, une seule colonne "Moyenne des revenus mensuels"
- Format : CSV utilisé par l'IA pour apprendre

---

## 3. Dataset IA : Caractéristiques (Features) et Cible (Target)

### Définition des Variables

#### Features (Entrées) :
- `avg_monthly_income` : Revenu moyen calculé sur les 6 derniers mois
- `transaction_regularity` : Score de 0 à 1 (1 = l'utilisateur reçoit de l'argent chaque jour)
- `recharge_frequency` : Nombre de recharges crédit tel par mois
- `business_pattern_score` : Score calculé par l'IA sur la présence de mots-clés "Business"
- `old_debt_ratio` : Pourcentage de crédits déjà remboursés à temps

#### Target (Cible) :
- `credit_score` : La note finale (0-1000) que le modèle doit prédire

### Exemple de 10 Observations (Dataset de simulation)

| User_ID | Avg_Income (CDF) | Reg_Score (0-1) | Recharge_Freq | Business_Pattern | Debt_Ratio | Target: Score |
|---------|------------------|-----------------|---------------|------------------|------------|---------------|
| 001     | 450 000          | 0.85            | 12            | 0.9 (Entrepreneur) | 1.0        | 850           |
| 002     | 120 000          | 0.40            | 4             | 0.1 (Particulier)  | 0.5        | 420           |
| 003     | 800 000          | 0.95            | 20            | 0.95 (Entrepreneur) | 1.0        | 920           |
| 004     | 50 000           | 0.20            | 2             | 0.05 (Particulier) | 0.0        | 150           |
| 005     | 300 000          | 0.60            | 8             | 0.4 (Mixte)        | 0.8        | 610           |
| 006     | 1 200 000        | 0.90            | 15            | 0.85 (Entrepreneur) | 1.0        | 890           |
| 007     | 200 000          | 0.55            | 5             | 0.2 (Particulier)  | 0.9        | 580           |
| 008     | 600 000          | 0.75            | 10            | 0.7 (Entrepreneur) | 0.7        | 720           |
| 009     | 150 000          | 0.35            | 3             | 0.1 (Particulier)  | 0.4        | 380           |
| 010     | 400 000          | 0.80            | 11            | 0.6 (Entrepreneur) | 1.0        | 790           |

---

## 4. Côté Admin (Dashboard)

Dans l'application, l'admin pourra :

### Visualiser le Dataset
- Voir quels facteurs influencent le plus le défaut de paiement (Statistiques)

### Liste des Crédits
- Table filtrable par "Score de risque" (détecté par l'IA de fraude)

### Simulateur de Marché
- Voir combien de personnes passeraient du profil Particulier à Entrepreneur si on baissait le seuil de scoring

---

## Points Clés à Retenir

1. **Simulation dans Supabase** : Contrôle total sur les données pour le hackathon
2. **Séparation BDD/Dataset** : BDD pour l'application, Dataset agrégé pour l'IA
3. **Features calculées** : Transformation des transactions brutes en caractéristiques exploitables
4. **Target claire** : Score de crédit 0-1000 à prédire
5. **Dashboard Admin** : Outils de visualisation et simulation pour la gestion
