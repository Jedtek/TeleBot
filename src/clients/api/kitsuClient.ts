import { APIClient } from './apiClient.js';
import config from '../../../config.json' with { type: "json" };
import type { kitsuJSONResponse, kitsuJSONGenresResponse } from './kitsuClientTypes';
import type { RequestOptions } from './apiClientTypes';

class KitsuClient extends APIClient {
    apiUrl: string;
    requestOptions: RequestOptions;

    constructor() {
        super();
        this.apiUrl = config.apis.kitsu.apiUrl;
        this.requestOptions = {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json', 
                'Accept': 'application/vnd.api+json',
            }
        };
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

    async _getAnimeGenres(url: string): Promise<kitsuJSONGenresResponse> {
        return await this._getURL<kitsuJSONGenresResponse>(url, this.requestOptions);
    }

    async getRandomAnime(): Promise<string> {
        try {
            const anime = await this._getURL<kitsuJSONResponse>(this.apiUrl + await this._getRandID(), this.requestOptions);
            if(anime === undefined) {
                throw new Error('Failed to get anime');
            }
            const genres: kitsuJSONGenresResponse = await this._getAnimeGenres(anime.data.relationships.genres.links.related);
            if(typeof(genres) === 'undefined') {
                throw new Error('Failed to get genres');
            }
            return await this._formatResponse(anime, genres);
        } catch (error) {
            return `Kitsu API comms error: ${error}`;
        }
    }
}

export default KitsuClient;