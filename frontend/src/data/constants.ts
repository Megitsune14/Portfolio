import type { SocialLink, Project } from '../types/index';

export const socialLinks: SocialLink[] = [
  {
    name: 'Discord',
    username: 'megitsune14',
    url: 'https://discord.com/users/megitsune14',
    icon: 'fab fa-discord',
    color: 'discord'
  },
  {
    name: 'GitHub',
    username: 'Megitsune14',
    url: 'https://github.com/Megitsune14',
    icon: 'fab fa-github',
    color: 'github'
  },
  {
    name: 'Spotify',
    username: 'Music & Playlists',
    url: 'https://open.spotify.com/user/31tnhkxqxn5gwjigyqh5tatdq54q',
    icon: 'fab fa-spotify',
    color: 'spotify'
  },
  {
    name: 'Battle.net',
    username: 'Megitsune#21299',
    url: '#',
    icon: 'battlenet',
    color: 'battlenet'
  },
  {
    name: 'League of Legends',
    username: 'Megitsune#0014',
    url: '#',
    icon: 'riot',
    color: 'riot'
  },
  {
    name: 'TikTok',
    username: '@megitsune14',
    url: 'https://www.tiktok.com/@megitsune14',
    icon: 'fab fa-tiktok',
    color: 'tiktok'
  },
  {
    name: 'Twitch',
    username: 'megitsune14',
    url: 'https://www.twitch.tv/megitsune14',
    icon: 'fab fa-twitch',
    color: 'twitch'
  },
  {
    name: 'YouTube',
    username: 'megitsune14',
    url: 'https://www.youtube.com/channel/UCDVYLZnHoiofQU9QVfLfcSg',
    icon: 'fab fa-youtube',
    color: 'youtube'
  },
  {
    name: 'Mangacollec',
    username: 'megitsune14',
    url: 'https://www.mangacollec.com/user/megitsune14/collection',
    icon: 'fas fa-book',
    color: 'mangacollec'
  }
];

export const projects: Project[] = [
  {
    title: 'Zone-Debrid',
    description: 'Web application that optimizes downloads through intelligent webscraping of Zone Téléchargement with integration of the Alldebrid API to automatically debrid all protected links.',
    tags: [],
    techStack: {
      backend: ['Node.js', 'Express', 'TypeScript'],
      frontend: ['React', 'TypeScript', 'Vite', 'Tailwind']
    },
    links: {
      repository: 'https://github.com/Megitsune14/Zone-Debrid',
      app: 'https://zone-debrid.megitsune.xyz'
    },
    icon: 'fas fa-download'
  },
  {
    title: 'Jinx',
    description: 'Innovative Discord bot inspired by the iconic Jinx character from League of Legends, offering multifunctional features enriched with an immersive RPG system based on the captivating universe of the Arcane series.',
    tags: [],
    techStack: {
      backend: ['TypeScript', 'Discord.js'],
      frontend: ['In Progress']
    },
    links: {
      support: 'https://discord.gg/Q6yztF4rFG'
    },
    icon: 'fas fa-robot'
  }
];
