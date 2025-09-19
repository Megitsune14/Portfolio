// Riot Stats Manager Class
export class RiotStatsManager {
    constructor() {
        this.apiBase = 'https://megitsune.xyz/api';
        this.region = 'euw';
        this.gameName = 'Megitsune';
        this.tag = '0014';
        this.updateInterval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        this.isUpdating = false;
        this.lastUpdate = null;
        this.nextUpdate = null;
    }

    async fetchRiotStats() {
        try {
            const response = await fetch(`${this.apiBase}/riot/${this.region}/${this.gameName}/${this.tag}`);
            const data = await response.json();
            console.log('Riot stats fetched:', data);
            return data;
        } catch (error) {
            console.error('Error fetching Riot stats:', error);
            return null;
        }
    }

    formatTier(tier) {
        if (!tier) return 'Unranked';
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    }

    formatWinRate(winRate) {
        if (!winRate) return 'N/A';
        return winRate;
    }

    formatWinLoss(winLoss) {
        if (!winLoss) return 'N/A';
        return winLoss;
    }

    formatLP(lp) {
        if (!lp) return 'N/A';
        return lp;
    }

    updateRiotDisplay(data) {
        const riotStatus = document.getElementById('riot-status');
        const riotRank = document.getElementById('riot-rank');
        const riotLP = document.getElementById('riot-lp');
        const riotWinLoss = document.getElementById('riot-winloss');
        const riotWinRate = document.getElementById('riot-winrate');
        const riotLevel = document.getElementById('riot-level');
        const riotChampion = document.getElementById('riot-champion');
        const riotMastery = document.getElementById('riot-mastery');
        const riotLastUpdate = document.getElementById('riot-last-update');
        const riotNextUpdate = document.getElementById('riot-next-update');

        if (!data) {
            riotStatus.textContent = 'Connection Error';
            riotRank.textContent = 'Unable to fetch data';
            if (riotLP) riotLP.textContent = 'N/A';
            if (riotWinLoss) riotWinLoss.textContent = 'N/A';
            if (riotWinRate) riotWinRate.textContent = 'N/A';
            if (riotLevel) riotLevel.textContent = 'N/A';
            if (riotChampion) riotChampion.textContent = 'N/A';
            if (riotMastery) riotMastery.textContent = 'N/A';
            return;
        }

        // Update basic info
        if (riotStatus) riotStatus.textContent = 'Connected';
        if (riotLevel) riotLevel.textContent = data.summoner?.level || 'N/A';

        // Update rank info
        if (data.rank?.rank) {
            const rankData = data.rank.rank;
            if (riotRank) riotRank.textContent = this.formatTier(rankData.tier);
            if (riotLP) riotLP.textContent = this.formatLP(rankData.lp);
            if (riotWinLoss) riotWinLoss.textContent = this.formatWinLoss(rankData.winLoss);
            if (riotWinRate) riotWinRate.textContent = this.formatWinRate(rankData.winRate);
        } else {
            if (riotRank) riotRank.textContent = 'Unranked';
            if (riotLP) riotLP.textContent = 'N/A';
            if (riotWinLoss) riotWinLoss.textContent = 'N/A';
            if (riotWinRate) riotWinRate.textContent = 'N/A';
        }

        // Update mastery info
        if (data.topMastery) {
            if (riotChampion) riotChampion.textContent = data.topMastery.championName || 'N/A';
            if (riotMastery) {
                const masteryPoints = data.topMastery.masteryPoints?.toLocaleString() || 'N/A';
                const masteryLevel = data.topMastery.masteryLevel || 'N/A';
                riotMastery.textContent = `${masteryPoints} pts (Level ${masteryLevel})`;
            }
        } else {
            if (riotChampion) riotChampion.textContent = 'N/A';
            if (riotMastery) riotMastery.textContent = 'N/A';
        }

        // Update timestamps
        if (riotLastUpdate) {
            this.lastUpdate = new Date();
            riotLastUpdate.textContent = this.lastUpdate.toLocaleString();
        }

        if (riotNextUpdate) {
            this.nextUpdate = new Date(this.lastUpdate.getTime() + this.updateInterval);
            riotNextUpdate.textContent = this.nextUpdate.toLocaleString();
        }
    }

    async updateStats() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const data = await this.fetchRiotStats();
            this.updateRiotDisplay(data);
        } catch (error) {
            console.error('Error updating Riot stats:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    startAutoUpdate() {
        // Initial update
        this.updateStats();
        
        // Set up interval for updates (every 3 hours)
        setInterval(() => {
            this.updateStats();
        }, this.updateInterval);

        console.log(`Riot stats will update every ${this.updateInterval / (1000 * 60 * 60)} hours`);
    }

    // Method to manually trigger an update
    async forceUpdate() {
        console.log('Manually triggering Riot stats update...');
        await this.updateStats();
    }
}
