import type { ProjectLink } from './portfolio.schemas.js';

const GITHUB = 'https://github.com/Megitsune14';

export const PORTFOLIO_PROJECT_SEED = [
  {
    title: { en: 'Portfolio', fr: 'Portfolio' },
    description: {
      en: 'My personal portfolio with live Spotify, Riot and Discord stats, plus a private Nexus back-office dashboard.',
      fr: 'Mon portfolio personnel avec stats live Spotify, Riot et Discord, plus un back-office privé Nexus.',
    },
    techStack: {
      en: `Backend : Node.js, Hono, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
      fr: `Backend : Node.js, Hono, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
    },
    url: 'https://megitsune.xyz',
    links: [
      { label: { en: 'Website', fr: 'Site web' }, url: 'https://megitsune.xyz' },
      { label: { en: 'GitHub', fr: 'GitHub' }, url: `${GITHUB}/Portfolio` },
    ] satisfies ProjectLink[],
    order: 0,
  },
  {
    title: { en: 'Zone-Debrid', fr: 'Zone-Debrid' },
    description: {
      en: 'Web application that optimizes downloads through intelligent webscraping of Zone Téléchargement with integration of the Alldebrid API to automatically debrid all protected links.',
      fr: "Application web qui optimise les téléchargements via du webscraping intelligent de Zone Téléchargement avec intégration de l'API Alldebrid pour débrider automatiquement tous les liens protégés.",
    },
    techStack: {
      en: `Backend : Node.js, Express, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
      fr: `Backend : Node.js, Express, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
    },
    url: 'https://zone-debrid.megitsune.xyz/',
    links: [
      { label: { en: 'Website', fr: 'Site web' }, url: 'https://zone-debrid.megitsune.xyz/' },
      { label: { en: 'GitHub', fr: 'GitHub' }, url: `${GITHUB}/Zone-Debrid` },
    ] satisfies ProjectLink[],
    order: 1,
  },
  {
    title: { en: 'MyDNS', fr: 'MyDNS' },
    description: {
      en: 'Local alternative to Pi-hole / AdGuard Home, self-hosted DNS filtering server for homelab.',
      fr: 'Alternative locale à Pi-hole / AdGuard Home, serveur de filtrage DNS self-hosted pour homelab.',
    },
    techStack: {
      en: `Backend : Node.js, Hono, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
      fr: `Backend : Node.js, Hono, TypeScript
Frontend : React, TypeScript, Vite, Tailwind`,
    },
    url: `${GITHUB}/MyDNS`,
    links: [{ label: { en: 'GitHub', fr: 'GitHub' }, url: `${GITHUB}/MyDNS` }] satisfies ProjectLink[],
    order: 2,
  },
  {
    title: { en: 'Jinx', fr: 'Jinx' },
    description: {
      en: 'Innovative Discord bot inspired by the iconic Jinx character from League of Legends, offering multifunctional features enriched with an immersive RPG system based on the captivating universe of the Arcane series.',
      fr: "Bot Discord innovant inspiré du personnage emblématique Jinx de League of Legends, offrant des fonctionnalités multifonctionnelles enrichies d'un système RPG immersif basé sur l'univers captivant de la série Arcane.",
    },
    techStack: {
      en: `Backend : TypeScript, Discord.js
Frontend : In Progress`,
      fr: `Backend : TypeScript, Discord.js
Frontend : En cours`,
    },
    url: 'https://discord.com/users/megitsune14',
    links: [
      {
        label: { en: 'Discord Support', fr: 'Support Discord' },
        url: 'https://discord.com/users/megitsune14',
      },
    ] satisfies ProjectLink[],
    order: 3,
  },
];

export const PORTFOLIO_SOCIAL_SEED = [
  {
    name: { en: 'Discord', fr: 'Discord' },
    username: { en: 'megitsune14', fr: 'megitsune14' },
    url: 'https://discord.com/users/megitsune14',
    order: 0,
  },
  {
    name: { en: 'GitHub', fr: 'GitHub' },
    username: { en: 'Megitsune14', fr: 'Megitsune14' },
    url: 'https://github.com/Megitsune14',
    order: 1,
  },
  {
    name: { en: 'Spotify', fr: 'Spotify' },
    username: { en: 'Music & Playlists', fr: 'Musique & Playlists' },
    url: 'https://open.spotify.com/user/31tnhkxqxn5gwjigyqh5tatdq54q',
    order: 2,
  },
  {
    name: { en: 'Battle.net', fr: 'Battle.net' },
    username: { en: 'Megitsune#21299', fr: 'Megitsune#21299' },
    order: 3,
  },
  {
    name: { en: 'League of Legends', fr: 'League of Legends' },
    username: { en: 'Megitsune#0014', fr: 'Megitsune#0014' },
    order: 4,
  },
  {
    name: { en: 'TikTok', fr: 'TikTok' },
    username: { en: '@megitsune14', fr: '@megitsune14' },
    url: 'https://www.tiktok.com/@megitsune14',
    order: 5,
  },
  {
    name: { en: 'Twitch', fr: 'Twitch' },
    username: { en: 'megitsune14', fr: 'megitsune14' },
    url: 'https://www.twitch.tv/megitsune14',
    order: 6,
  },
  {
    name: { en: 'YouTube', fr: 'YouTube' },
    username: { en: 'megitsune14', fr: 'megitsune14' },
    url: 'https://www.youtube.com/channel/UCDVYLZnHoiofQU9QVfLfcSg',
    order: 7,
  },
  {
    name: { en: 'Mangacollec', fr: 'Mangacollec' },
    username: { en: 'megitsune14', fr: 'megitsune14' },
    url: 'https://www.mangacollec.com/user/megitsune14/collection',
    order: 8,
  },
  {
    name: { en: 'Epic Games', fr: 'Epic Games' },
    username: { en: 'Megitsune14', fr: 'Megitsune14' },
    order: 9,
  },
];

export async function seedPortfolioData() {
  const { replaceAllProjects } = await import('./project.repository.js');
  const { replaceAllSocialLinks } = await import('./social.repository.js');

  await replaceAllProjects(PORTFOLIO_PROJECT_SEED);
  await replaceAllSocialLinks(PORTFOLIO_SOCIAL_SEED);

  return {
    projects: PORTFOLIO_PROJECT_SEED.length,
    social: PORTFOLIO_SOCIAL_SEED.length,
  };
}
