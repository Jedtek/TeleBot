import fetch from 'node-fetch';
class AniListClient {
    apiUrl;
    constructor() {
        this.apiUrl = 'https://graphql.anilist.co';
    }
    async _formatResponse(response) {
        return `
            Random Anime Recommendation!
            Name: ${response.data.Media.title.english}
            Name (JP): ${response.data.Media.title.native}
            Link: ${response.data.Media.siteUrl}
            Average Score: ${response.data.Media.averageScore}
            Genres: ${response.data.Media.genres.join(',')}
            Adult: ${response.data.Media.isAdult ? 'Yes' : 'No'}
            Tags: ${response.data.Media.tags.map(x => x.name).join(', ')}
            Episodes: ${response.data.Media.episodes}
        `;
    }
    async _getReccomendation() {
        const recommendation = this._getReccomendation();
        let query = `
            query (rating_greater) { # Define which variables will be used in the query (id)
            Recommendation (type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                    id
                }
            }
        `;
        try {
            const animeResponse = await fetch(this.apiUrl, {
                method: 'post',
                body: JSON.stringify({
                    query: query
                }),
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
            const animeReturn = await animeResponse.json();
            console.log(JSON.stringify(animeReturn));
            return animeReturn.data.data.Recommendation.id;
        }
        catch (error) {
            console.log('AniList API comms error: ', error);
        }
    }
    async getRandomAnime() {
        const recommendationId = await this._getReccomendation();
        let query = `
            query ($id: Int) { # Define which variables will be used in the query (id)
            Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
                    id
                    title {
                        english
                        native
                    }
                    coverImage {
                        medium
                    }
                    siteUrl
                    averageScore
                    genres
                    isAdult
                    tags {
                        name
                    }
                    episodes
                    duration
                    type
                }
            }
        `;
        let options = {
            id: recommendationId
        };
        try {
            const animeResponse = await fetch(this.apiUrl, {
                method: 'post',
                body: JSON.stringify({
                    query: query,
                    variables: options
                }),
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });
            const animeReturn = await animeResponse.json();
            console.log(JSON.stringify(animeReturn));
            return await this._formatResponse(animeReturn.data);
        }
        catch (error) {
            console.log('AniList API comms error: ', error);
        }
    }
}
export default AniListClient;
