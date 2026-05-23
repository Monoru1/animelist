# Animelist

Animelist est une plateforme communautaire anime inspirée de Netflix, Crunchyroll, AniList, Kibo Anime, Plex, Apple TV et des interfaces premium modernes. Le projet n’est plus pensé comme une simple bibliothèque anime : l’objectif est de le faire évoluer vers **Anime OS**, une expérience streaming communautaire next-gen, immersive, mobile-first, scalable et cinématique.

Le site est connecté à Supabase pour l’authentification, la base de données, le stockage des affiches, les règles de sécurité RLS et les Edge Functions d’import automatique de métadonnées.

## État actuel

Le site est fonctionnel et déployé sur Netlify. Les utilisateurs interagissent uniquement via l’interface du site : ils ne doivent pas aller dans Supabase. L’admin gère les contenus, les utilisateurs et la modération depuis l’interface web.

Dernière direction produit validée : passage en **Mode Next-Gen / Évolution Massive** avec une refonte progressive vers une vraie app anime premium, inspirée de Kibo Anime, Netflix, Crunchyroll, AniList, Plex, Steam UI, Apple TV et Active Theory.

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

### Anime Data Engine

Services ajoutés ou en cours de structuration :

```txt
src/services/anime/
  anilist.ts
  jikan.ts
  kitsu.ts          # prévu
  tmdb.ts           # prévu
  metadata.ts       # prévu
  recommendations.ts# prévu
  trending.ts       # prévu
  sync-engine.ts    # prévu
```

Déjà ajouté :

- `src/services/anime/anilist.ts`
  - GraphQL AniList.
  - Trending anime.
  - Popular anime.
  - Search anime.
  - Metadata : score, popularité, saison, épisodes, genres, covers HD, banners HD.

- `src/services/anime/jikan.ts`
  - Recherche anime.
  - Top anime.
  - Saisons actuelles.
  - Metadata : synopsis, score, épisodes, trailer, studios, genres, images.

Objectif du moteur :

- enrichir automatiquement les fiches anime ;
- récupérer tendances ;
- récupérer saisons ;
- récupérer recommandations ;
- récupérer planning ;
- récupérer trailers ;
- récupérer ratings ;
- récupérer studios ;
- récupérer relations entre animes ;
- synchroniser intelligemment les données.

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

Évolution V2 prévue :

- immense bannière immersive ;
- overlay noir/violet ;
- score animé ;
- trailer ;
- genres stylisés ;
- studios ;
- personnages ;
- recommandations similaires ;
- relations anime ;
- statistiques communautaires ;
- effet Netflix / Apple TV.

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

Évolution prévue :

- playlists publiques/privées ;
- pages playlists détaillées ;
- partage ;
- likes ;
- sauvegardes ;
- tendances playlists.

### Administration

- Page `/admin`.
- L’entrée Admin est masquée aux utilisateurs non-admin.
- La route admin redirige les utilisateurs non-admin vers la bibliothèque.
- L’admin peut voir les animés et les utilisateurs.
- Suppression d’anime avec raison de modération.
- Envoi d’une notification à l’utilisateur concerné.
- Journalisation dans `moderation_logs`.

Évolution prévue :

- dashboard statistiques ;
- derniers ajouts ;
- contenus signalés ;
- utilisateurs récents ;
- logs propres ;
- filtres ;
- recherche ;
- actions rapides.

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

À renforcer :

- rate limiting ;
- validation de liens ;
- sanitation input ;
- protection spam ;
- protection upload ;
- modération communauté ;
- report system.

### Responsive et design

- Direction artistique sombre/violette premium.
- Inspiration Netflix / Crunchyroll / Kibo Anime.
- Carrousels horizontaux type streaming.
- Cards avec hover desktop.
- Layout responsive pour desktop, tablette et mobile.
- Correction globale de plusieurs problèmes d’overflow horizontal.
- Support mobile avec `viewport-fit=cover`, theme color et `apple-touch-icon`.

Évolution Next-Gen :

- bottom navigation mobile ;
- gestures ;
- swipe transitions ;
- preload intelligent ;
- sensation app native ;
- transitions de pages premium ;
- micro-interactions ;
- glow effects ;
- overlays dynamiques ;
- gradients cinématiques ;
- blur premium.

### Composants premium ajoutés

- `src/components/ui/SectionHeader.tsx`
  - titres de sections premium ;
  - badges ;
  - sous-titres ;
  - usage prévu sur Home, Library, profils, playlists.

