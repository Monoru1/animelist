# Supabase Setup — Animelist

## 1. Créer le projet Supabase

1. Va sur [supabase.com](https://supabase.com) → **New project**
2. Choisis une organisation, donne un nom (ex: `animelist`), une région proche (Europe West), et un mot de passe DB fort
3. Attends ~2 min que le projet soit ready

## 2. Récupérer URL + anon key

**Settings → API** dans le dashboard :
- **Project URL** → ex: `https://abcdefgh.supabase.co`
- **anon / public key** → longue chaîne JWT

## 3. Remplir `.env.local`

```bash
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Configurer les env vars sur Netlify

**Netlify dashboard → Site settings → Environment variables** → Add variable :
- `VITE_SUPABASE_URL` → même valeur
- `VITE_SUPABASE_ANON_KEY` → même valeur

Trigger un redeploy après ajout.

## 5. Lancer les migrations SQL (ordre strict)

Dans **Supabase SQL Editor** (onglet SQL Editor dans le dashboard) :

### Étape 1 — Schema
Ouvre `supabase/schema.sql`, copie tout le contenu, colle dans l'éditeur, **Run**.

Vérifie :
- Les 6 tables apparaissent dans **Table Editor** : `profiles`, `animes`, `playlists`, `playlist_items`, `notifications`, `moderation_logs`
- La fonction `is_admin()` apparaît dans **Database → Functions**
- Le trigger `on_auth_user_created` apparaît dans **Database → Triggers**

### Étape 2 — Policies RLS
Ouvre `supabase/policies.sql`, copie-colle, **Run**.

Vérifie :
- Dans **Table Editor**, clique sur chaque table → l'icône RLS est activée (cadenas fermé)
- Chaque table a ses policies visibles dans **Authentication → Policies**

### Étape 3 — Storage
Ouvre `supabase/storage.sql`, copie-colle, **Run**.

Vérifie :
- Dans **Storage**, le bucket `anime-posters` est visible avec badge "Public"
- Les 4 policies storage apparaissent dans **Authentication → Policies** (section storage.objects)

## 6. Créer le compte admin

Une fois le Lot 3 déployé et l'interface de signup fonctionnelle :

1. Fais un signup normal dans l'app avec `anime@gmail.com` / `nounours`
2. Vérifie dans **Table Editor → profiles** que la ligne a bien été créée (via le trigger)
3. Dans **SQL Editor**, exécute :

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'anime@gmail.com';
```

4. Vérifie que `role` passe bien à `'admin'` dans la table

## 7. Vérifications finales

**Tables créées avec RLS activée :**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- rowsecurity doit être true pour TOUTES les tables
```

**Trigger profile auto-créé :**
1. Crée un user test depuis l'app (signup)
2. Va dans Table Editor → profiles → vérifie que la ligne existe avec le bon username et email

**Test RLS basique :**
```sql
-- Doit retourner des lignes (SELECT public est ouvert)
SELECT * FROM animes LIMIT 5;

-- Doit retourner false (pas connecté dans le SQL Editor)
SELECT is_admin();
```

## 8. Troubleshooting

**Trigger ne crée pas le profile :**
- Vérifie que `handle_new_user` est bien dans Database → Functions
- Vérifie que le trigger `on_auth_user_created` est attaché à `auth.users`
- Possible cause : le username dans `raw_user_meta_data` est null → le trigger fallback sur `split_part(email, '@', 1)`

**RLS bloque une query légitime :**
- Vérifie que tu es bien authentifié (session valide côté app)
- Vérifie dans Authentication → Policies que la policy SELECT existe bien
- Utilise le SQL Editor avec "Run as authenticated user" pour tester

**Upload Storage échoue :**
- Vérifie que le bucket `anime-posters` existe dans Storage
- Vérifie que le path de l'upload commence par `{user_id}/`
- Vérifie que le fichier est < 2MB et de type image/jpeg|png|webp
- CORS : dans Storage → Policies, les origins Netlify doivent être autorisées (configuré automatiquement pour les buckets publics)

**`is_admin()` retourne false alors que le role est 'admin' :**
- La fonction est SECURITY DEFINER mais cherche via `auth.uid()` — assure-toi que la session est valide
- Teste directement : `SELECT role FROM profiles WHERE id = auth.uid();`
