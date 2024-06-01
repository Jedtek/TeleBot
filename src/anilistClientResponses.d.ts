export type AniListMediaJSON = {
    data: {
        Media: {
            id: number;
            title: {
                english: string;
                native: string;
            }
            coverImage: {
                medium: string;
            }
            siteUrl: string;
            averageScore: number;
            genres: Array<string>;
            isAdult: boolean;
            tags: Array<{name: string}>;
            episodes: number;
            duration: number;
            type: string;
        }
    }
}
 
export type AniListRecommendationJSON = {
    data: {
        Recommendation: {
            id: number;
        }
    }
}

export type AniListMediaJSONResponse = {
    data?: AniListMediaJSON,
    errors?: Array<{ message: string }>
}

export type AniListRecommendationJSONResponse = {
    data?: AniListRecommendationJSON,
    errors?: Array<{ message: string }>   
}
