import { socialLinks } from '../data/constants';
import battleNetLogo from '../assets/logos/battle-net.png';
import riotLogo from '../assets/logos/riot-games.png';
import epicGamesLogo from '../assets/logos/epic-games.png';

const Social = () => {
  const getIcon = (icon: string) => {
    if (icon === 'battlenet') {
      return <img src={battleNetLogo} alt="Battle.net" className="w-8 h-8 object-contain" />;
    }
    if (icon === 'riot') {
      return <img src={riotLogo} alt="Riot Games" className="w-8 h-8 object-contain" />;
    }
    if (icon === 'epicgames') {
      return <img src={epicGamesLogo} alt="Epic Games" className="w-8 h-8 object-contain" />;
    }
    return <i className={`${icon} text-2xl`}></i>;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      discord: 'bg-[#7289DA]/18 text-[#3853c8] dark:text-[#8ea1ff] border-[#7289DA]/35 hover:bg-[#7289DA]/26',
      github: 'bg-zinc-500/18 text-zinc-700 dark:text-zinc-300 border-zinc-400/45 dark:border-zinc-300/35 hover:bg-zinc-500/26',
      spotify: 'bg-[#1DB954]/18 text-[#0f8b3f] dark:text-[#48d07f] border-[#1DB954]/35 hover:bg-[#1DB954]/26',
      battlenet: 'bg-[#0070D2]/18 text-[#0052a0] dark:text-[#4ca8ff] border-[#0070D2]/35 hover:bg-[#0070D2]/26',
      riot: 'bg-red-500/18 text-red-600 dark:text-red-300 border-red-400/45 dark:border-red-300/35 hover:bg-red-500/26',
      tiktok: 'bg-pink-500/18 text-pink-600 dark:text-pink-300 border-pink-400/45 dark:border-pink-300/35 hover:bg-pink-500/26',
      twitch: 'bg-[#9146FF]/18 text-[#6f2fd0] dark:text-[#b48bff] border-[#9146FF]/35 hover:bg-[#9146FF]/26',
      youtube: 'bg-red-600/18 text-red-600 dark:text-red-300 border-red-500/45 dark:border-red-300/35 hover:bg-red-600/26',
      mangacollec: 'bg-[color-mix(in_oklch,var(--chart-3)_20%,transparent)] text-[color-mix(in_oklch,var(--chart-3)_68%,black)] dark:text-(--chart-3) border-[color-mix(in_oklch,var(--chart-3)_38%,transparent)] hover:bg-[color-mix(in_oklch,var(--chart-3)_30%,transparent)]',
      epicgames: 'bg-slate-500/18 text-slate-700 dark:text-slate-200 border-slate-400/45 dark:border-slate-300/35 hover:bg-slate-500/26'
    };
    return colorMap[color] || 'bg-white/10 text-foreground border-theme hover:bg-white/20';
  };

  return (
    <section id="social" className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-14">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="font-jp text-4xl leading-[1.2] pb-1 font-bold gradient-text sm:text-5xl">My Social Networks</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target={link.url !== '#' ? "_blank" : undefined}
              rel={link.url !== '#' ? "noopener noreferrer" : undefined}
              className={`focus-ring group flex items-center gap-4 rounded-3xl border p-4 shadow-(--shadow-card) backdrop-blur-md transition-all duration-300 hover:-translate-y-1 sm:gap-6 sm:p-6 ${getColorClasses(link.color)}`}
              title={link.url === '#' ? link.username : undefined}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-current/30 bg-black/10 transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                {getIcon(link.icon)}
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold sm:text-xl">{link.name}</h3>
                <p className="text-xs sm:text-sm opacity-70">{link.username}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Social;
