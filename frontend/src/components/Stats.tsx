import { useEffect } from 'react';
import { useSpotifyStats } from '../hooks/useSpotifyStats';
import { useRiotStats } from '../hooks/useRiotStats';
import riotLogo from '../assets/logos/riot-games.png';

const Stats = () => {
  // Use a default user ID for now - in production this would come from authentication
  const spotifyUserId = localStorage.getItem('spotify_user_id') || '31tnhkxqxn5gwjigyqh5tatdq54q';
  const { 
    data: spotifyData, 
    recentlyPlayed, 
    isLoading: spotifyLoading, 
    isLoadingRecentlyPlayed,
    formatTime 
  } = useSpotifyStats(spotifyUserId);
  const { 
    data: riotData, 
    isLoading: riotLoading, 
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

  const formatPlayedAt = (playedAt: string): string => {
    const date = new Date(playedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderRecentlyPlayed = () => {
    if (isLoadingRecentlyPlayed) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-4 p-3 glass-effect rounded-xl">
              <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
              </div>
              <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          ))}
        </div>
      );
    }

    if (!recentlyPlayed || !recentlyPlayed.authenticated) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <i className="fas fa-music text-2xl"></i>
          </div>
          <p className="text-gray-400">No recently played tracks</p>
        </div>
      );
    }

    if (!recentlyPlayed.tracks || recentlyPlayed.tracks.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <i className="fas fa-history text-2xl"></i>
          </div>
          <p className="text-gray-400">No recently played tracks found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recentlyPlayed.tracks.map((track, index) => (
          <div key={`${track.name}-${track.artist}-${index}`} className="flex items-center gap-4 p-3 glass-effect rounded-xl hover:bg-white/5 transition-colors duration-200">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              {track.image ? (
                <img 
                  src={track.image} 
                  alt={track.album}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <i className="fas fa-music text-gray-500"></i>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-light truncate">{track.name}</div>
              <div className="text-sm text-gray truncate">by {track.artist}</div>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {track.playedAt ? formatPlayedAt(track.playedAt) : 'Unknown'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCurrentlyPlaying = () => {
    // Afficher le loading seulement si on n'a pas de données ET qu'on est en train de charger
    if (spotifyLoading && !spotifyData) {
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
      <div className="space-y-6">
        {/* Currently Playing Section */}
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
      </div>
    );
  };

  const renderSpotifyStats = () => {
    return (
      <div className="space-y-6">
        {/* Currently Playing Section */}
        {renderCurrentlyPlaying()}

        {/* Recently Played Section - Always visible */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-spotify/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-history text-spotify text-sm"></i>
            </div>
            <h4 className="text-lg font-semibold text-light">Recently Played</h4>
          </div>
          {renderRecentlyPlayed()}
        </div>
      </div>
    );
  };

  const renderRiotStats = () => {
    if (riotLoading) {
      return (
        <div className="space-y-4">
          {['Summoner Level', 'Rank', 'LP', 'Win/Loss', 'Win Rate'].map((label, index) => (
            <div key={index} className="flex justify-between items-center p-4 glass-effect rounded-2xl">
              <span className="text-gray">{label}</span>
              <span className="text-jinx animate-pulse">Loading...</span>
            </div>
          ))}
          {/* Loading for Top 3 Champions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-red-400 text-sm"></i>
              </div>
              <h4 className="text-lg font-semibold text-light">Top 3 Champions</h4>
            </div>
            
            {/* Loading for totals */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 glass-effect rounded-xl">
                <div className="h-3 bg-gray-700 rounded animate-pulse mb-2 w-16"></div>
                <div className="h-5 bg-gray-700 rounded animate-pulse w-12"></div>
              </div>
              <div className="p-3 glass-effect rounded-xl">
                <div className="h-3 bg-gray-700 rounded animate-pulse mb-2 w-20"></div>
                <div className="h-5 bg-gray-700 rounded animate-pulse w-16"></div>
              </div>
            </div>
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center justify-between p-3 glass-effect rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse mb-2 w-24"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-1 w-16"></div>
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!riotData) {
      return (
        <div className="space-y-4">
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
          <span className="text-gray">Summoner Level</span>
          <span className="text-light">{riotData.summonerLevel || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Rank</span>
          <span className="text-light">{riotData.rank ? formatTier(riotData.rank.tier, riotData.rank.division) : 'Unranked'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">LP</span>
          <span className="text-light">{riotData.rank ? formatLP(riotData.rank.lp) : 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 glass-effect rounded-2xl">
          <span className="text-gray">Win/Loss</span>
          <span className="text-light">{riotData.rank ? formatWinLoss(riotData.rank.wins, riotData.rank.losses) : 'N/A'} ({riotData.rank ? formatWinRate(riotData.rank.winRate) : 'N/A'})</span>
        </div>
        
        {/* Top 3 Champions */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-trophy text-red-400 text-sm"></i>
            </div>
            <h4 className="text-lg font-semibold text-light">Top 3 Champions</h4>
          </div>
          
          {/* Totaux des Top 3 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 glass-effect rounded-xl">
              <div className="text-xs text-gray mb-1">Total Level</div>
              <div className="text-lg font-semibold text-light">{riotData.topMastery?.totalLevel?.toLocaleString() || 'N/A'}</div>
            </div>
            <div className="p-3 glass-effect rounded-xl">
              <div className="text-xs text-gray mb-1">Total Points</div>
              <div className="text-lg font-semibold text-light">{riotData.topMastery?.totalPoints?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
          
          {riotData.topMastery?.champions?.map((champion, index) => (
            <div key={champion.championId} className="flex items-center justify-between p-3 glass-effect rounded-xl hover:bg-white/5 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-light">{champion.championName}</div>
                  <div className="text-sm text-gray">Level {champion.masteryLevel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-light font-semibold">{champion.masteryPoints.toLocaleString()}</div>
                <div className="text-xs text-gray">points</div>
              </div>
            </div>
          )) || (
            <div className="text-center py-4">
              <div className="text-gray-500 mb-2">
                <i className="fas fa-exclamation-triangle text-xl"></i>
              </div>
              <p className="text-gray-400">No mastery data available</p>
            </div>
          )}
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
