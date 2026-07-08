# Megitsune — Portfolio

Portfolio personnel full stack de **Megitsune** : site vitrine public et tableau de bord privé **Nexus** pour gérer le contenu et suivre des stats en temps réel.

## Vue d'ensemble

Le projet est découpé en deux parties :

- **`frontend/`** — Application React (Vite) avec interface publique et espace Nexus
- **`backend/`** — API REST (Hono + MongoDB) qui alimente le portfolio et les intégrations externes

## Site public

Page one-page bilingue (FR / EN) avec :

- **Hero** — Présentation et photo de profil
- **Projets** — Cartes avec stack technique et liens
- **Réseaux sociaux** — Liens configurables
- **Stats live** — Discord, Spotify et League of Legends

Thème clair / sombre, design responsive, référencement SEO (meta tags, Open Graph, données structurées).

## Nexus (privé)

Espace d'administration accessible après authentification :

- Gestion des projets et liens sociaux
- Analytics des visiteurs
- Intégration Spotify (sync, tops, statut)

## Backend & intégrations

L'API expose notamment :

| Module | Rôle |
|--------|------|
| **Portfolio** | Projets, liens sociaux, assets |
| **Spotify** | Écoute en cours, historique, synchronisation |
| **Riot / LoL** | Stats League of Legends |
| **Discord** | Statut et présence |
| **Nexus** | Auth, visiteurs, config |

Les données Spotify et Riot sont synchronisées en arrière-plan via des schedulers.

## Stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router

**Backend** — Hono, TypeScript, MongoDB, Zod

## Structure

```
Portfolio/
├── frontend/     # Site + Nexus (React)
├── backend/      # API (Hono)
└── package.json  # Scripts dev / build à la racine
```
