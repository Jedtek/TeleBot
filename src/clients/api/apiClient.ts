import type { RequestOptions } from "./apiClientTypes.js";

const defaultOptions: RequestOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
};

class APIClient {
    constructor() {
    }

    async _getURL<Thing>(url: string, options: RequestOptions): Promise<Thing | undefined> {
        try {
            const response = await fetch(url, {
                ...defaultOptions,
                ...options
            });
            const responseJSON: unknown = await response.json();
            return responseJSON as Thing;
        } catch (error) {
            console.log(`getURL HTTP error: ${error}`);
            return undefined;
        }
    }
}

export { APIClient };