- `src/components/anime/AnimeSpotlightCard.tsx`
  - cards anime immersives ;
  - score pill ;
  - gradient overlay ;
  - metadata ;
  - fallback poster ;
  - version communautaire `CommunityAnimeCard`.

Important : Framer Motion a été temporairement retiré du `package.json` pour éviter la casse Netlify tant que `pnpm-lock.yaml` n’est pas régénéré. Les animations actuelles doivent rester en CSS natif jusqu’à régénération propre du lockfile.

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
- Design system custom : surfaces, cards, boutons, responsive, carrousels, spotlight cards

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

### APIs anime prévues

- AniList API : priorité principale pour tendances, saisons, recommandations, relations, personnages, studios, stats, planning.
- Jikan API : fallback metadata MyAnimeList.
- TMDB API : posters HD, backgrounds HD, trailers, assets premium.
- Kitsu API : catégories, tags, metadata complémentaires.

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

Attention : Netlify utilise `pnpm install` avec frozen lockfile. Toute dépendance ajoutée dans `package.json` doit être accompagnée d’un `pnpm-lock.yaml` régénéré. Sinon, le build échoue avec `ERR_PNPM_OUTDATED_LOCKFILE`.

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

## Modèle de données Next-Gen prévu

À ajouter progressivement :

- `anime_sources`
- `episode_sources`
- `source_languages`
- `source_quality`
- `source_reports`
- `comments`
- `reviews`
- `follows`
- `playlist_likes`
- `anime_metadata_cache`
- `anime_trending_cache`
- `anime_schedule_cache`
- `user_activity`
- `premium_entitlements`

## Système sources streaming prévu

Architecture cible :

```txt
Anime
 └── Saison
      └── Langue
            └── Qualité
                  └── Source
```

Fonctionnalités prévues :

- switch source dynamique ;
- switch langue ;
- switch qualité ;
- fallback source automatique ;
- détection liens morts ;
- badges qualité source ;
- report system ;
- modération admin.

Important légal : ne pas contourner les protections, pubs, DRM ou systèmes anti-abus de plateformes tierces. Les sources doivent être modérées, signalables, et idéalement légales, autorisées ou embeddables.

## Lecteur vidéo premium prévu

- HLS.js ;
- auto next ;
- sauvegarde progression ;
- skip intro ;
- vitesse lecture ;
- fullscreen ;
- Picture-in-Picture ;
- qualité adaptive ;
- sous-titres ;
- preview timeline ;
- mini player ;
- mode cinéma.

## Home Page Cinematic prévue

La `LibraryPage` doit évoluer vers une vraie Home streaming avec :

- hero anime tendance fullscreen ;
- background vidéo/trailer si possible ;
- overlay sombre Netflix ;
- bouton Regarder ;
- bouton Playlist ;
- infos anime ;
- transitions automatiques ;
- tendances ;
- récemment ajoutés ;
- anime du jour ;
- top communauté ;
- repris récemment ;
- recommandations ;
- populaires cette semaine ;
- nouveautés saisonnières ;
- playlists populaires.

## Roadmap prioritaire

1. Corriger tout build Netlify avant chaque feature.
2. Refaire `LibraryPage` en Home Cinematic.
3. Ajouter bottom navigation mobile.
4. Créer `AnimeDetailPage` V2 avec metadata riches.
5. Créer profils publics `/u/:username`.
6. Créer playlists publiques.
7. Ajouter tendances réelles via AniList + cache Supabase.
8. Ajouter recommandations simples par genre, favoris, historique.
9. Ajouter système reports/sources streaming.
10. Ajouter planning anime premium.
11. Ajouter skeleton loading, empty states, toasts modernes.
12. Ajouter système premium/monétisation.

## Vision produit

Animelist doit devenir **Anime OS** : une plateforme anime communautaire next-gen où les utilisateurs peuvent rapidement partager des animés trouvés sur différents sites, centraliser leurs liens, construire des playlists publiques, reprendre leur historique, découvrir les tendances, suivre d’autres profils, recevoir des recommandations intelligentes et vivre une expérience proche d’une vraie app native.

L’objectif n’est pas de laisser les utilisateurs manipuler la base de données : tout doit être géré depuis l’interface web, avec Supabase comme backend invisible et sécurisé.

Le rendu attendu doit faire :

- application réelle ;
- streaming premium ;
- cinématique ;
- communautaire ;
- scalable ;
- addictif ;
- mobile-first ;
- professionnel.
