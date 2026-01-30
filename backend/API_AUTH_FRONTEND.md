# API Auth - Documentation pour le Frontend

Base URL : `https://rawbank.onrender.com`

---

## 1. Inscription (Particuliers)

**POST** `/api/auth/register`

### Body (JSON)

```json
{
  "email": "user@example.com",
  "password": "MotDePasse123",
  "numero_telephone": "2347010000345",
  "prenom": "Marie",
  "nom": "Dupont",
  "mobile_money_lie": "orange"
}
```

### Champs requis

| Champ | Type | Description |
|-------|------|-------------|
| `email` | string | Email de l'utilisateur |
| `password` | string | Mot de passe |
| `numero_telephone` | string | Numéro (doit exister dans base opérateurs) |
| `prenom` | string | Prénom |
| `nom` | string | Nom |
| `mobile_money_lie` | string | `"orange"`, `"mpesa"` ou `"airtel"` |

### Réponse succès (201)

```json
{
  "ok": true,
  "message": "Inscription réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "numero_telephone": "2347010000345",
    "prenom": "Marie",
    "nom": "Dupont",
    "mobile_money_lie": "Orange Money"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

### Réponse erreur 400

```json
{
  "ok": false,
  "message": "email, password, numero_telephone, prenom, nom et mobile_money_lie sont requis"
}
```

### Réponse erreur 403 (numéro non autorisé)

```json
{
  "ok": false,
  "message": "Numéro non autorisé. Votre numéro doit exister dans la base des opérateurs."
}
```

---

## 2. Connexion

**POST** `/api/auth/login`

### Body (JSON)

```json
{
  "email": "user@example.com",
  "password": "MotDePasse123"
}
```

### Réponse succès (200)

```json
{
  "ok": true,
  "message": "Connexion réussie",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

### Réponse erreur 401

```json
{
  "ok": false,
  "message": "Email ou mot de passe incorrect"
}
```

---

## 3. Profil utilisateur (protégé)

**GET** `/api/auth/me`

### Headers

```
Authorization: Bearer <access_token>
```

### Réponse succès (200)

```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "numero_telephone": "2347010000345",
    "date_creation": "...",
    "est_actif": true
  }
}
```

### Réponse erreur 401

```json
{
  "ok": false,
  "message": "Token manquant. En-tête: Authorization: Bearer <token>"
}
```

---

## 4. Déconnexion

**POST** `/api/auth/logout`

Le client doit supprimer le token (localStorage, etc.) après cet appel.

### Réponse (200)

```json
{
  "ok": true,
  "message": "Déconnexion réussie. Supprimez le token côté client."
}
```

---

## Tests Postman

| Méthode | URL | Body |
|---------|-----|------|
| POST | `https://rawbank.onrender.com/api/auth/register` | Voir §1 |
| POST | `https://rawbank.onrender.com/api/auth/login` | `{ "email": "...", "password": "..." }` |
| GET | `https://rawbank.onrender.com/api/auth/me` | Header: `Authorization: Bearer <token>` |
| POST | `https://rawbank.onrender.com/api/auth/logout` | (vide) |

---

## Numéros de test (donnees_operateurs)

Pour tester l'inscription, utiliser un de ces numéros :  
`2347010000345`, `2347010000979`, `2347010001092`, `2347010001100`, `2347010001132`, `2347010001390`, `2347010002014`, `2347010002160`, `2347010002255`, `2347010002339`
