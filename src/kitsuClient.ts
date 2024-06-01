import fetch from 'node-fetch';
import config from '../config.json' with { type: "json" };

class KitsuClient {
    apiUrl: string;

    constructor() {
        this.apiUrl = config.apis.kitsu.apiUrl;
    }

    async _formatResponse(anime: any, genres: any): Promise<string> {
        return `<b>Random Anime Recommendation!</b>
${anime.data.attributes.posterImage.medium}
<b>Name:</b> ${anime.data.attributes.titles.en_jp}
<b>Name (JP):</b> ${anime.data.attributes.titles.ja_jp}
<b>Genres:</b> ${genres.data.map(x => x.attributes.name).join(', ')}
<b>Average Rating:</b> ${anime.data.attributes.averageRating} / 100
<b>Age Guide:</b> ${anime.data.attributes.ageRatingGuide}
<b>Episodes:</b> ${anime.data.attributes.episodeCount}
<b>Synopsis:</b>
<em>${anime.data.attributes.synopsis}</em>
        `;
    }

    async _getRandID(): Promise<number> {
        return Math.floor(Math.random() * 50) + 1;
    }

    async _getURL(url: string): Promise<any | boolean> {
        try {
            const animeResponse = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/vnd.api+json' }
            });
            const responseJSON: any = await animeResponse.json();
            return responseJSON;
        } catch (error) {
            return false;
        }        
    }

    async _getAnimeGenres(url: string): Promise<any> {
        return await this._getURL(url);
    }

    async getRandomAnime(): Promise<string> {
        try {
            const anime = await this._getURL(this.apiUrl + await this._getRandID());
            if(anime === false) {
                throw new Error('Failed to get anime');
            }
            const genres = await this._getAnimeGenres(anime.data.relationships.genres.links.related);
            if(genres === false) {
                throw new Error('Failed to get genres');
            }
            return await this._formatResponse(anime, genres);
        } catch (error) {
            return `Kitsu API comms error: ${error}`;
        }
    }
}

export default KitsuClient;