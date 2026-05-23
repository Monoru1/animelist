# Animelist — Prompt mémoire projet

Tu reprends le projet **Animelist**.

## Vision

Animelist doit devenir **Anime OS** : une plateforme anime communautaire next-gen inspirée de Netflix, Crunchyroll, AniList, Plex, Apple TV, Steam UI, Active Theory et Kibo Anime.

Ce n’est pas un simple CRUD anime. C’est une app streaming communautaire moderne, mobile-first, immersive, scalable, cinématique, avec playlists, historique, profils, recommandations et lecteur intégré.

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

1. Toujours garder le README à jour après une grosse modification.
2. Ne pas ajouter de dépendance sans mettre à jour `pnpm-lock.yaml`.
3. Netlify utilise frozen lockfile : si package.json change sans lockfile, le build casse.
4. Le site doit rester mobile-first.
5. Ne pas afficher aux utilisateurs les détails techniques de récupération des animés.
6. L’utilisateur doit juste voir une vraie plateforme : regarder, ajouter, playlist, favoris, continuer.
7. Ne jamais laisser de cartes noires sans image : toujours fallback poster.
8. Le bouton `Regarder` doit ouvrir une page `/watch/:animeId`, pas rediriger brutalement vers une plateforme externe.
9. Ne pas contourner DRM, protections, paywalls ou systèmes anti-abus. Utiliser uniquement des liens fournis par l’utilisateur, embeds autorisés, HLS légitime ou sources partageables/modérées.

## État actuel

Fonctionnalités déjà présentes :
- Auth inscription / connexion Supabase.
- Profils avec pseudo, email, avatar optionnel.
- Rôles user/admin.
- Bibliothèque publique.
- Ajout anime depuis titre + lien.
- Edge Function `anime-metadata` avec AniList + Jikan.
- Favoris.
- Historique / continuer.
- Playlist utilisateur.
- Admin avec modération.
- Notifications.
- Home cinematic initiale.
- Services `anilist.ts` et `jikan.ts`.
- Composants `SectionHeader`, `AnimeSpotlightCard`, `CommunityAnimeCard`.
- Edge Function `anime-catalog-sync`.
- CSP Netlify élargie pour images/frames/media externes.

## Problèmes actuels à corriger en priorité

1. Watch player à créer : `/watch/:animeId`.
2. Les boutons `Regarder` doivent pointer vers `/watch/:animeId`.
3. Mobile à améliorer fortement : plus proche Netflix/Crunchyroll.
4. Header mobile trop gros : il faut privilégier une bottom nav et une top bar compacte.
5. Hero à rendre plus propre sur mobile/tablette.
6. Homepage doit ressembler davantage à Netflix/Crunchyroll : rangées horizontales, posters propres, sections denses.
7. Les images doivent toujours avoir un fallback visuel.
8. Ajouter davantage de contenu via APIs et cache Supabase.
9. Ne pas expliquer aux utilisateurs où/comment les animés sont récupérés.
10. Créer système scalable : épisodes, sources, langues, qualités, reports.

## Pages cibles

- `/library` : Home streaming principale.
- `/watch/:animeId` : lecteur intégré.
- `/anime/:animeId` : fiche anime cinematic.
- `/favorites` : favoris.
- `/history` : continuer à regarder.
- `/my-playlist` : playlist utilisateur.
- `/profile` : profil utilisateur.
- `/u/:username` : profil public futur.
- `/playlists` : playlists publiques futur.
- `/admin` : admin/modération.

## Inspiration UI

### Netflix
- Hero large.
- Continue watching.
- Rangées horizontales.
- Progress bars.
- Lecture immédiate.
- Bottom nav mobile.

### Crunchyroll
- Navigation anime-first.
- Browse/simulcast/genres.
- Watchlist.
- Page compte.
- Player anime.
- Orange/accent possible, mais Animelist garde violet/noir.

### AniList
- Metadata riches.
- Scores.
- Genres.
- Relations.
- Recommandations.
- Communauté.

### Kibo Anime
- Expérience dense.
- Beaucoup de contenu visible.
- Catalogue déjà rempli.
- Player intégré.
- Homepage vivante.

## Architecture streaming cible

Tables futures :
- `anime_sources`
- `anime_episodes`
- `episode_sources`
- `source_reports`
- `comments`
- `reviews`
- `follows`
- `playlist_likes`
- `anime_metadata_cache`
- `anime_trending_cache`
- `watch_progress`

Structure cible :

```txt
Anime
 └── Saison
      └── Episode
           └── Langue
                └── Qualité
                     └── Source
```

## Watch Player cible

Créer une page `/watch/:animeId` avec :
- lecteur intégré iframe/video.
- fallback si source impossible.
- bouton ouvrir source externe seulement en secours.
- sidebar épisodes.
- progression.
- historique.
- autoplay futur.
- épisode suivant futur.
- recommandations sous le player.
- ambiance noire cinéma.

## Style attendu

- Noir profond.
- Violet premium.
- Cards cinématiques.
- Posters propres.
- Gradients.
- Blur.
- Hover desktop.
- Scroll horizontal mobile.
- Bottom nav.
- App native feeling.

## Priorité de développement

1. Stabiliser build Netlify.
2. Créer WatchPlayerPage.
3. Modifier tous les boutons Regarder vers `/watch/:animeId`.
4. Améliorer CSS responsive mobile.
5. Ajouter Prompt.md et README à jour.
6. Améliorer Home dense façon Netflix/Crunchyroll.
7. Ajouter cache/catalogue massif.
8. Ajouter profils publics et playlists publiques.

## Ton attendu

Travailler directement sur GitHub quand les connecteurs sont disponibles. Faire des commits propres. Éviter les longs discours. Priorité : code fonctionnel, build stable, UX propre.
