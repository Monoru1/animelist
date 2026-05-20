# Animelist

Ta bibliothèque anime personnelle. Ajoute, organise, partage tes animes favoris avec une interface sombre et violette pensée pour les otakus.

## Stack

- **Frontend** : Vite 8 + React 18 + TypeScript (strict)
- **Routing** : React Router v6
- **State serveur** : TanStack Query v5
- **State client** : Zustand
- **Styles** : Tailwind CSS v4 (CSS-first)
- **Backend** : Supabase (Auth, Postgres, Storage, RLS)
- **Déploiement** : Netlify

## Prérequis

- Node.js >= 20
- pnpm >= 9
- Un projet Supabase (gratuit suffit)
- Un compte Netlify

## Setup local

```bash
# 1. Cloner le repo
git clone https://github.com/monoru1/animelist.git
cd animelist

# 2. Variables d'environnement
cp .env.example .env.local
# Édite .env.local avec tes vraies valeurs Supabase

# 3. Installer les dépendances
pnpm install

# 4. Lancer le dev server
pnpm dev
```

## Commandes

```bash
pnpm dev        # Dev server (localhost:5173)
pnpm build      # Build de production
pnpm preview    # Preview du build local
pnpm lint       # Linter ESLint
```

## Déploiement Netlify

1. **Connecter le repo** : Netlify > New site from Git > GitHub > choisir `animelist`
2. **Configurer le build** (auto-détecté depuis `netlify.toml`) :
   - Build command : `pnpm build`
   - Publish directory : `dist`
3. **Variables d'environnement** : Netlify > Site settings > Environment variables
   - `VITE_SUPABASE_URL` → URL de ton projet Supabase
   - `VITE_SUPABASE_ANON_KEY` → Anon key Supabase
4. **Deploy** : Trigger manuel ou push sur `main`

## Se promouvoir admin

Via le SQL Editor de ton dashboard Supabase :

```sql
update profiles set role = 'admin' where username = 'ton-username';
```

## Migrations Supabase

```bash
# Appliquer les migrations (Lot 1+)
pnpm exec supabase db push

# Générer les types TypeScript
pnpm exec supabase gen types typescript --linked > src/lib/database.types.ts
```

## Architecture

Voir [CLAUDE.md](./CLAUDE.md) pour les conventions complètes.

```
src/
  app/          # Router, providers globaux
  pages/        # Une page = une route
  features/     # Logique métier (auth, library, admin, profile, notifications)
  components/   # UI transverse réutilisable
  lib/          # supabase client, utils
  styles/       # tokens.css (palette, typo)
```
