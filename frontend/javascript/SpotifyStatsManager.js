// Spotify Stats Manager Class
export class SpotifyStatsManager {
    constructor() {
        this.apiBase = 'https://megitsune.xyz/api';
        this.userId = '31tnhkxqxn5gwjigyqh5tatdq54q';
        this.updateInterval = 22000; // 22 seconds
        this.isUpdating = false;
    }

    async fetchCurrentlyPlaying() {
        try {
            const response = await fetch(`${this.apiBase}/spotify/currently-playing/${this.userId}`);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error fetching currently playing:', error);
            return null;
        }
    }

    async checkAuthStatus() {
        try {
            const response = await fetch(`${this.apiBase}/auth/status/${this.userId}`);
            const data = await response.json();
            return data.authenticated;
        } catch (error) {
            console.error('Error checking auth status:', error);
            return false;
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    updateSpotifyDisplay(data) {
        const spotifyStatus = document.getElementById('spotify-status');
        const spotifyTrack = document.getElementById('spotify-track');
        const spotifyProgress = document.getElementById('spotify-progress');
        const spotifyImage = document.getElementById('spotify-image');

        if (!data) {
            spotifyStatus.textContent = 'Connection Error';
            spotifyTrack.textContent = 'Unable to fetch data';
            if (spotifyImage) spotifyImage.style.display = 'none';
            return;
        }

        // Check if user is not authenticated (when API returns this specific response)
        if (data.authenticated === false) {
            spotifyStatus.textContent = 'Not Authenticated';
            spotifyTrack.textContent = 'Megitsune is not authentificate';
            if (spotifyImage) spotifyImage.style.display = 'none';
            return;
        }

        // Check if no track is playing
        if (!data.isPlaying && data.message) {
            spotifyStatus.textContent = 'Not Playing';
            spotifyTrack.textContent = data.message;
            if (spotifyProgress) spotifyProgress.style.display = 'none';
            if (spotifyImage) spotifyImage.style.display = 'none';
            return;
        }

        // Check if we have track data (name and artist)
        if (data.name && data.artist) {
            spotifyStatus.textContent = data.isPlaying ? 'Now Playing' : 'Paused';
            spotifyTrack.innerHTML = `
                <strong>${data.name}</strong><br>
                <span style="color: #ccc;">by ${data.artist}</span>
            `;

            // Update progress bar if available
            if (spotifyProgress && data.progress && data.duration) {
                const progressPercent = (data.progress / data.duration) * 100;
                spotifyProgress.innerHTML = `
                    <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: #57F287; height: 100%; width: ${progressPercent}%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: #999; margin-top: 4px;">
                        <span>${this.formatTime(data.progress)}</span>
                        <span>${this.formatTime(data.duration)}</span>
                    </div>
                `;
                spotifyProgress.style.display = 'block';
            }

            // Update album image in main card if available
            if (spotifyImage && data.image) {
                spotifyImage.innerHTML = `
                    <img src="${data.image}" alt="${data.album}">
                `;
                spotifyImage.style.display = 'flex';
            }
        } else {
            // Fallback if no track data
            spotifyStatus.textContent = 'No Data';
            spotifyTrack.textContent = 'Unable to fetch track information';
            if (spotifyImage) spotifyImage.style.display = 'none';
        }
    }

    async updateStats() {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            const data = await this.fetchCurrentlyPlaying();
            this.updateSpotifyDisplay(data);
        } catch (error) {
            console.error('Error updating Spotify stats:', error);
        } finally {
            this.isUpdating = false;
        }
    }

    startAutoUpdate() {
        // Initial update
        this.updateStats();
        
        // Set up interval for updates
        setInterval(() => {
            this.updateStats();
        }, this.updateInterval);
    }
}
