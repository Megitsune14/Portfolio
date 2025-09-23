import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpotifyResponse, SpotifyRecentlyPlayedResponse } from '../types/index';
import { spotifyCache } from '../utils/cache';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UPDATE_INTERVAL = 10000; // 10 seconds
const PROGRESS_UPDATE_INTERVAL = 1000; // 1 second for artificial progress

export const useSpotifyStats = (userId?: string | null) => {
    const [data, setData] = useState<SpotifyResponse | null>(null);
    const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentlyPlayedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRecentlyPlayed, setIsLoadingRecentlyPlayed] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const endTrackTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recentlyPlayedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTrackIdRef = useRef<string | null>(null);

    // Fonction utilitaire pour comparer les données Spotify
    const areSpotifyDataEqual = useCallback((data1: SpotifyResponse | null, data2: SpotifyResponse | null): boolean => {
        if (!data1 || !data2) return data1 === data2;

        return (
            data1.name === data2.name &&
            data1.artist === data2.artist &&
            data1.album === data2.album &&
            data1.isPlaying === data2.isPlaying &&
            data1.authenticated === data2.authenticated &&
            data1.message === data2.message &&
            Math.abs((data1.progress || 0) - (data2.progress || 0)) < 1000 && // Tolérance de 1 seconde
            data1.duration === data2.duration
        );
    }, []);

    const fetchCurrentlyPlaying = useCallback(async (): Promise<SpotifyResponse | null> => {
        if (!userId) {
            return null;
        }

        try {
            const response = await fetch(`${API_BASE}/spotify/currently-playing/${userId}`);
            const result = await response.json();
            console.log('Spotify data fetched:', result);
            const spotifyData = result.success ? result.data : null;

            // Ajouter un identifiant unique basé sur le nom et l'artiste
            if (spotifyData && spotifyData.name && spotifyData.artist) {
                spotifyData.trackId = `${spotifyData.name}-${spotifyData.artist}`;
            }

            return spotifyData;
        } catch (error) {
            console.error('Error fetching currently playing:', error);
            return null;
        }
    }, [userId]);

    const fetchRecentlyPlayed = useCallback(async (limit: number = 3): Promise<SpotifyRecentlyPlayedResponse | null> => {
        if (!userId) {
            return null;
        }

        try {
            setIsLoadingRecentlyPlayed(true);
            const response = await fetch(`${API_BASE}/spotify/recently-played/${userId}?limit=${limit}`);
            const result = await response.json();
            console.log('Recently played data fetched:', result);
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error fetching recently played:', error);
            return null;
        } finally {
            setIsLoadingRecentlyPlayed(false);
        }
    }, [userId]);


    const formatTime = useCallback((milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Démarrer/arrêter le timer de progression
    const stopProgressTimer = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (endTrackTimerRef.current) {
            clearTimeout(endTrackTimerRef.current);
            endTrackTimerRef.current = null;
        }
    }, []);

    // Nettoyer le timeout des recently played
    const clearRecentlyPlayedTimeout = useCallback(() => {
        if (recentlyPlayedTimeoutRef.current) {
            clearTimeout(recentlyPlayedTimeoutRef.current);
            recentlyPlayedTimeoutRef.current = null;
        }
    }, []);

    // Fonction pour mettre à jour les recently played avec délai
    const updateRecentlyPlayedWithDelay = useCallback((delay: number = 2000) => {
        clearRecentlyPlayedTimeout();
        recentlyPlayedTimeoutRef.current = setTimeout(() => {
            fetchRecentlyPlayed(3).then(recentData => {
                if (recentData) {
                    setRecentlyPlayed(recentData);
                }
            });
        }, delay);
    }, [fetchRecentlyPlayed, clearRecentlyPlayedTimeout]);

    // Fonction pour mettre à jour la progression artificiellement
    const updateProgress = useCallback(() => {
        setData(prevData => {
            if (!prevData || !prevData.isPlaying || !prevData.progress || !prevData.duration) {
                return prevData;
            }

            const newProgress = prevData.progress + 1000; // Ajouter 1 seconde

            // Si on dépasse la durée, arrêter la progression
            if (newProgress >= prevData.duration) {
                stopProgressTimer(); // Arrêter le timer
                const updatedData = {
                    ...prevData,
                    progress: prevData.duration,
                    isPlaying: false
                };

                // Mettre à jour le cache avec les nouvelles données
                if (userId) {
                    spotifyCache.set(userId, updatedData);
                }

                return updatedData;
            }

            const updatedData = {
                ...prevData,
                progress: newProgress
            };

            // Mettre à jour le cache avec la nouvelle progression
            if (userId) {
                spotifyCache.set(userId, updatedData);
            }

            return updatedData;
        });
    }, [stopProgressTimer, userId]);

    const startProgressTimer = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        if (endTrackTimerRef.current) {
            clearTimeout(endTrackTimerRef.current);
        }

        progressIntervalRef.current = setInterval(updateProgress, PROGRESS_UPDATE_INTERVAL);
    }, [updateProgress]);

    const scheduleEndTrackFetch = useCallback((currentData: SpotifyResponse, updateStatsFn: (isInitialLoad?: boolean) => Promise<void>) => {
        if (endTrackTimerRef.current) {
            clearTimeout(endTrackTimerRef.current);
        }

        if (currentData.isPlaying && currentData.progress !== undefined && currentData.duration !== undefined) {
            const timeRemaining = currentData.duration - currentData.progress;
            const fetchDelay = Math.max(1000, timeRemaining); // Fetch exactement à la fin de la musique

            console.log(`Scheduling fetch in ${fetchDelay}ms (${Math.round(fetchDelay / 1000)}s - at track end)`);

            endTrackTimerRef.current = setTimeout(() => {
                console.log('Auto-fetching at track end');
                updateStatsFn(false);
            }, fetchDelay);
        }
    }, []);

    const updateStats = useCallback(async (isInitialLoad = false) => {
        if (!userId) {
            setData(null);
            setIsLoading(false);
            stopProgressTimer();
            return;
        }

        try {
            setError(null);

            // Pour le chargement initial, vérifier d'abord le cache
            if (isInitialLoad) {
                const cachedData = spotifyCache.get(userId);
                console.log('Initial load - Cache check:', { userId, hasCachedData: !!cachedData, cacheInfo: spotifyCache.getInfo(userId) || null });
                if (cachedData) {
                    console.log('Using cached data for initial load');
                    setData(cachedData);
                    setIsLoading(false);

                    // Initialiser lastTrackIdRef avec la valeur du cache
                    lastTrackIdRef.current = cachedData.trackId || null;

                    // Programmer le timer si la musique est en cours
                    if (cachedData.isPlaying && cachedData.progress !== undefined && cachedData.duration !== undefined) {
                        startProgressTimer();
                        scheduleEndTrackFetch(cachedData, updateStats);
                    }

                    // Récupérer les données fraîches en arrière-plan
                    const freshData = await fetchCurrentlyPlaying();
                    if (freshData) {
                        const currentTrackId = freshData.trackId || null;
                        const isSameTrack = currentTrackId === lastTrackIdRef.current;
                        const hasStatusChanged = cachedData.isPlaying !== freshData.isPlaying;

                        if (!isSameTrack || hasStatusChanged) {
                            // Il y a eu un changement, mettre à jour
                            if (!isSameTrack) {
                                console.log('Track changed during initial load');
                                lastTrackIdRef.current = currentTrackId;
                            } else if (hasStatusChanged) {
                                console.log('Status changed during initial load');
                            }
                            stopProgressTimer();

                            if (userId) {
                                spotifyCache.set(userId, freshData);
                            }

                            setData(freshData);

                            if (freshData.isPlaying && freshData.progress !== undefined && freshData.duration !== undefined) {
                                startProgressTimer();
                                scheduleEndTrackFetch(freshData, updateStats);
                            }
                        }
                    }
                    return;
                } else {
                    // Pas de cache, on a besoin de charger
                    setIsLoading(true);
                }
            }

            // Récupérer les données fraîches
            const freshData = await fetchCurrentlyPlaying();

            if (freshData) {
                // Vérifier si c'est la même musique
                const currentTrackId = freshData.trackId || null;
                const isSameTrack = currentTrackId === lastTrackIdRef.current;

                // Vérifier les changements de statut (play/pause)
                const cachedData = spotifyCache.get(userId);
                const hasStatusChanged = cachedData && cachedData.isPlaying !== freshData.isPlaying;

                if (isSameTrack && !hasStatusChanged) {
                    // Même musique ET même statut : utiliser le cache et ne pas mettre à jour
                    if (cachedData) {
                        console.log('Same track and status, using cached data');
                        // Vérifier si les données sont vraiment différentes avant de mettre à jour
                        setData(prevData => {
                            if (areSpotifyDataEqual(prevData, cachedData)) {
                                return prevData; // Pas de changement, pas de re-render
                            }
                            return cachedData; // Changement détecté, mettre à jour
                        });
                        return;
                    }
                } else {
                    // Nouvelle musique OU changement de statut : arrêter l'ancien timer et mettre à jour
                    if (!isSameTrack) {
                        console.log('New track detected, updating cache and recently played');
                        lastTrackIdRef.current = currentTrackId;
                        // Mettre à jour les recently played avec un délai pour éviter les conflits
                        updateRecentlyPlayedWithDelay(2000);
                    } else if (hasStatusChanged) {
                        console.log('Status changed (play/pause), updating cache');
                    }
                    stopProgressTimer();
                }

                // Mettre à jour le cache et les données (une seule fois)
                if (userId) {
                    spotifyCache.set(userId, freshData);
                }

                // Vérifier si les données sont vraiment différentes avant de mettre à jour
                setData(prevData => {
                    if (areSpotifyDataEqual(prevData, freshData)) {
                        return prevData; // Pas de changement, pas de re-render
                    }
                    return freshData; // Changement détecté, mettre à jour
                });

                // Gérer le timer de progression
                if (freshData.isPlaying && freshData.progress !== undefined && freshData.duration !== undefined) {
                    // Démarrer le timer immédiatement avec les données récupérées
                    // Le timer partira de la progression réelle de Spotify et avancera seconde par seconde
                    startProgressTimer();
                    // Programmer un fetch automatique quand la musique va se terminer
                    scheduleEndTrackFetch(freshData, updateStats);
                } else {
                    stopProgressTimer();
                }
            } else {
                // Pas de données, arrêter le timer
                stopProgressTimer();
                setData(null);
            }
        } catch (error) {
            console.error('Error updating Spotify stats:', error);
            setError('Failed to fetch Spotify data');
            stopProgressTimer();
        } finally {
            // Mettre isLoading à false seulement si c'était un chargement initial
            if (isInitialLoad) {
                setIsLoading(false);
            }
        }
    }, [fetchCurrentlyPlaying, userId, startProgressTimer, stopProgressTimer, scheduleEndTrackFetch]);

    useEffect(() => {
        if (!userId) {
            setData(null);
            setRecentlyPlayed(null);
            setIsLoading(false);
            stopProgressTimer();
            return;
        }

        // Initial fetch
        updateStats(true);
        
        // Initial fetch of recently played avec un délai pour éviter les conflits
        updateRecentlyPlayedWithDelay(1000);

        // Set up interval for updates
        const interval = setInterval(() => updateStats(false), UPDATE_INTERVAL);

        return () => {
            clearInterval(interval);
            stopProgressTimer();
            clearRecentlyPlayedTimeout();
        };
    }, [updateStats, updateRecentlyPlayedWithDelay, userId, stopProgressTimer, clearRecentlyPlayedTimeout]);

    // Nettoyer les timers quand le composant se démonte
    useEffect(() => {
        return () => {
            stopProgressTimer();
            clearRecentlyPlayedTimeout();
        };
    }, [stopProgressTimer, clearRecentlyPlayedTimeout]);

    return {
        data,
        recentlyPlayed,
        isLoading,
        isLoadingRecentlyPlayed,
        error,
        formatTime,
        refetch: updateStats,
        refetchRecentlyPlayed: () => fetchRecentlyPlayed(3).then(recentData => {
            if (recentData) {
                setRecentlyPlayed(recentData);
            }
        }),
    };
};