# Animelist — Prompt mémoire projet

Tu reprends le projet **Animelist**.

## Vision

Animelist doit devenir **Anime OS** : une plateforme anime communautaire next-gen inspirée de Netflix, Crunchyroll, AniList, Plex, Apple TV, Steam UI, Active Theory et Kibo Anime.

Le projet doit donner une sensation :

- streaming platform ;
- app mobile native ;
- expérience cinématique ;
- consommation anime immédiate.

Ce n’est plus un simple CRUD anime.

## Stack actuelle

Frontend :
- React 19
- TypeScript
- Vite 8
- React Router
- TanStack Query
- Zustand
- Tailwind CSS v4
- Radix UI
- Lucide React

Backend :
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- RLS
- Edge Functions

Déploiement :
- Netlify
- Build : `pnpm build`
- Publish : `dist`

## Règles critiques

1. Toujours garder README.md et Prompt.md à jour après chaque évolution importante.
2. Ne jamais changer `package.json` sans synchroniser `pnpm-lock.yaml`.
3. Netlify utilise frozen lockfile.
4. Toujours penser mobile-first.
5. Ne jamais exposer aux viewers la logique technique des sources.
6. Le viewer doit uniquement : regarder, continuer, ajouter, explorer.
7. Le bouton `Regarder` doit ouvrir `/watch/:animeId`.
8. Le player ne doit pas ressembler à un panneau admin.
9. Les formulaires source doivent être déplacés dans `/admin`.
10. Toujours prévoir des fallbacks d’image.
11. Toujours commit les mises à jour mémoire projet.
12. Ne pas contourner DRM/paywalls/protections externes.

## État actuel

### Déjà présent

- Auth inscription / connexion Supabase.
- Login/Register premium mobile-first.
- Profils.
- Rôles admin/user.
- Bibliothèque publique.
- Ajout anime.
- Edge Function `anime-metadata`.
- Services AniList + Jikan.
- Favoris.
- Historique.
- Continue watching côté données.
- Playlist utilisateur.
- Notifications.
- Home cinematic initiale.
- WatchPlayer interne.
- Episodes auto-générés.
- Sidebar épisodes.
- Labels propres : `VF`, `VOSTFR`, `VF / VOSTFR`.
- Qualité : HD / 720p / 1080p / SD.
- Gestion source pack côté admin.
- Responsive global fortement renforcé.
- Bottom nav mobile.
- Safe-area mobile.
- Overflow-x sécurisé.
- Anime detail cinematic.
- Spotlight cards.
- Community cards.
- Topbar desktop premium.
- Drawer mobile fullscreen.
- Notifications badge.
- Navigation modernisée.

## Navigation actuelle

### Desktop

- topbar sticky glassmorphism ;
- logo Animelist ;
- nav centrale ;
- actions utilisateur ;
- bouton admin conditionnel ;
- notifications unread.

### Mobile

- topbar compacte ;
- hamburger ;
- drawer fullscreen ;
- bottom nav ;
- safe-area iOS/Android.

La sidebar legacy ne doit plus être utilisée.

## WatchPlayer actuel

Route :

```txt
/watch/:animeId
```

Le WatchPlayer est maintenant une vraie page viewer.

### Fonctionnalités

- iframe/video intégrés ;
- sidebar épisodes ;
- épisode précédent/suivant ;
- historique ;
- watch progress ;
- fallback cinématique ;
- source switcher propre ;
- responsive mobile ;
- dark cinematic UI.

### Important

Le formulaire source a été retiré du player viewer.

La gestion des sources est déplacée dans `/admin`.

## Source Pack Admin

L’admin peut générer des épisodes automatiquement avec :

```txt
{episode}
{ep2}
```

Exemples :

```txt
https://cdn.exemple.com/anime/episode-{episode}.mp4
https://cdn.exemple.com/anime/ep-{ep2}.m3u8
```

Le système crée ensuite les lignes dans `episode_sources`.

## Architecture streaming cible

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

## Responsive direction

Le site doit ressembler à une vraie app streaming.

### Priorités

- topbar premium ;
- drawer mobile ;
- bottom nav ;
- spacing tablette ;
- hero responsive ;
- cards immersives ;
- scroll horizontal propre ;
- cinematic layout ;
- app feeling.

### Correctifs déjà faits

- overflow horizontal sécurisé ;
- width/min-width sécurisés ;
- auth responsive ;
- player mobile amélioré ;
- safe-area iOS/Android ;
- grilles sécurisées ;
- boutons full-width mobile ;
- topbar responsive ;
- drawer responsive.

## Pages importantes

- `/library`
- `/watch/:animeId`
- `/anime/:animeId`
- `/favorites`
- `/history`
- `/my-playlist`
- `/profile`
- `/admin`

## Inspiration UI

### Netflix
- Hero fullscreen.
- Continue watching.
- Rangées horizontales.
- Lecture immédiate.
- App mobile feeling.

### Crunchyroll
- Browse anime.
- Watchlist.
- UI anime-first.
- Simulcasts.

### AniList
- Metadata riches.
- Scores.
- Relations.
- Recommandations.

### Kibo Anime
- Homepage dense.
- Catalogue déjà rempli.
- Beaucoup de contenu visible.
- Immersion immédiate.

## Priorités actuelles

1. Homepage fullscreen Netflix.
2. Continue watching visuel.
3. Catalogue massif.
4. Recommandations dynamiques.
5. Hero autoplay.
6. Transitions premium.
7. Mobile app feeling.
8. Stabilisation WatchPlayer.
9. Import metadata massif.
10. Responsive finalisation.
11. Navigation premium.

## Ton attendu

Quand les connecteurs sont disponibles :
- agir directement sur GitHub ;
- faire des commits propres ;
- limiter les longs discours ;
- priorité au produit réel.
