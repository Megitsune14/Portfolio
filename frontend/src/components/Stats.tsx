import { useEffect } from 'react';
import { useSpotifyStats } from '../hooks/useSpotifyStats';
import { useRiotStats } from '../hooks/useRiotStats';
import { useDiscordProfile } from '../hooks/useDiscordProfile';
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
  const {
    data: discordData,
    isLoading: discordLoading,
    error: discordError,
  } = useDiscordProfile();

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

  const formatAccountCreated = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const renderDiscordProfile = () => {
    if (discordLoading && !discordData) {
      return (
        <div className="overflow-hidden rounded-2xl border border-theme">
          <div className="h-[255px] animate-pulse bg-gray-700" />
          <div className="space-y-4 px-6 pb-6 pt-14">
            <div className="h-6 w-48 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-20 animate-pulse rounded-full bg-gray-700" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
      );
    }

    if (discordError || !discordData) {
      return (
        <div className="rounded-2xl border border-theme bg-card/70 px-6 py-8 text-center backdrop-blur-md">
          <p className="text-muted">{discordError ?? 'Discord profile unavailable'}</p>
        </div>
      );
    }

    const d = discordData;

    return (
      <div className="overflow-hidden rounded-2xl border border-theme">
        <div className="relative h-[255px]">
          {d.bannerUrl ? (
            <img src={d.bannerUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full bg-[color-mix(in_oklch,var(--secondary)_72%,transparent)]"
              style={
                d.accentColor
                  ? { backgroundColor: d.accentColor }
                  : undefined
              }
            />
          )}
          <div className="absolute -bottom-14 left-6 sm:-bottom-16 sm:left-8">
            <img
              src={d.avatarUrl}
              alt={d.displayName}
              className="h-28 w-28 rounded-full border-4 border-card object-cover shadow-(--shadow-card) sm:h-36 sm:w-36"
            />
          </div>
        </div>

        <div className="border-t border-theme px-6 pb-6 pt-16 sm:pt-20">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{d.displayName}</p>
              <p className="text-sm text-muted">{d.handle}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-theme bg-card/70 px-4 py-3 backdrop-blur-md">
              <dt className="text-muted">Account created</dt>
              <dd className="font-semibold text-foreground">{formatAccountCreated(d.accountCreatedAt)}</dd>
            </div>
            <div className="rounded-xl border border-theme bg-card/70 px-4 py-3 backdrop-blur-md">
              <dt className="text-muted">Server tag</dt>
              <dd className="font-semibold text-foreground">
                {d.primaryGuildTag ?? '—'}
              </dd>
            </div>
          </dl>

          {d.badges.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-muted">Badges</p>
              <div className="flex flex-wrap gap-2">
                {d.badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="rounded-full border border-[color-mix(in_oklch,var(--primary)_35%,transparent)] bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

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
            <div key={index} className="flex items-center gap-4 rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
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
          <div key={`${track.name}-${track.artist}-${index}`} className="flex items-center gap-4 rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md transition-colors duration-200 hover:bg-white/10">
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
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
              <div className="truncate font-medium text-foreground">{track.name}</div>
              <div className="truncate text-sm text-muted">by {track.artist}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">
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
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Status</span>
            <span className="animate-pulse text-(--primary)">Loading...</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Currently Playing</span>
            <span className="animate-pulse text-(--primary)">Loading...</span>
          </div>
        </div>
      );
    }

    if (!spotifyData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Status</span>
            <span className="text-red-500">Connection Error</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Currently Playing</span>
            <span className="text-red-500">Unable to fetch data</span>
          </div>
        </div>
      );
    }

    if (spotifyData.authenticated === false) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Status</span>
            <span className="text-yellow-500">Not Authenticated</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Currently Playing</span>
            <span className="text-gray">Megitsune is not authentificate</span>
          </div>
        </div>
      );
    }

    if (!spotifyData.isPlaying && spotifyData.message) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Status</span>
            <span className="text-gray">Not Playing</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
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
            <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
              <span className="text-gray">Status</span>
              <span className="text-emerald-600 dark:text-emerald-400">{spotifyData.isPlaying ? 'Now Playing' : 'Paused'}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
              <span className="text-gray">Currently Playing</span>
              <div className="text-right max-w-[60%]">
                <div className="font-semibold text-foreground">{spotifyData.name}</div>
                <div className="text-sm text-muted">by {spotifyData.artist}</div>
              </div>
            </div>
            {spotifyData.progress && spotifyData.duration && (
              <div className="rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
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
            <div className="flex justify-center lg:justify-end shrink-0">
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
            <h4 className="text-lg font-semibold text-foreground">Recently Played</h4>
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
            <div key={index} className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
              <span className="text-gray">{label}</span>
              <span className="animate-pulse text-(--primary)">Loading...</span>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
              <div className="h-3 bg-gray-700 rounded animate-pulse mb-2 w-24"></div>
              <div className="h-5 bg-gray-700 rounded animate-pulse w-12"></div>
            </div>
            <div className="rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
              <div className="h-3 bg-gray-700 rounded animate-pulse mb-2 w-24"></div>
              <div className="h-5 bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          </div>

          {/* Loading for Top 3 Champions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-red-400 text-sm"></i>
              </div>
              <h4 className="text-lg font-semibold text-foreground">Top 3 Champions</h4>
            </div>
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center justify-between rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
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
          <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
            <span className="text-gray">Summoner Level</span>
            <span className="text-red-500">Unable to fetch data</span>
          </div>
        </div>
      );
    }

    const rank = riotData.rank;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
          <span className="text-gray">Summoner Level</span>
          <span className="text-foreground">{riotData.summonerLevel || 'N/A'}</span>
        </div>
        
        <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
          <span className="text-gray">Rank</span>
          <span className="text-foreground">{rank ? formatTier(rank.tier, rank.division) : 'Unranked'}</span>
        </div>

        {rank ? (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
              <span className="text-gray">LP</span>
              <span className="text-foreground">{formatLP(rank.lp)}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-theme bg-card/70 p-4 backdrop-blur-md">
              <span className="text-gray">Win/Loss</span>
              <span className="text-foreground">{formatWinLoss(rank.wins, rank.losses)} ({formatWinRate(rank.winRate)})</span>
            </div>
          </>
        ) : null}

        {/* Totaux sur tous les champions (somme des niveaux et points de maîtrise) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
            <div className="text-xs text-gray mb-1">Total Mastery</div>
            <div className="text-lg font-semibold text-foreground">{riotData.topMastery?.totalLevel?.toLocaleString() ?? 'N/A'}</div>
          </div>
          <div className="rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md">
            <div className="text-xs text-gray mb-1">Total Points</div>
            <div className="text-lg font-semibold text-foreground">{riotData.topMastery?.totalPoints?.toLocaleString() ?? 'N/A'}</div>
          </div>
        </div>

        {/* Top 3 champions les plus maîtrisés (données séparées des totaux globaux) */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-trophy text-red-400 text-sm"></i>
            </div>
            <h4 className="text-lg font-semibold text-foreground">Top 3 Champions</h4>
          </div>

          {riotData.topMastery?.champions?.map((champion, index) => (
            <div key={champion.championId} className="flex items-center justify-between rounded-xl border border-theme bg-card/70 p-3 backdrop-blur-md transition-colors duration-200 hover:bg-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{champion.championName}</div>
                  <div className="text-sm text-muted">Level {champion.masteryLevel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">{champion.masteryPoints.toLocaleString()}</div>
                <div className="text-xs text-muted">points</div>
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
    <section id="stats" className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-14">
      <div className="w-full">
        <div className="text-center mb-16">
          <h2 className="font-jp text-4xl leading-[1.2] pb-1 font-bold gradient-text sm:text-5xl">My Stats</h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--accent))]" />
        </div>
        
        <div className="space-y-8">
          {/* Discord Profile */}
          <div className="surface-panel p-8 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="mb-8 flex items-center gap-6 border-b border-theme pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5865F2]/35 bg-[#5865F2]/18">
                <i className="fab fa-discord text-3xl text-[#5865F2]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Discord</h3>
            </div>
            {renderDiscordProfile()}
          </div>

          {/* Spotify Stats */}
          <div className="surface-panel p-8 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="mb-8 flex items-center gap-6 border-b border-theme pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1DB954]/35 bg-[#1DB954]/18">
                <i className="fab fa-spotify text-3xl text-[#1DB954]"></i>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Spotify</h3>
            </div>
            {renderSpotifyStats()}
          </div>
          
          {/* League of Legends Stats */}
          <div className="surface-panel p-8 transition-transform duration-300 hover:-translate-y-0.5">
            <div className="mb-8 flex items-center gap-6 border-b border-theme pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/16">
                <img src={riotLogo} alt="Riot Games" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">League of Legends</h3>
              {riotData?.icon && (
                <img 
                  src={riotData.icon} 
                  alt="Summoner Icon" 
                  className="ml-auto h-20 w-20 rounded-lg border-2 border-[color-mix(in_oklch,var(--chart-3)_40%,transparent)] transition-colors duration-300 hover:border-(--chart-3)"
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
