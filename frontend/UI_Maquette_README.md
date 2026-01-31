# Maquette UI/UX — RawFinance Pro

## Objectif
**RawFinance Pro** : Plateforme intelligente de microcrédit pour particuliers et entrepreneurs en RDC.
- Scoring alternatif (données mobiles/sociales) pour particuliers
- Scoring transactionnel (données business) pour entrepreneurs
- Transition automatique de profil
- Détection AI du profil utilisateur
- Services complémentaires (éducation financière, support)

## Public cible
- Particuliers sans compte bancaire (80% Mobile Money)
- Entrepreneurs informels/micro-entreprises
- Commerçants, artisans, petits traders
- Priorité : accessibilité USSD + Web/Mobile

## Palette de couleurs
- Primaire : #0066CC (Bleu finance) — CTA, actions principales
- Secondaire : #00B8A9 (Teal) — états positifs, confirmations
- Accent : #FFB81C (Or) — alertes, risques, scoring faible
- Texte principal : #1A202C (gris foncé)
- Texte secondaire : #718096 (gris moyen)
- Fond : #FFFFFF
- Surface secondaire : #F7FAFC
- Danger : #E53E3E (rouge) — refus, erreurs

## Typographie
- Principale : Inter, Segoe UI (ou system sans-serif)
- H1: 32px / 40px — Titres principaux
- H2: 24px / 32px — Sous-titres, titres sections
- H3: 20px / 28px — Titres cartes
- Body: 16px / 24px — Contenu principal
- Small: 14px / 20px — Labels, helper text
- Badge: 12px / 16px — Statuts, tags

## Structure d'écrans (écrans-clés)

### 1. Landing Page
**Objectif**: Convertir utilisateurs vers inscription
- Header fixe : Logo, navigation (Particulier/Entrepreneur), CTA "Commencer"
- Hero : 
  - Titre : "Crédit intelligent pour tous"
  - Sous-titre : "Pas de compte bancaire ? Pas de problème"
  - CTA primaire : "Ouvrir mon compte" (vert/teal)
  - Image/illustration : smartphone avec Mobile Money
- Section 2 : 2 cartes "Vous êtes ?"
  - Carte A : "Particulier - Besoin personnel" → icône portefeuille
  - Carte B : "Entrepreneur - Besoin business" → icône boutique
- Section 3 : Avantages (3-4 items)
  - "Scoring intelligent" → icône AI/cerveau
  - "Approuvé en minutes" → icône horloge
  - "Pas de documents complexes" → icône document simple
  - "Mobile Money accepté" → icône téléphone
- Section 4 : Témoignages (carousel ou 2-3 cards)
- Footer : Liens, contact support

### 2. Inscription (Parcours Guidé)
**Objectif**: Multi-canal, rapide, adaptatif
#### Variante USSD (*123#)
- SMS de bienvenue + lien pour complétude
- Écran 1 : Numéro téléphone (pré-rempli si possible)
- Écran 2 : Code PIN (4-6 chiffres)
- Écran 3 : Détection profil AI (attendre résultat)
- Écran 4 : Confirmation choix profil (Particulier / Entrepreneur)
- SMS de confirmation

#### Variante Web/Mobile
- Écran 1 : Téléphone + Email
- Écran 2 : Identification (CNI upload + OCR)
  - Photo CNI (recto/verso)
  - Extraction auto des données (nom, prénom, numéro)
  - Selfie pour vérification faciale
- Écran 3 : Sélection profil
  - Radio button : "Je suis particulier" / "Je suis entrepreneur"
  - Si entrepreneur : champs additionnels
    - Nom entreprise
    - Secteur (dropdown)
    - Localisation
    - Type d'activité
- Écran 4 : Connexion Mobile Money
  - Sélection opérateur (Orange Money, M-Pesa, Airtel Money, etc.)
  - Authentification via SMS/OTP
- Écran 5 : Résumé + confirmation

### 3. Dashboard Personnalisé (Après Inscription)
**Objectif**: Vue complète profil, scoring, actions principales

#### Pour Particulier:
- En-tête :
  - Salutation : "Bienvenue, [Prénom]"
  - Score crédit : visuel jauge (0-1000) avec couleur
    - Rouge (0-300) : "Mauvais score"
    - Orange (300-600) : "Score moyen"
    - Vert (600-1000) : "Bon score"
- Cartes principales (grid 2×2 desktop, 1 colonne mobile) :
  - **Carte "Scoring"**
    - Score sur 1000
    - Facteurs principaux (Mobile Money 40%, Téléphone 20%, etc.)
    - Bouton "Voir détails"
  - **Carte "Crédit Disponible"**
    - Montant maximal offert (ex: 250,000 CDF)
    - Taux estimé
    - Bouton "Faire demande"
  - **Carte "Historique Crédits"**
    - Crédits passés (tableau simple)
    - Statut (Actif, Remboursé, En retard)
  - **Carte "Alertes"**
    - Informations importantes (renouvellement, conseils, etc.)
