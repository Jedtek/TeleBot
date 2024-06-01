import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import config from '../config.json' with { type: "json" };

interface Genre {
    'id': number;
    'name': string;
}

interface Movie {
    'adult': boolean;
    'backdrop_path': string;
    'genre_ids': Array<number>;
    'id': number;
    'original_language': string;
    'original_title': string;
    'overview': string;
    'popularity': number;
    'poster_path': string;
    'release_date': string;
    'title': string;
    'video': boolean;
    'vote_average': number;
    'vote_count': number;
}

interface Movies {
    'results': Array<Movie>
}

class TMDBClient {
    apiUrl: string;
    apiToken: string;
    imageBaseUrl: string;
    pages: number;

    constructor() {
        this.apiUrl = config.apis.tmdb.apiUrl;
        this.apiToken = config.apis.tmdb.token;
        this.imageBaseUrl = config.apis.tmdb.imageBaseUrl;
        this.pages = 5;
    }

    async _formatResponse(movie: Movie, genres: Array<Genre>): Promise<string> {
        let finalGenres: Array<Genre> = [];
        movie.genre_ids.forEach((genre: number) => {
            let genreMatch: Genre = genres.find(g => g.id == genre);
            finalGenres.push(genreMatch);
        });
        return `<b>Random Recent Movie Recommendation!</b>
${this.imageBaseUrl}${movie.backdrop_path}
<b>Name:</b> ${movie.original_title}
<b>Genres:</b> ${finalGenres.map(g => g.name)}
<b>Average Rating:</b> ${movie.vote_average } / 10 (From ${movie.vote_count} votes)
<b>Adult:</b> ${movie.adult === true ? 'Yes' : 'No'}
<b>Release Date:</b> ${movie.release_date.split('-').reverse().join('/')}
<b>Overview:</b>
<em>${movie.overview}</em>
        `;
    }

    async _getURL(url: string): Promise<any | boolean> {
        try {
            const movieResponse = await fetch(url, {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json', 
                    'Authorization': 'Bearer ' + this.apiToken 
                }
            });
            const responseJSON: unknown = await movieResponse.json();
            return responseJSON;
        } catch (error) {
            return false;
        }
    }

    async _getGenres(): Promise<Array<Genre>> {
        const genres = await this._getURL(this.apiUrl + 'genre/movie/list');
        if(genres === false) {
            throw new Error('Failed to get genres');
        }
        return genres.genres;
    }

    async _getMoviePage(page: number, formattedDt: string, thisYear: number): Promise<Movies> {
        return await this._getURL(this.apiUrl + `discover/movie?primary_release_year=${thisYear}&primary_release_date.lte=${formattedDt}&include_adult=true&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`) as Movies;
    }

    async getRandomMovie(): Promise<string> {
        try {
            let dt: DateTime<true> = DateTime.now();
            const formattedDt:string = dt.toFormat('yyyy-LL-dd');
            const thisYear:number = dt.year;
            let movies:Array<Movie> = [];
            for (let page:number = 1; page <= this.pages; page++) {
                let curPage: Movies = await this._getMoviePage(page, formattedDt, thisYear);
                movies = movies.concat(curPage.results);
            }
            if (!movies.length) {
                throw new Error('Failed to get movies data');
            }
            const movie: Movie = movies[Math.floor(Math.random() * movies.length)];
            if(movie) {
                const genres: Array<Genre> = await this._getGenres();
                return await this._formatResponse(movie, genres);
            } else {
                return 'Failed to find a movie';
            }
        } catch (error) {
            return `TMDB API comms error: ${error}`;
        }
    }
}

export default TMDBClient;