class TelegramHTTPServer {
    fastify = null;
    hostname;
    port;
    constructor(host, port) {
        this.port = port;
        this.hostname = host;
    }
}
export default TelegramHTTPServer;
