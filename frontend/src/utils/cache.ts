import type { SpotifyResponse, RiotResponse } from '../types/index';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface CacheConfig {
    spotify: {
        ttl: number; // Time to live in milliseconds
        key: string;
    };
    riot: {
        ttl: number;
        key: string;
    };
}

// Configuration du cache
const CACHE_CONFIG: CacheConfig = {
    spotify: {
        ttl: 2 * 60 * 1000, // 2 minutes pour Spotify (suffisant pour les actualisations de page)
        key: 'spotify_stats'
    },
    riot: {
        ttl: 3 * 60 * 60 * 1000, // 3 heures pour Riot (moins fréquent)
        key: 'riot_stats'
    }
};

// Cache en mémoire
const memoryCache = new Map<string, CacheItem<any>>();

/**
 * Récupère une valeur du cache si elle existe et n'est pas expirée
 */
const get = <T>(key: string): T | null => {
    // Vérifier d'abord le cache en mémoire
    let item = memoryCache.get(key);
    
    // Si pas en mémoire, vérifier sessionStorage
    if (!item) {
        try {
            const stored = sessionStorage.getItem(`cache_${key}`);
            if (stored) {
                item = JSON.parse(stored);
                // Remettre en mémoire pour les accès suivants
                memoryCache.set(key, item as CacheItem<any>);
            }
        } catch (error) {
            console.warn('Error reading from sessionStorage:', error);
        }
    }

    if (!item) {
        return null;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() > item.expiresAt) {
        memoryCache.delete(key);
        try {
            sessionStorage.removeItem(`cache_${key}`);
        } catch (error) {
            console.warn('Error removing from sessionStorage:', error);
        }
        return null;
    }

    return item.data as T;
};

/**
 * Stocke une valeur dans le cache avec un TTL
 */
const set = <T>(key: string, data: T, ttl: number): void => {
    const now = Date.now();
    const item: CacheItem<T> = {
        data,
        timestamp: now,
        expiresAt: now + ttl
    };

    memoryCache.set(key, item);
};

/**
 * Supprime une clé du cache
 */
const deleteKey = (key: string): void => {
    memoryCache.delete(key);
};

/**
 * Vide tout le cache
 */
const clear = (): void => {
    memoryCache.clear();
};

/**
 * Vérifie si une clé existe et n'est pas expirée
 */
const has = (key: string): boolean => {
    const item = memoryCache.get(key);
    return item ? Date.now() <= item.expiresAt : false;
};

/**
 * Récupère les informations sur un élément du cache
 */
const getInfo = (key: string): { timestamp: number; expiresAt: number; isExpired: boolean } | null => {
    const item = memoryCache.get(key);
    if (!item) return null;

    return {
        timestamp: item.timestamp,
        expiresAt: item.expiresAt,
        isExpired: Date.now() > item.expiresAt
    };
};

/**
 * Nettoie les éléments expirés du cache
 */
const cleanup = (): void => {
    const now = Date.now();
    for (const [key, item] of memoryCache.entries()) {
        if (now > item.expiresAt) {
            memoryCache.delete(key);
        }
    }
};

// Cache manager avec arrow functions
export const cacheManager = {
    get,
    set,
    delete: deleteKey,
    clear,
    has,
    getInfo,
    cleanup
};

// Fonctions utilitaires spécifiques pour les statistiques
export const spotifyCache = {
    get: (userId: string): SpotifyResponse | null => {
        return cacheManager.get<SpotifyResponse>(`${CACHE_CONFIG.spotify.key}_${userId}`);
    },

    set: (userId: string, data: SpotifyResponse): void => {
        cacheManager.set(`${CACHE_CONFIG.spotify.key}_${userId}`, data, CACHE_CONFIG.spotify.ttl);
    },

    delete: (userId: string): void => {
        cacheManager.delete(`${CACHE_CONFIG.spotify.key}_${userId}`);
    },

    has: (userId: string): boolean => {
        return cacheManager.has(`${CACHE_CONFIG.spotify.key}_${userId}`);
    },

    getInfo: (userId: string) => {
        return cacheManager.getInfo(`${CACHE_CONFIG.spotify.key}_${userId}`);
    }
};

export const riotCache = {
    get: (): RiotResponse | null => {
        return cacheManager.get<RiotResponse>(CACHE_CONFIG.riot.key);
    },

    set: (data: RiotResponse): void => {
        cacheManager.set(CACHE_CONFIG.riot.key, data, CACHE_CONFIG.riot.ttl);
    },

    delete: (): void => {
        cacheManager.delete(CACHE_CONFIG.riot.key);
    },

    has: (): boolean => {
        return cacheManager.has(CACHE_CONFIG.riot.key);
    },

    getInfo: () => {
        return cacheManager.getInfo(CACHE_CONFIG.riot.key);
    }
};

// Nettoyage automatique du cache toutes les 5 minutes
setInterval(() => {
    cacheManager.cleanup();
}, 5 * 60 * 1000);

export { CACHE_CONFIG };
