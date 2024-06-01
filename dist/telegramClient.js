import { createHash } from 'crypto';
import KitsuClient from './kitsuClient.js';
import TMDBClient from './tmdbClient.js';
class TelegramClient {
    telegramUrl;
    telegramSecret;
    webhookSecret;
    webhookToken;
    constructor(url, token, webhookSecret) {
        this.telegramUrl = url;
        this.telegramSecret = token;
        this.webhookSecret = webhookSecret;
        this.webhookToken = '';
    }
    async getWebhokToken() {
        return this.webhookToken;
    }
    async _buildRequestUrl(command) {
        return this.telegramUrl + this.telegramSecret + '/' + command;
    }
    async _generateSecretToken() {
        this.webhookToken = createHash('sha256').update(this.webhookSecret.toString()).digest('hex');
        return this.webhookToken;
    }
    async _checkForWebhook() {
        try {
            const url = await this._buildRequestUrl('getWebhookInfo');
            const response = await fetch(url);
            //const data = await response.json() as Promise<{ data: WebhookInfo  }>;
            const data = await response.json();
            console.log(data);
            if (data.url === '') {
                console.log('bing');
                return false;
            }
            return true;
        }
        catch (error) {
            console.log('Get WebhookInfo error: ', error);
        }
        return false;
    }
    async setUpdatesWebhook(url) {
        if (await this._checkForWebhook() === false) {
            return false;
        }
        const hash = await this._generateSecretToken();
        const webhookOptions = {
            secret_token: hash,
            url,
        };
        try {
            const url = await this._buildRequestUrl('setWebhook');
            const webhookResponse = await fetch(url, {
                method: 'post',
                body: JSON.stringify(webhookOptions),
                headers: { 'Content-Type': 'application/json' }
            });
            const webhookReturn = await webhookResponse.json();
            console.log(webhookReturn);
            if (webhookReturn.result === true) {
                return true;
            }
            return false;
        }
        catch (error) {
            console.log('Set Webhook error: ', error);
        }
        return true;
    }
    async getUpdates() {
        try {
            const url = await this._buildRequestUrl('getUpdates');
            const response = await fetch(url);
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.log('Get updates error: ', error);
        }
        return false;
    }
    async sendMessage(message, chatId) {
        const url = await this._buildRequestUrl('sendMessage');
        const body = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        };
        const chatResponse = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const chatReturn = await chatResponse.json();
        console.log(chatReturn);
        return true;
    }
    async processUpdate(update) {
        if (typeof update.update_id === 'number') {
            if (typeof update.message.chat.id === 'number') {
                // Commands
                if (update.message.text === '/recommend_anime') {
                    const kitsuClient = new KitsuClient();
                    const anime = await kitsuClient.getRandomAnime();
                    await this.sendMessage(anime, update.message.chat.id);
                }
                else if (update.message.text === '/recommend_movie') {
                    const tmdbClient = new TMDBClient();
                    const movie = await tmdbClient.getRandomMovie();
                    await this.sendMessage(movie, update.message.chat.id);
                }
                else {
                    await this.sendMessage(update.message.text, update.message.chat.id);
                }
                return true;
            }
            else {
                return true; // Future.
            }
        }
        else {
            return false;
        }
    }
}
;
export default TelegramClient;
