interface tmdbGenresJSONResponse {
    'genres': Array<Genre>;
}

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

export { tmdbGenresJSONResponse, Genre, Movie, Movies };