- Section basse : Ressources (articles éducation financière, FAQ)

#### Pour Entrepreneur:
- En-tête similaire mais focus sur Business
- Cartes :
  - **Scoring Transactionnel**
    - Score business (1000)
    - Analyse ventes, achats, croissance, stabilité
  - **Trésorerie Estimée**
    - Flux hebdo/mensuel (graphique simple)
    - Crédit recommandé
  - **Performance Activité**
    - Ventes moyennes (montant/fréquence)
    - Tendance (graphique minimaliste)
  - **Montant Crédit Disponible**
    - Range (ex: 500k - 5M CDF)
    - Types de crédit recommandés

### 4. Demande de Crédit
**Objectif**: Processus simplifié, suggestions intelligentes

#### Étape 1 : Montant & Durée
- Slider pour montant (min-max selon score)
- Durée du crédit (3, 6, 12 mois) — radio/tabs
- **Estimation auto** : Afficher montant mensuel à rembourser + taux estimé
- Bouton "Suivant"

#### Étape 2 : Motif du crédit (Particulier) / Type business (Entrepreneur)
**Particulier** :
- Options : Personnel, Urgence, Éducation, Santé, Logement, Autre
- Description libre (optionnel)

**Entrepreneur** :
- Options : Trésorerie, Investissement, Stock, Équipement, Autre
- Champs : Secteur confirmé, usage prévu

#### Étape 3 : Vérification & Signature
- Résumé demande (montant, durée, taux)
- Terms & conditions (scrollable, avec checkbox confirmation)
- Signature digitale / code PIN
- Bouton "Soumettre"

#### Résultat :
- Notification succès
- **Approbation instantanée** (si score > seuil)
  - Message "✓ Approuvé !"
  - Fonds en Mobile Money en 2-5 min
- **Approbation en attente**
  - Message "Demande en cours de vérification"
  - Estimé : 24h
- **Refus** (rare, score trop faible)
  - Message "Malheureusement, pas approuvé maintenant"
  - Suggestions pour améliorer score

### 5. Remboursement & Suivi
- Affichage montant dû
- Calendrier de versements (table ou timeline)
- Bouton "Rembourser" → lien Mobile Money
- Historique remboursements (conforme, retard)
- Option : Renouveler crédit si bon historique

### 6. Paramètres & Profil
- Infos personnelles (nom, téléphone, email)
- Documents (CNI, justificatif revenus si entrepreneur)
- Consentements (données sociales, partage données)
- Sécurité (changement PIN, 2FA optionnel)
- Préférences (langue, notifications)
- Support : Chat, email, hotline

---


## 7. Authentification (Page Login)

**Objectif**: Accès sécurisé et rapide à l'espace utilisateur/admin.

* **Champs du formulaire** :
* **Nom d'utilisateur** : Input texte avec icône `@` ou `user`.
* **Email** : Validation format email stricte.
* **Mot de passe** : Input type "password" avec option "Afficher/Masquer".


* **Actions** :
* Bouton "Se connecter" (Style Primaire).
* Lien "Mot de passe oublié ?".
* Lien "Pas encore de compte ? S'inscrire".



---

## 8. Dashboard Administration

**Objectif**: Gestion centralisée des risques, des clients et monitoring des performances.

### A. Vue d'ensemble (Analytics)

Utilisation de graphiques pour une lecture rapide des données :

* **Histogramme des montants** : Répartition des crédits accordés par tranches de montants.
* **Répartition par Type de Compte** : Diagramme circulaire ou barre (Particuliers / Entrepreneurs).
* **Type de clients** : Comparatif visuel entre **Particuliers** et **Entrepreneurs**.
* **Indicateurs clés (KPIs)** : Total prêté, Taux de remboursement, Nombre d'utilisateurs actifs.

### B. Gestion des Utilisateurs & Historique

Tableau détaillé permettant de consulter le profil complet de chaque personne :

* **Colonnes du tableau** :
* Identité (Nom, ID, Type de profil).
* **Montant emprunté** : Somme totale ou actuelle.
* **Date de l'emprunt** : Date d'octroi du dernier crédit.
* **Échéances** : Calendrier des paiements prévus.
* **Date du remboursement** : Historique des paiements effectifs.
* Statut de paiement (À jour, En retard, Défaut).


* **Actions par ligne** : "Voir dossier complet", "Contacter", "Ajuster limite de crédit".

---

## Composants additionnels (Mise à jour)

### Histogrammes / Graphiques

