type RequestOptions = {
    method: string;
    headers: {
        'Content-Type'?: string;
        'Accept'?: string;
        'Authorization'?: string;
    }
};

export type { RequestOptions };