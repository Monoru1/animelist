# Animelist

Animelist est une plateforme communautaire anime inspirée de l’expérience Netflix / Crunchyroll. Le projet permet aux utilisateurs de créer un compte, ajouter des animés depuis des liens de visionnage, organiser leur propre playlist, sauvegarder des favoris, reprendre leur historique et consulter une bibliothèque publique alimentée par la communauté.

Le site est connecté à Supabase pour l’authentification, la base de données, le stockage des affiches, les règles de sécurité RLS et les Edge Functions d’import automatique de métadonnées.

## État actuel

Le site est fonctionnel et déployé sur Netlify. Les utilisateurs interagissent uniquement via l’interface du site : ils ne doivent pas aller dans Supabase. L’admin gère les contenus, les utilisateurs et la modération depuis l’interface web.

## Fonctionnalités principales

### Authentification

- Création de compte avec pseudo, email et mot de passe.
- Connexion persistante via Supabase Auth.
- Création automatique du profil utilisateur.
- Auto-confirmation des comptes pour éviter le blocage par email non confirmé.
- Rôles utilisateur : `user` et `admin`.
- Admin actuel prévu : `nounours`.

### Bibliothèque communautaire

- Page bibliothèque publique.
- Tous les animés ajoutés par la communauté apparaissent automatiquement.
- Affichage du pseudo de l’utilisateur ayant ajouté l’animé.
- Recherche par titre ou genre.
- Sections type streaming : ajouts récents, populaires communauté, catégories.
- Cards cliquables vers une fiche anime immersive.

### Ajout réel d’anime

- Formulaire d’ajout depuis le site.
- L’utilisateur colle un titre et un lien de visionnage.
- Import automatique des métadonnées via Supabase Edge Function `anime-metadata`.
- Récupération automatique lorsque possible : titre, description, genre et affiche.
- Fallback via API Jikan pour enrichir les métadonnées anime.
- Upload d’affiche via Supabase Storage lorsque l’utilisateur ajoute une image.
- Possibilité de mettre une URL d’image si l’import automatique échoue.

### Images et affiches

- Bucket Supabase Storage utilisé : `anime-posters`.
- Upload côté site, invisible pour l’utilisateur final en tant que logique technique.
- Les utilisateurs ne vont pas dans Supabase pour gérer les images.
- La plateforme essaie d’abord de trouver l’affiche automatiquement depuis le lien source ou via Jikan.

### Page anime immersive

- Route dynamique `/anime/:animeId`.
- Hero avec poster, backdrop, titre, genres, synopsis et auteur.
- Bouton `Regarder maintenant`.
- Système favoris avec compteur.
- Badges dynamiques selon le lien : HD, VF, VOSTFR, Anime-Sama, Neko, etc.
- Enregistrement automatique dans l’historique lorsque l’utilisateur clique sur regarder.

### Favoris

- Ajout / retrait d’un anime en favori.
- Page dédiée `/favorites`.
- Chaque utilisateur voit ses propres favoris.
- Les favoris pointent vers les fiches anime.

### Historique / Continuer à regarder

- Table `watch_history`.
- Page `/history`.
- Enregistrement du dernier visionnage.
- Section pensée pour reprendre un anime ouvert récemment.
- Données privées par utilisateur via RLS.

### Playlist utilisateur

- Page `/my-playlist`.
- Affiche les animés ajoutés par l’utilisateur connecté.
- L’utilisateur peut supprimer uniquement ses propres animés.
- L’admin peut supprimer tous les animés.
- Correction RLS appliquée pour éviter l’erreur `permission denied for function is_admin` lors de la suppression.

### Administration

- Page `/admin`.
- L’entrée Admin est masquée aux utilisateurs non-admin.
- La route admin redirige les utilisateurs non-admin vers la bibliothèque.
- L’admin peut voir les animés et les utilisateurs.
- Suppression d’anime avec raison de modération.
- Envoi d’une notification à l’utilisateur concerné.
- Journalisation dans `moderation_logs`.

