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
- Hero dynamique.
- Sections anime.
- Trending anime.
- Popular anime.
- Spotlight cards.
- Anime detail page.
- Metadata enrichies.
- WatchPlayer interne.
- Épisodes générés automatiquement.
- Sources par épisode.
- Source pack global avec `{episode}` et `{ep2}`.
- Support VF / VOSTFR / qualité.
- Support iframe / video directe / HLS côté données.

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

# Watch Player V3

Route :

```txt
/watch/:animeId
```

Le player est le coeur du produit.

Fonctionnalités en place :

- lecteur interne ;
- sidebar épisodes ;
- épisodes auto-générés ;
- historique ;
- progression ;
- source switcher ;
- langue VF / VOSTFR ;
- qualité ;
- miniatures ;
- mode fallback cinématique ;
- bouton épisode précédent ;
- bouton épisode suivant ;
- support source pack global.

## Source Pack

Le système permet de préparer plusieurs épisodes à partir d’une seule URL modèle :

```txt
https://cdn.exemple.com/anime/episode-{episode}.mp4
https://cdn.exemple.com/anime/ep-{ep2}.m3u8
```

`{episode}` devient :

```txt
1, 2, 3, 4...
```

`{ep2}` devient :

```txt
01, 02, 03, 04...
```

Le player crée ensuite les sources dans `episode_sources` pour chaque épisode disponible.

Important :
les boutons `Regarder` doivent ouvrir le lecteur interne.

---

# Architecture streaming

Tables actuelles / prévues :

- anime_episodes
- episode_sources
- watch_progress
- source_reports
- anime_cache
- streaming_cache
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
