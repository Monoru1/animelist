# Animelist

Animelist est une plateforme communautaire anime inspirée de Netflix, Crunchyroll, AniList, Kibo Anime, Plex, Apple TV et des interfaces premium modernes.

Le projet évolue désormais vers :

```txt
Anime OS
```

Une plateforme anime immersive, communautaire, mobile-first et cinématique.

---

# Vision

Le but n’est plus de faire une simple bibliothèque anime.

L’objectif est maintenant de construire :

- une vraie homepage streaming ;
- un watch player intégré ;
- un système de playlists ;
- un moteur communautaire ;
- une expérience Netflix / Crunchyroll ;
- une app anime moderne.

Inspirations officielles :

- Netflix
- Crunchyroll
- AniList
- Kibo Anime
- Plex
- Steam UI
- Apple TV
- Active Theory

---

# Stack

## Frontend

- React 19
- TypeScript
- Vite 8
- React Router
- TanStack Query
- Zustand
- Tailwind CSS v4
- Radix UI
- Lucide React

## Backend

- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase RLS
- Supabase Edge Functions

## Déploiement

- Netlify
- pnpm

---

# APIs anime

## Déjà intégrées

- AniList API
- Jikan API

## Futures APIs

- Kitsu API
- TMDB API

Utilisation :

- tendances ;
- recommandations ;
- saisons ;
- metadata ;
- posters ;
- covers ;
- studios ;
- genres ;
- popularité ;
- synopsis.

---

# Fonctionnalités déjà présentes

- Auth complète.
- Profils utilisateurs.
- Rôles admin/user.
- Bibliothèque publique.
- Ajout d’anime.
- Favoris.
- Historique.
- Continue watching.
- Playlist utilisateur.
- Notifications.
- Responsive de base.
- Hero dynamique.
- Sections anime.
- Trending anime.
- Popular anime.
- Spotlight cards.
- Anime detail page.
- Metadata enrichies.

---

# Responsive Direction

Le responsive doit maintenant se rapprocher fortement de :

- Netflix mobile ;
- Crunchyroll tablette ;
- applications streaming natives.

Priorités :

- bottom navigation ;
- top bar compacte ;
- spacing tablette ;
- hero responsive ;
- scroll horizontal premium ;
- cards immersives ;
- cinematic layout ;
- app native feeling.

---

# Watch Player V2

À construire :

```txt
/watch/:animeId
```

Fonctionnalités prévues :

- lecteur intégré ;
- sidebar épisodes ;
- historique ;
- progression ;
- continue watching ;
- recommandations ;
- autoplay ;
- fullscreen ;
- mode cinéma.

Important :
les boutons `Regarder` doivent ouvrir le lecteur interne.

---

# Architecture streaming prévue

Tables futures :

- anime_sources
- anime_episodes
- episode_sources
- watch_progress
- source_reports
- comments
- reviews
- follows
- playlist_likes

Architecture cible :

```txt
Anime
 └── Saison
      └── Episode
           └── Langue
                └── Qualité
                     └── Source
```

---

# Home Cinematic

La homepage doit devenir :

- immersive ;
- dense ;
- cinématique ;
- streaming-first.

Sections prévues :

- Hero fullscreen ;
- Tendances ;
- Populaires ;
- Nouveautés ;
- Continue Watching ;
- Top communauté ;
- Recommandations ;
- Playlist publiques ;
- Simulcasts.

---

# Prompt mémoire projet

Le fichier :

```txt
Prompt.md
```

contient toute la mémoire centrale du projet :

- vision ;
- architecture ;
- responsive ;
- watch system ;
- APIs ;
- roadmap ;
- UX ;
- règles ;
- structure.

Si une conversation saute :

- recopier Prompt.md ;
- reprendre immédiatement le développement.

---

# Installation

```bash
git clone https://github.com/Monoru1/animelist.git
cd animelist
pnpm install
pnpm dev
```

---

# Build

```bash
pnpm build
```

---

# Important Netlify

Netlify utilise frozen lockfile.

Donc :

si `package.json` change,
il faut aussi commit `pnpm-lock.yaml`.

Sinon le build casse.

---

# Variables d’environnement

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# Objectif final

Construire une plateforme anime immersive, communautaire et moderne capable d’évoluer vers un véritable Anime Streaming OS.
