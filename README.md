# Animelist

Animelist évolue vers **Anime OS** : une plateforme communautaire anime mobile-first inspirée de Netflix, Crunchyroll, AniList, Kibo Anime, Plex, Apple TV et des interfaces premium modernes.

Objectif : construire une vraie web app anime immersive avec homepage streaming, WatchPlayer interne, playlists, favoris, historique, profils, administration, sources structurées et expérience responsive sérieuse.

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

# État actuel

Fonctionnalités en place :

- Auth complète.
- Pages `/login` et `/register` refaites en UI premium mobile-first.
- Profils utilisateurs.
- Rôles admin/user.
- Bibliothèque publique.
- Ajout d’anime.
- Favoris.
- Historique.
- Continue watching côté données.
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
- Gestion source pack déplacée côté admin.
- Support VF / VOSTFR / VF-VOSTFR.
- Support qualité HD / 720p / 1080p / SD.
- Support iframe / video directe / HLS côté données.
- Responsive global renforcé.
- Overflow horizontal verrouillé.
- Cards stabilisées sur mobile.
- Bottom nav mobile avec safe-area.

---

# APIs anime

Déjà intégrées :

- AniList API
- Jikan API

À renforcer ensuite :

- Kitsu API
- TMDB API si utile
- cache Supabase pour metadata

Utilisation : tendances, recommandations, saisons, metadata, posters, covers, studios, genres, popularité, synopsis.

---

# Watch Player

Route :

```txt
/watch/:animeId
```

Le WatchPlayer est le coeur du produit.

Fonctionnalités actuelles :

- lecteur interne ;
- sidebar épisodes ;
- épisodes auto-générés ;
- historique ;
- progression ;
- source switcher propre ;
- labels propres : `VF`, `VOSTFR`, `VF / VOSTFR` ;
- qualité affichée ;
- miniatures ;
- mode fallback cinématique ;
- épisode précédent ;
- épisode suivant ;
- retour fiche anime.

Important : le WatchPlayer public ne contient plus de formulaire de source. La gestion des sources est déplacée côté admin pour garder une expérience utilisateur propre.

---

# Admin Source Pack

Dans `/admin`, l’admin peut préparer les sources d’un anime.

Le Source Pack permet de générer plusieurs épisodes depuis une seule URL modèle :

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

Les sources sont stockées dans `episode_sources`, pas exposées comme logique principale côté viewer.

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

Règle produit : tous les boutons `Regarder` doivent ouvrir `/watch/:animeId`. Les liens externes legacy ne doivent pas être l’expérience principale.

---

# Responsive

Dernier durcissement responsive :

- `html`, `body`, `#root` verrouillés en `width: 100%` et `overflow-x: hidden` ;
- `box-sizing` global ;
- `min-width: 0` global ;
- paddings responsive ;
- cards plus stables ;
- textes clampés ;
- auth responsive ;
- WatchPlayer mobile amélioré ;
- boutons full-width sur petit mobile ;
- bottom nav avec safe-area ;
- grilles mobile sécurisées.

Objectif : aucune page cassée sur mobile, tablette ou desktop.

---

# Home Cinematic

La homepage doit devenir :

- immersive ;
- dense ;
- cinématique ;
- streaming-first.

Sections cibles :

- Hero fullscreen ;
- Tendances ;
- Populaires ;
- Nouveautés ;
- Continue Watching ;
- Top communauté ;
- Recommandations ;
- Playlists publiques ;
- Simulcasts.

---

# Prompt mémoire projet

Le fichier :

```txt
Prompt.md
```

contient la mémoire centrale du projet. Il doit rester synchronisé avec le README.

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

Si `package.json` change, il faut aussi commit `pnpm-lock.yaml`, sinon le build casse.

---

# Variables d’environnement

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

# Objectif final

Construire une plateforme anime immersive, communautaire et moderne capable d’évoluer vers un véritable Anime Streaming OS : propre sur mobile, solide sur desktop, centrée sur le WatchPlayer, sans redirections inutiles, avec sources structurées et UX startup premium.
