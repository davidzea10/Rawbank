# Étape 5 : APIs Mobile Money et Recharges – Explication détaillée

---

## 1. Vue d’ensemble

L’étape 5 met en place les APIs qui permettent de gérer et d’afficher les données Mobile Money (transactions, soldes) et les recharges téléphoniques. Ces données servent à la fois pour l’interface utilisateur et pour calculer des indicateurs utilisés par le modèle de scoring.

---

## 2. Flux de données (illustration)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        BDD OPÉRATEURS (donnees_operateurs)                       │
│  Données agrégées pré-calculées : avg_transaction_amount, recharge_frequency...  │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │
                              │ 5.3 Import / synchronisation
                              │ (à l'inscription ou via job périodique)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    14 TABLES APPLICATION (détaillées)                             │
│                                                                                  │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐                   │
│  │  comptes_mobile_money    │  │  transactions_mobile_money  │                   │
│  │  - id_utilisateur        │  │  - id_utilisateur           │                   │
│  │  - operateur             │  │  - type: entree / sortie    │                   │
│  │  - numero_compte         │  │  - montant, date            │                   │
│  │  - est_verifie           │  │  - solde_apres              │                   │
│  └──────────────────────────┘  └─────────────────────────────┘                   │
│                                                                                  │
│  ┌──────────────────────────────┐                                                │
│  │  recharges_telephoniques     │                                                │
│  │  - id_utilisateur            │                                                │
│  │  - montant, date_recharge    │                                                │
│  │  - operateur                 │                                                │
│  └──────────────────────────────┘                                                │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │
                              │ 5.2 APIs GET (lecture)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React / Vercel)                           │
│                                                                                  │
│  • Tableau de bord : soldes, dernieres transactions                              │
│  • Page "Historique Mobile Money" : liste des transactions                       │
│  • Section "Recharges" : historique des recharges                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Détail des sous-étapes

### 5.1 Modèles / services

Côté backend, on crée des fonctions (dans des controllers ou services) qui lisent et écrivent dans :

| Table | Rôle |
|-------|------|
| `comptes_mobile_money` | Comptes Orange Money, M-Pesa, Airtel liés à un utilisateur |
| `transactions_mobile_money` | Entrées et sorties d’argent (montant, date, type, solde après) |
| `recharges_telephoniques` | Historique des recharges crédit téléphone |

Ces fonctions encapsulent les requêtes Supabase (select, insert, agrégations).

---

### 5.2 Routes (lecture par utilisateur)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/users/:id/transactions` | Liste des transactions d’un utilisateur |
| GET | `/api/users/:id/solde` ou `/api/users/:id/balance` | Solde actuel (calculé ou dernière transaction) |
| GET | `/api/users/:id/recharges` | Historique des recharges téléphoniques |
| GET | `/api/users/:id/comptes-mobile` | Liste des comptes Mobile Money liés |

---

### 5.3 Import depuis la BDD opérateurs

La table `donnees_operateurs` contient des données agrégées (ex. `avg_transaction_amount`, `recharge_frequency`).  
Deux approches possibles :

- **À l’inscription** : copier les données agrégées dans les tables applicatives (ex. insérer des lignes dans `transactions_mobile_money` ou `recharges_telephoniques` à partir de ces moyennes).
- **Job périodique** : une tâche planifiée relit `donnees_operateurs` et met à jour les tables applicatives.

En pratique, on peut commencer par une route **POST** `/api/admin/import-operateur/:numero` appelée manuellement ou par un cron, qui lit `donnees_operateurs` et insère dans les tables concernées.

---

### 5.4 Calculs pour les features

Les features du modèle de scoring sont calculées à partir des tables applicatives :

| Feature | Source (tables) | Exemple de calcul |
|---------|-----------------|-------------------|
| `avg_transaction_amount` | `transactions_mobile_money` | Moyenne des montants |
| `transaction_regularity` | `transactions_mobile_money` | Nombre de jours avec transactions / nombre de jours |
| `recharge_frequency` | `recharges_telephoniques` | Nombre de recharges / mois |
| Solde moyen | `transactions_mobile_money` | Moyenne de `solde_apres` |

Des endpoints ou services peuvent exposer ces valeurs (ex. GET `/api/users/:id/features` ou `/api/users/:id/stats`) pour le frontend ou le scoring.

---

### 5.5 Tests Postman

Après implémentation, tests à faire :

- GET `/api/users/:id/transactions` → 200 + tableau
- GET `/api/users/:id/recharges` → 200 + tableau
- GET `/api/users/:id/solde` → 200 + solde
- (Si implémenté) POST `/api/admin/import-operateur/:numero` → 200 + message de succès

---

## 4. Emplacement sur le site (UI)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🏠 RawFinance Pro                    [Mon profil ▼]  [Déconnexion]         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📱 TABLEAU DE BORD (page d'accueil après connexion)                 │   │
│  │                                                                     │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │   │
│  │  │ Solde total  │ │ Transactions │ │ Recharges    │  ← 5.2 solde    │   │
│  │  │ 125 000 FC   │ │ ce mois: 12  │ │ ce mois: 3   │  ← 5.2 stats    │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘                 │   │
│  │                                                                     │   │
│  │  Dernières transactions :                                           │   │
│  │  • +15 000 FC - 28/01 - Réception Orange Money     ← 5.2 transac.   │   │
│  │  • -5 000 FC  - 27/01 - Paiement boutique                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Menu / Navigation :                                                        │
│  • Accueil (tableau de bord)                                                │
│  • Mobile Money  ←───── ICI : historique complet, solde par compte          │
│  • Recharges     ←───── ICI : liste des recharges téléphoniques             │
│  • Demander un crédit                                                       │
│  • Mon profil                                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Récapitulatif visuel des écrans

| Écran | Données affichées | APIs utilisées |
|-------|-------------------|----------------|
| **Tableau de bord** | Solde global, nombre de transactions, dernières opérations | `GET /users/:id/solde`, `GET /users/:id/transactions?limit=5` |
| **Page Mobile Money** | Liste des transactions, filtre par type/dates | `GET /users/:id/transactions` |
| **Page Recharges** | Historique des recharges, montants, dates | `GET /users/:id/recharges` |
| **Carte ou encart comptes** | Comptes liés (Orange, M-Pesa, Airtel) | `GET /users/:id/comptes-mobile` |

---

## 6. Ordre d’implémentation recommandé

1. **5.1** – Controllers/services pour lire `transactions`, `recharges`, `comptes`.
2. **5.2** – Routes GET pour chaque ressource.
3. **5.4** – Calculs (sommes, moyennes) pour stats et features.
4. **5.3** – Route ou job d’import depuis `donnees_operateurs` (optionnel au début).
5. **5.5** – Tests Postman sur tous les endpoints.
