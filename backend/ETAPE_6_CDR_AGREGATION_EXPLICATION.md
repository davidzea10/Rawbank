# Étape 6 : APIs CDR et agrégation des données

## Vue d'ensemble

Les **CDR (Call Detail Records)** sont les enregistrements détaillés d'activité téléphonique : appels, SMS, données mobiles. Ils alimentent le **score de crédit** via la feature `phone_activity_score` et d'autres indicateurs.

---

## 1. Flux de données

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SOURCES DE DONNÉES CDR                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Option A : Table enregistrements_cdr     Option B : Table donnees_operateurs│
│   (données brutes détaillées)              (données déjà agrégées)           │
│                                                                             │
│   • id_cdr, horodatage, operateur          • total_calls                     │
│   • numero_appelant, numero_appele         • avg_call_duration               │
│   • type_appel (appel, sms, données)       • total_data_mb                   │
│   • duree_secondes, volume_donnees_mb      • total_sms                       │
│   • nombre_sms, statut_appel               • call_failure_rate               │
│   • ville, type_reseau                     • phone_activity_score            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND - ROUTES & AGRÉGATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   GET /api/cdr/:id                    → Liste des CDR bruts (paginée)       │
│   GET /api/cdr/:id/agrege             → Données agrégées (features)         │
│   GET /api/cdr/numero/:numero         → CDR par numéro téléphone            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND - INTERFACE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. Page "Activité téléphonique" (nouvelle, comme Mobile Money)            │
│   2. Carte "Scoring" du Dashboard → détail "Téléphone 20%"                  │
│   3. Préparation des features pour le modèle IA de scoring                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Détail des sous-étapes

### 6.1 Modèle / service pour enregistrements_cdr

**Table `enregistrements_cdr`** (déjà créée) :

| Colonne           | Type        | Description                          |
|-------------------|-------------|--------------------------------------|
| id                | UUID        | Identifiant unique                   |
| id_cdr            | VARCHAR(50) | Ex: CDR00000001                      |
| id_utilisateur    | UUID        | Lien vers l'utilisateur (nullable)   |
| horodatage        | TIMESTAMP   | Date/heure de l'événement            |
| operateur         | VARCHAR(50) | Airtel, Orange, Vodacom              |
| numero_appelant   | VARCHAR(20) | Numéro de l'utilisateur              |
| numero_appele     | VARCHAR(20) | Numéro appelé                        |
| type_appel        | VARCHAR(50) | "appel", "sms", "données"            |
| duree_secondes    | INTEGER     | Durée des appels (0 pour SMS/données)|
| volume_donnees_mb | DECIMAL     | Volume de données consommées         |
| nombre_sms        | INTEGER     | Nombre de SMS                        |
| ville             | VARCHAR     | Localisation                         |
| type_reseau       | VARCHAR     | 2G, 3G, 4G, 5G                      |
| statut_appel      | VARCHAR     | complété, échoué, annulé             |

**Lecture depuis BDD opérateurs** : Si `enregistrements_cdr` est vide, on peut utiliser `donnees_operateurs` qui contient déjà des valeurs agrégées (total_calls, avg_call_duration, total_data_mb, etc.).

---

### 6.2 Routes API

| Méthode | Route                           | Description                                      |
|---------|----------------------------------|--------------------------------------------------|
| GET     | /api/cdr/:id                    | CDR bruts par id_utilisateur (paginé)            |
| GET     | /api/cdr/:id/agrege             | Données agrégées (features) pour l'utilisateur   |
| GET     | /api/cdr/numero/:numero         | CDR par numero_telephone (admin/debug)           |

**Exemple de réponse GET /api/cdr/:id** :
```json
{
  "ok": true,
  "cdr": [
    {
      "id_cdr": "CDR00000001",
      "horodatage": "2025-09-12T01:47:41Z",
      "operateur": "Airtel",
      "type_appel": "données",
      "duree_secondes": 0,
      "volume_donnees_mb": 69.63,
      "nombre_sms": 0,
      "ville": "Lagos",
      "type_reseau": "4G",
      "statut_appel": "complété"
    }
  ],
  "total": 150
}
```

---

### 6.3 Fonctions d'agrégation

Pour chaque utilisateur, on calcule :

| Agrégat              | Formule / logique                                      |
|----------------------|--------------------------------------------------------|
| total_appels         | COUNT WHERE type_appel = 'appel'                       |
| duree_totale_appels  | SUM(duree_secondes) pour les appels                    |
| duree_moyenne_appels | AVG(duree_secondes) pour les appels                    |
| volume_donnees_total | SUM(volume_donnees_mb)                                 |
| total_sms            | SUM(nombre_sms) ou COUNT WHERE type_appel = 'sms'      |
| taux_echec_appels    | COUNT(statut='échoué') / COUNT(appels)                 |
| regularite_appels    | Nombre de jours avec au moins 1 appel / jours observés |
| score_activite       | Score composite 0-1 (régularité + volume + durée)      |