* **Bibliothèque recommandée** : Recharts ou Chart.js.
* **Couleurs** : Utilisation des couleurs de la palette (#0066CC pour les montants, #00B8A9 pour les bons payeurs, #E53E3E pour les retards).

### Tableaux Admin (DataGrid)

* **Fonctionnalités** : Tri par date, Filtrage par type de client (Particulier/Entrepreneur), Recherche par nom/téléphone.
* **Style** : Lignes alternées, badges de statut colorés pour une lecture rapide des échéances.

---

## Wireframes Admin (ASCII)

### Dashboard Admin (Desktop)

```
[Sidebar: Dashboard, Clients, Crédits, Paramètres]
[TopBar: Recherche, Notifications, Profil Admin]
---------------------------------------------------
[Stats: Total Prêté | Taux Remboursement | Users]
---------------------------------------------------
[Graphiques: Histogramme Montants | Pie Chart Types de Compte]
---------------------------------------------------
[Tableau Historique:
 Nom       | Type    | Prêt    | Date Prêt | Prochaine Échéance | Statut
 Jean D.   | Part.   | 500$    | 01/01/26  | 01/02/26           | [OK]
 Marie K.  | Entr.   | 2500$   | 15/01/26  | 15/02/26           | [En attente]
]

```




## Composants réutilisables

### Boutons
- **Primaire** : fond #0066CC, blanc, 12px padding, radius 8px
- **Secondaire** : bord #0066CC, fond transparent, texte bleu
- **Danger** : fond #E53E3E, blanc
- **Désactivé** : opacité 0.5, cursor not-allowed

### Cartes
- Fond #FFFFFF, ombre légère (0 2px 8px rgba(0,0,0,0.08))
- Padding 20px
- Radius 12px
- Titre gras 18px, contenu 14px

### Input/Formulaire
- Bord 1px #CBD5E0 (gris clair)
- Focus : bord #0066CC, shadow légère
- Label au-dessus, 14px gris
- Helper text 12px sous input
- Erreur : bord rouge, texte rouge

### Badge/Tag
- Padding 4px 8px, radius 6px
- Variantes : success (vert), warning (orange), danger (rouge), info (bleu)

### Jauge Score
- Cercle ou barre horizontale
- Gradient : rouge → orange → vert selon valeur
- Texte centré : "650/1000"

### Tableau Responsif
- Header gris clair (#F7FAFC)
- Ligne alternée (blanc/gris très léger)
- Collapse en mobile si trop de colonnes

---

## Accessibilité
- Contraste >= 4.5:1 texte normal / 3:1 texte grand
- Focus visible (outline 2px bleu)
- Tailles tactiles min 44×44px
- Texte alternatif pour images/icônes
- Labels explicites pour inputs
- ARIA attributes si nécessaire

---

## Wireframes (ASCII)

### Landing (Mobile)
```
[Header: Logo, CTA "Commencer"]
[Hero: Titre, Sous-titre, CTA primaire]
[2 Cartes: Particulier / Entrepreneur]
[4 Avantages en colonne]
[2-3 Témoignages (carousel)]
[Footer]
```

### Dashboard Particulier (Desktop)
```
[Header: Salut [User], Score: 650/1000]
[Grid 2x2 Cartes: Scoring | Crédit | Historique | Alertes]
[Ressources éducation]
[Footer]
```

### Demande Crédit (Mobile/Desktop)
```
[Stepper: 1. Montant 2. Motif 3. Confirmation]
[Step 1: Slider montant, Radio durée, Estimation]
[Bouton Suivant]
```

---

## Design Tokens

### Spacing
- 8px, 16px, 24px, 32px, 48px

### Shadows
- Light : 0 1px 3px rgba(0,0,0,0.08)
- Medium : 0 2px 8px rgba(0,0,0,0.12)
- Heavy : 0 4px 16px rgba(0,0,0,0.16)

### Radius
- Buttons : 8px
- Cards : 12px
- Inputs : 6px
- Modals : 16px

---

## Livrables proposés
1. **Maquette texte** ✓ (ce doc)
2. **Composants React** : Button, Card, Input, Badge, ScoreGauge
3. **Pages** : Landing, Signup (multi-step), Dashboard, CreditRequest, Settings
4. **Routing** : React Router v6
5. **État global** : Context API ou Zustand
6. **Assets** : Icônes SVG, illustrations légères

---

## Prochaines étapes (Implémentation React)
1. ✓ Scaffold Vite + React + TS
2. → Ajouter React Router + pages
3. → Composants réutilisables (button, card, input, etc.)
4. → Intégrer design tokens (CSS variables)
5. → Implementer formulaires multi-étapes (Signup, Credit Request)
6. → Mocks API + localStorage pour prototypage