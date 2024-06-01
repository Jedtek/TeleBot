import { createHash } from 'crypto';
import { WebhookInfo, Message } from '@grammyjs/types';
import { Update } from '@grammyjs/types';
import KitsuClient from './kitsuClient.js';
import TMDBClient from './tmdbClient.js';

class TelegramClient {
    telegramUrl: string;
    telegramSecret: string;
    webhookSecret: number;
    webhookToken: string;
    
    constructor(url: string, token: string, webhookSecret: number) {
        this.telegramUrl = url;
        this.telegramSecret = token;
        this.webhookSecret = webhookSecret;
        this.webhookToken = '';
    }

    async getWebhokToken(): Promise<string> {
        return this.webhookToken;
    }

    async _buildRequestUrl(command: string): Promise<string> {
        return this.telegramUrl + this.telegramSecret + '/' + command;
    }

    async _generateSecretToken(): Promise<string> {
        this.webhookToken = createHash('sha256').update(this.webhookSecret.toString()).digest('hex');
        return this.webhookToken;
    }

    async _checkForWebhook(): Promise<boolean> {
        try {
            const url: string = await this._buildRequestUrl('getWebhookInfo');
            const response = await fetch(url);
            //const data = await response.json() as Promise<{ data: WebhookInfo  }>;
            const data: any = await response.json();
            console.log(data);
            if(data.url === '') {
                console.log('bing');
                return false;
            }
            return true;
        } catch (error) {
            console.log('Get WebhookInfo error: ', error);
        }
        return false;
    }

    async setUpdatesWebhook(url: string): Promise<boolean> {
        if(await this._checkForWebhook() === false) {
            return false;
        }

        const hash = await this._generateSecretToken();
        const webhookOptions = {
            secret_token: hash,
            url,
        };

        try {
            const url: string = await this._buildRequestUrl('setWebhook');
            const webhookResponse = await fetch(url, {
                method: 'post',
                body: JSON.stringify(webhookOptions),
                headers: { 'Content-Type': 'application/json' }
            });
            const webhookReturn: any = await webhookResponse.json();

            console.log(webhookReturn);
            if(webhookReturn.result === true) {
                return true;
            }
            return false;
        } catch (error) {
            console.log('Set Webhook error: ', error);
        }
        
        return true;
    }

    async getUpdates(): Promise<false | JSON> {
        try {
            const url:string = await this._buildRequestUrl('getUpdates');
            const response = await fetch(url);
            const data = await response.json();

            return data as Promise<JSON>;
        } catch(error) {
            console.log('Get updates error: ', error);
        }
        return false;
    }

    async sendMessage(message: string, chatId: number): Promise<Boolean> {
        const url:string = await this._buildRequestUrl('sendMessage');
        const body = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        };

        const chatResponse = await fetch(url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {'Content-Type': 'application/json'}
        });
        const chatReturn = await chatResponse.json();

        console.log(chatReturn);
        return true;
    }

    async processUpdate(update: Update): Promise<boolean> {
        if (typeof update.update_id === 'number') {
            if (typeof update.message.chat.id === 'number') {
                // Commands
                if (update.message.text === '/recommend_anime') {
                    const kitsuClient = new KitsuClient();
                    const anime: string = await kitsuClient.getRandomAnime();
                    await this.sendMessage(anime, update.message.chat.id);
                } else if (update.message.text === '/recommend_movie') {
                    const tmdbClient = new TMDBClient();
                    const movie: string = await tmdbClient.getRandomMovie();
                    await this.sendMessage(movie, update.message.chat.id);
                } else {
                    await this.sendMessage(update.message.text, update.message.chat.id);
                }
                return true;
            } else {
                return true; // Future.
            }
        } else {
            return false;
        }
    }
};

export default TelegramClient;