---

### 6.4 Endpoint données agrégées

**GET /api/cdr/:id/agrege** — Retourne les features prêtes pour le modèle IA :

```json
{
  "ok": true,
  "id_utilisateur": "uuid...",
  "periode": "6 derniers mois",
  "agregats": {
    "total_appels": 342,
    "duree_totale_secondes": 12500,
    "duree_moyenne_appels": 36.5,
    "volume_donnees_mb": 2450.5,
    "total_sms": 89,
    "taux_echec_appels": 0.02,
    "regularite_appels": 0.75,
    "phone_activity_score": 0.82
  },
  "par_type": {
    "appel": 342,
    "sms": 89,
    "donnees": 156
  }
}
```

---

### 6.5 Tests Postman

| Test                          | URL                                             | Résultat attendu         |
|-------------------------------|--------------------------------------------------|--------------------------|
| CDR par utilisateur           | GET /api/cdr/{USER_ID}                           | Liste CDR ou []          |
| CDR agrégés                   | GET /api/cdr/{USER_ID}/agrege                    | Objet agregats           |
| CDR par numéro                | GET /api/cdr/numero/2347011431153                | Liste CDR ou []          |

---

## 3. Présentation dans l'interface

### Option 1 : Nouvelle page "Activité téléphonique"

**Emplacement** : Menu latéral / Header (comme Mobile Money)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Dashboard | Mobile Money | Activité téléphonique | ...  │
└─────────────────────────────────────────────────────────────────┘
```

**Contenu de la page** :

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📱 Activité téléphonique                                                │
│  Données d'appels, SMS et consommation données                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Appels       │ │ Durée totale │ │ Données      │ │ SMS          │   │
│  │ 342          │ │ 3h 28min     │ │ 2 450 MB     │ │ 89           │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                         │
│  ┌─ Score activité téléphone ─────────────────────────────────────────┐ │
│  │  ████████████████░░░░  82%  (Contribue au score crédit)             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌─ Derniers enregistrements ─────────────────────────────────────────┐ │
│  │  Type      | Date       | Détail              | Volume              │ │
│  │  Données   | 12/09 01h  | 4G - Lagos          | 69.6 MB             │ │
│  │  Appel     | 11/09 14h  | +234... → +234...   | 2 min 15s           │ │
│  │  SMS       | 11/09 10h  | Envoi               | 1 SMS               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Option 2 : Intégration dans la carte Scoring (Dashboard)

Quand l'utilisateur clique sur **"Voir détails"** dans la carte Scoring :

```
┌─ Détails du score ─────────────────────────────────────────────────────┐
│                                                                        │
│  Mobile Money   ████████████████████████  40%  → Revenus, régularité   │
│  Téléphone      ██████████                20%  → CDR (appels, données) │  ◄── ICI
│  Recharges      ████████                  15%  → Fréquence recharges   │
│  Historique     ██████                    15%  → Remboursements        │
│  Autres         ██████████                10%  → Profil, âge compte    │
│                                                                        │
│  [Source téléphone : 342 appels, 2.4 Go données, score activité 82%]   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Option 3 : Données depuis donnees_operateurs (fallback)

Si `enregistrements_cdr` est vide mais que `donnees_operateurs` contient des données pour le numéro, on affiche :

```
┌─ Données opérateur (agrégées) ─────────────────────────────────────────┐
│  Source : Base opérateurs                                               │
│                                                                        │
│  • Appels totaux      : 342                                             │
│  • Durée moyenne      : 36.5 sec/appel                                  │
│  • Données totales    : 2 450 MB                                        │
│  • SMS                : 89                                              │
│  • Taux échec appels  : 2%                                              │
│  • Score activité     : 82%                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Résumé

| Élément           | Détail                                                                 |
|-------------------|------------------------------------------------------------------------|
| Table source      | `enregistrements_cdr` (ou `donnees_operateurs` en fallback)            |
| Routes            | GET /api/cdr/:id, GET /api/cdr/:id/agrege, GET /api/cdr/numero/:numero |
| Agrégats          | total_appels, duree_*, volume_donnees, total_sms, phone_activity_score |
| Interface         | Page "Activité téléphonique" + détail dans carte Scoring               |
| Usage             | Alimentation du modèle IA de scoring (feature phone_activity_score)    |
