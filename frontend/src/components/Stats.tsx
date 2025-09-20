import { useEffect } from 'react';
import { useSpotifyStats } from '../hooks/useSpotifyStats';
import { useRiotStats } from '../hooks/useRiotStats';
import riotLogo from '../assets/logos/riot-games.png';

const Stats = () => {
  // Use a default user ID for now - in production this would come from authentication
  const spotifyUserId = localStorage.getItem('spotify_user_id') || '31tnhkxqxn5gwjigyqh5tatdq54q';
  const { data: spotifyData, isLoading: spotifyLoading, formatTime } = useSpotifyStats(spotifyUserId);
  const { 
    data: riotData, 
    isLoading: riotLoading, 
    lastUpdate, 
    nextUpdate,
    formatTier,
    formatWinRate,
    formatWinLoss,
    formatLP
  } = useRiotStats();

  // Handle URL parameters for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const error = urlParams.get('error');
    const userIdParam = urlParams.get('userId');
    
    if (authStatus === 'success') {
      // Store the userId if provided
      if (userIdParam) {
        localStorage.setItem('spotify_user_id', userIdParam);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('Spotify auth error:', error);
      // Show error message to user
      alert(`Spotify authentication error: ${error}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const renderSpotifyStats = () => {
    if (spotifyLoading) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-jinx animate-pulse">Loading...</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Currently Playing</span>
            <span className="text-jinx animate-pulse">Loading...</span>
          </div>
        </div>
      );
    }

    if (!spotifyData) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-red-500">Connection Error</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Currently Playing</span>
            <span className="text-red-500">Unable to fetch data</span>
          </div>
        </div>
      );
    }

    if (spotifyData.authenticated === false) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-yellow-500">Not Authenticated</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Currently Playing</span>
            <span className="text-gray">Megitsune is not authentificate</span>
          </div>
        </div>
      );
    }

    if (!spotifyData.isPlaying && spotifyData.message) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-gray">Not Playing</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Currently Playing</span>
            <span className="text-gray">{spotifyData.message}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="space-y-4 flex-1 lg:max-w-[85%]">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-vert">{spotifyData.isPlaying ? 'Now Playing' : 'Paused'}</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Currently Playing</span>
            <div className="text-right max-w-[60%]">
              <div className="font-semibold text-light">{spotifyData.name}</div>
              <div className="text-sm text-gray">by {spotifyData.artist}</div>
            </div>
          </div>
          {spotifyData.progress && spotifyData.duration && (
            <div className="p-4 glass-effect rounded-2xl">
              <div className="bg-gray-800 h-1 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-vert h-full transition-all duration-300"
                  style={{ width: `${(spotifyData.progress / spotifyData.duration) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray">
                <span>{formatTime(spotifyData.progress)}</span>
                <span>{formatTime(spotifyData.duration)}</span>
              </div>
            </div>
          )}
        </div>
        
        {spotifyData.image && (
          <div className="flex justify-center lg:justify-end flex-shrink-0">
            <img 
              src={spotifyData.image} 
              alt={spotifyData.album}
              className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </div>
    );
  };

  const renderRiotStats = () => {
    if (riotLoading) {
      return (
        <div className="space-y-4">
          {['Status', 'Summoner Level', 'Rank', 'LP', 'Win/Loss', 'Win Rate', 'Top Champion', 'Mastery Points'].map((label, index) => (
            <div key={index} className="flex justify-between items-center p-4 glass-effect rounded-2xl">
              <span className="text-gray">{label}</span>
              <span className="text-jinx animate-pulse">Loading...</span>
            </div>
          ))}
        </div>
      );
    }

    if (!riotData) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Status</span>
            <span className="text-red-500">Connection Error</span>
          </div>
          <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
            <span className="text-gray">Summoner Level</span>
            <span className="text-red-500">Unable to fetch data</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Status</span>
          <span className="text-vert">Connected</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Summoner Level</span>
          <span className="text-light">{riotData.summonerLevel || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Rank</span>
          <span className="text-light">{riotData.rank ? formatTier(riotData.rank.tier) : 'Unranked'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">LP</span>
          <span className="text-light">{riotData.rank ? formatLP(riotData.rank.lp) : 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Win/Loss</span>
          <span className="text-light">{riotData.rank ? formatWinLoss(riotData.rank.wins, riotData.rank.losses) : 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Win Rate</span>
          <span className="text-light">{riotData.rank ? formatWinRate(riotData.rank.winRate) : 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Top Champion</span>
          <span className="text-light">{riotData.topMastery?.championName || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Mastery Points</span>
          <span className="text-light">
            {riotData.topMastery ? 
              `${riotData.topMastery.masteryPoints?.toLocaleString() || 'N/A'} pts (Level ${riotData.topMastery.masteryLevel || 'N/A'})` 
              : 'N/A'
            }
          </span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Last Update</span>
          <span className="text-light">{lastUpdate ? lastUpdate.toLocaleString() : 'Never'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Next Update</span>
          <span className="text-light">{nextUpdate ? nextUpdate.toLocaleString() : 'Calculating...'}</span>
        </div>
      </div>
    );
  };

  return (
    <section id="stats" className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 gradient-text">My Stats</h2>
          <div className="w-24 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </div>
        
        <div className="space-y-8">
          {/* Spotify Stats */}
          <div className="glass-effect rounded-3xl p-8 hover-lift transition-all duration-300">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="w-16 h-16 bg-spotify/20 rounded-2xl flex items-center justify-center">
                <i className="fab fa-spotify text-3xl text-spotify"></i>
              </div>
              <h3 className="text-2xl font-bold text-light">Spotify</h3>
            </div>
            {renderSpotifyStats()}
          </div>
          
          {/* League of Legends Stats */}
          <div className="glass-effect rounded-3xl p-8 hover-lift transition-all duration-300">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <img src={riotLogo} alt="Riot Games" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-light">League of Legends</h3>
              {riotData?.icon && (
                <img 
                  src={riotData.icon} 
                  alt="Summoner Icon" 
                  className="w-20 h-20 rounded-lg border-2 border-jinx/30 hover:border-jinx transition-colors duration-300 ml-auto"
                />
              )}
            </div>
            {renderRiotStats()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