### Notifications

- Page notifications utilisateur.
- Notifications liées à la modération.
- Support des raisons de suppression.
- Champ `read` prévu pour gérer l’état lu/non lu.

### Sécurité Supabase

- Row Level Security activée sur les tables sensibles.
- Policies pour séparer les droits utilisateur/admin.
- Les utilisateurs ne peuvent pas supprimer les contenus des autres.
- Les fonctions sensibles ne sont plus exposées publiquement en RPC.
- L’accès admin est vérifié via la table `profiles` et les policies.

### Responsive et design

- Direction artistique sombre/violette premium.
- Inspiration Netflix / Crunchyroll.
- Carrousels horizontaux type streaming.
- Cards animées avec hover desktop.
- Layout responsive pour desktop, tablette et mobile.
- Correction globale de plusieurs problèmes d’overflow horizontal.
- Support mobile avec `viewport-fit=cover`, theme color et `apple-touch-icon`.

## Stack technique

### Frontend

- Vite 8
- React 19
- TypeScript 6
- React Router v6
- TanStack Query v5
- Zustand
- React Hook Form
- Zod
- Radix UI
- Lucide React

### Styling

- Tailwind CSS v4
- CSS-first tokens dans `src/styles/tokens.css`
- Fonts Bunny : Inter + Space Grotesk
- Design system custom : surfaces, cards, boutons, responsive, carrousels

### Backend

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Row Level Security
- Supabase Edge Functions

### Import metadata

- Edge Function Supabase : `anime-metadata`
- Scraping léger de métadonnées HTML : `og:image`, `twitter:image`, `title`, `h1`, description
- Fallback API Jikan pour récupérer les informations anime

### Déploiement

- Netlify
- Build : `pnpm build`
- Publish directory : `dist`

## Variables d’environnement

Créer un fichier `.env.local` :

```bash
VITE_SUPABASE_URL=ton_url_supabase
VITE_SUPABASE_ANON_KEY=ta_anon_key_supabase
```

Sur Netlify, ajouter les mêmes variables dans :

```txt
Site settings > Environment variables
```

## Installation locale

```bash
git clone https://github.com/Monoru1/animelist.git
cd animelist
pnpm install
pnpm dev
```

## Commandes

```bash
pnpm dev        # serveur local
pnpm build      # build production TypeScript + Vite
pnpm preview    # preview locale du build
pnpm lint       # lint ESLint
```

## Déploiement Netlify

1. Connecter le repo GitHub `Monoru1/animelist` à Netlify.
2. Configurer :
   - Build command : `pnpm build`
   - Publish directory : `dist`
3. Ajouter les variables Supabase.
4. Déployer depuis la branche `main`.

## Modèle de données actuel

Tables principales :

- `profiles`
- `animes`
- `favorites`
- `watch_history`
- `playlists`
- `playlist_items`
- `notifications`
- `moderation_logs`

Storage :

- `anime-posters`

Edge Functions :

- `anime-metadata`

## Points encore à améliorer

- Finaliser le polish responsive mobile sur toutes les pages.
- Ajouter une vraie navigation mobile type bottom nav ou hamburger.
- Ajouter des profils publics consultables.
- Ajouter des playlists publiques consultables.
- Améliorer la section tendances avec un vrai calcul basé sur favoris + historique.
- Ajouter skeleton loading et toasts propres à la place des alertes navigateur.
- Ajouter une meilleure gestion des images cassées avec fallback poster.
- Améliorer la page admin avec édition de contenu, recherche et filtres.
- Ajouter tests, monitoring et typage Supabase généré.

## Vision produit

Animelist doit devenir une plateforme anime communautaire où les utilisateurs peuvent rapidement partager des animés trouvés sur différents sites, centraliser leurs liens, construire des playlists publiques, reprendre leur historique et découvrir ce que la communauté ajoute.

L’objectif n’est pas de laisser les utilisateurs manipuler la base de données : tout doit être géré depuis l’interface web, avec Supabase comme backend invisible et sécurisé.
