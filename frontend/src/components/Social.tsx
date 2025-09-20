import { socialLinks } from '../data/constants';
import battleNetLogo from '../assets/logos/battle-net.png';
import riotLogo from '../assets/logos/riot-games.png';

const Social = () => {
  const getIcon = (icon: string) => {
    if (icon === 'battlenet') {
      return <img src={battleNetLogo} alt="Battle.net" className="w-8 h-8 object-contain" />;
    }
    if (icon === 'riot') {
      return <img src={riotLogo} alt="Riot Games" className="w-8 h-8 object-contain" />;
    }
    return <i className={`${icon} text-2xl`}></i>;
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      discord: 'bg-discord/20 text-discord hover:border-discord hover:bg-discord/30',
      github: 'bg-gray-800/20 text-gray-300 hover:border-gray-300 hover:bg-gray-800/30',
      spotify: 'bg-spotify/20 text-spotify hover:border-spotify hover:bg-spotify/30',
      battlenet: 'bg-battlenet/20 text-battlenet hover:border-battlenet hover:bg-battlenet/30',
      riot: 'bg-red-500/20 text-red-400 hover:border-red-400 hover:bg-red-500/30',
      tiktok: 'bg-pink-500/20 text-pink-400 hover:border-pink-400 hover:bg-pink-500/30',
      twitch: 'bg-twitch/20 text-twitch hover:border-twitch hover:bg-twitch/30',
      youtube: 'bg-red-600/20 text-red-400 hover:border-red-400 hover:bg-red-600/30',
      mangacollec: 'bg-jinx/20 text-jinx hover:border-jinx hover:bg-jinx/30'
    };
    return colorMap[color] || 'bg-white/10 text-light hover:border-light hover:bg-white/20';
  };

  return (
    <section id="social" className="py-24 bg-darker">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 gradient-text">My Social Networks</h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target={link.url !== '#' ? "_blank" : undefined}
              rel={link.url !== '#' ? "noopener noreferrer" : undefined}
              className={`group glass-effect rounded-3xl p-4 sm:p-6 flex items-center gap-4 sm:gap-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-jinx/20 ${getColorClasses(link.color)}`}
              title={link.url === '#' ? link.username : undefined}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                {getIcon(link.icon)}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1">{link.name}</h3>
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
