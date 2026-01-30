# Étapes Supabase – Configuration Auth

À faire manuellement dans le dashboard Supabase pour que l'authentification fonctionne.

---

## 1. Activer l'authentification par email

1. Supabase → **Authentication** (menu gauche)
2. **Providers** (ou **Auth** → **Providers**)
3. Vérifier que **Email** est activé (par défaut : oui)
4. Option **"Confirm email"** :
   - **Désactivé** (recommandé pour le hackathon) : l'utilisateur peut se connecter immédiatement après inscription
   - **Activé** : l'utilisateur doit confirmer par email avant de pouvoir se connecter

---

## 2. Désactiver la confirmation d'email (pour tests rapides)

1. **Authentication** → **Providers** → **Email**
2. Désactiver **"Confirm email"**
3. Enregistrer

---

## 3. Politique RLS sur la table `utilisateurs`

1. **Table Editor** → table **utilisateurs**
2. Onglet **Policies** (ou clic sur l’icône bouclier)
3. Créer une nouvelle policy :

**Policy 1 – Lecture par utilisateur authentifié :**

- **Name** : `Utilisateurs peuvent lire leur propre profil`
- **Policy command** : `SELECT`
- **Target roles** : `authenticated`
- **USING expression** :
  ```sql
  auth.uid() = id
  ```

**Policy 2 – Insertion par le service (backend) :**

- Le backend utilise la clé **service_role**, qui contourne les RLS
- Aucune policy supplémentaire nécessaire pour les inserts depuis le backend

**Policy 3 – Lecture par service role (optionnel) :**

- Si tu utilises uniquement le backend avec `service_role`, les policies RLS ne s’appliquent pas
- Tu peux laisser les policies ci-dessus pour une utilisation future côté frontend avec la clé `anon`

---

## 4. Lier `utilisateurs` à `auth.users`

La table `utilisateurs` utilise le même `id` que `auth.users`. Le backend insère une ligne dans `utilisateurs` après chaque inscription réussie.

Vérifier que la colonne `id` de `utilisateurs` est bien de type **UUID** et correspond à l’id de l’utilisateur dans **Authentication** → **Users**.

---

## 5. Vérifier les paramètres Auth généraux

1. **Authentication** → **Settings** (ou **URL Configuration**)
2. **Site URL** : `http://localhost:3001` (ou l’URL de ton frontend)
3. **Redirect URLs** : ajouter `http://localhost:3001`, `http://localhost:5173` si besoin (pour le frontend)

---

## 6. Tester dans le dashboard

1. **Authentication** → **Users**
2. Après un `POST /api/auth/register` réussi, un nouvel utilisateur doit apparaître ici
3. Vérifier que la table **utilisateurs** contient une ligne avec le même `id`

---

## Résumé des réglages recommandés pour le hackathon

| Paramètre | Valeur |
|-----------|--------|
| Email provider | Activé |
| Confirm email | Désactivé |
| Site URL | `http://localhost:3001` |
| RLS utilisateurs | `SELECT` où `auth.uid() = id` |
