import TelegramClient from './telegramClient.js';
import config from '../config.json' with { type: "json" };
import Fastify from 'fastify';
console.log(config);
const telegramClient = new TelegramClient(config.telegramUrl, config.telegramToken, config.tokenSecret);
// Check for Webhooks, if not add one! 
await telegramClient.setUpdatesWebhook(config.webhookUrl);
const fastify = Fastify({
    logger: true
});
fastify.post('/incomingUpdate', async (request, reply) => {
    const hash = await telegramClient.getWebhokToken();
    console.log(request.headers);
    console.log(request.body);
    if (request.headers['x-telegram-bot-api-secret-token'] !== hash) {
        throw new Error('Hash Webhook comparison failed, redo webhooks.');
    }
    const update = request.body;
    await telegramClient.processUpdate(update);
});
fastify.get('/', async function handler(request, reply) {
    return { hello: 'world' };
});
try {
    await fastify.listen({ port: 8000 });
}
catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
