import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import config from '../config.json' with { type: "json" };
class TMDBClient {
    apiUrl;
    apiToken;
    imageBaseUrl;
    pages;
    constructor() {
        this.apiUrl = 'https://api.themoviedb.org/3/';
        this.apiToken = config.apis.tmdb.token;
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500/';
        this.pages = 5;
    }
    async _formatResponse(movie, genres) {
        let finalGenres = [];
        movie.genre_ids.forEach((genre) => {
            let genreMatch = genres.find(g => g.id == genre);
            finalGenres.push(genreMatch);
        });
        return `<b>Random Recent Movie Recommendation!</b>
${this.imageBaseUrl}${movie.backdrop_path}
<b>Name:</b> ${movie.original_title}
<b>Genres:</b> ${finalGenres.map(g => g.name)}
<b>Average Rating:</b> ${movie.vote_average} / 10 (From ${movie.vote_count} votes)
<b>Adult:</b> ${movie.adult === true ? 'Yes' : 'No'}
<b>Release Date:</b> ${movie.release_date.split('-').reverse().join('/')}
<b>Overview:</b>
<em>${movie.overview}</em>
        `;
    }
    async _getURL(url) {
        try {
            const movieResponse = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.apiToken
                }
            });
            const responseJSON = await movieResponse.json();
            return responseJSON;
        }
        catch (error) {
            return false;
        }
    }
    async _getGenres() {
        const genres = await this._getURL(this.apiUrl + 'genre/movie/list');
        if (genres === false) {
            throw new Error('Failed to get genres');
        }
        return genres.genres;
    }
    async _getMoviePage(page, formattedDt, thisYear) {
        return await this._getURL(this.apiUrl + `discover/movie?primary_release_year=${thisYear}&primary_release_date.lte=${formattedDt}&include_adult=true&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`);
    }
    async getRandomMovie() {
        try {
            let dt = DateTime.now();
            const formattedDt = dt.toFormat('yyyy-LL-dd');
            const thisYear = dt.year;
            let movies = [];
            for (let page = 1; page <= this.pages; page++) {
                let curPage = await this._getMoviePage(page, formattedDt, thisYear);
                movies = movies.concat(curPage.results);
            }
            if (!movies.length) {
                throw new Error('Failed to get movies data');
            }
            const movie = movies[Math.floor(Math.random() * movies.length)];
            if (movie) {
                const genres = await this._getGenres();
                return await this._formatResponse(movie, genres);
            }
            else {
                return 'Failed to find a movie';
            }
        }
        catch (error) {
            return `TMDB API comms error: ${error}`;
        }
    }
}
export default TMDBClient;
